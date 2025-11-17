<?php
require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use setasign\Fpdi\Fpdi;

// Database connection
$host = 'localhost';
$db   = 'imd';
$user = 'postgres';
$pass = 'sql123T';
$port = '5432';

$conn = pg_connect("host=$host dbname=$db user=$user password=$pass port=$port");
if (!$conn) {
    die("PostgreSQL connection failed.");
}

// Step 1: Load template
$templatePath = __DIR__ . '/hello.docx';
$outputDocx   = __DIR__ . '/filled.docx';
$outputPdf    = __DIR__ . '/filled.pdf';

$template = new TemplateProcessor($templatePath);

// Step 2: Set timezone + placeholders
date_default_timezone_set('Asia/Kolkata'); 
$template->setValue('date', date("d/m/Y"));
$template->setValue('date1', date("d-M-y"));
$template->setValue('time', date("h:i A"));
$template->setValue('polygon_table', '${polygon_table}');

// Step 3: Load GeoJSON from POST
if (!isset($_POST['geojson'])) {
    die("No GeoJSON data received.");
}

$geojson = $_POST['geojson'];
$geojsonData = json_decode($geojson, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die("Invalid GeoJSON: " . json_last_error_msg());
}

// Step 3.1: Save GeoJSON to DB
$timestamp = date("Y-m-d H:i:s");
$result = pg_query_params($conn, 'INSERT INTO imd_geojson (submitted_at, geojson_data) VALUES ($1, $2)', [$timestamp, $geojson]);

if (!$result) {
    error_log("Failed to insert GeoJSON into database: " . pg_last_error($conn));
}

// Step 3.2: Save to temp + run Python
$tempJsonPath = __DIR__ . '/imd/temp_input.geojson';
file_put_contents($tempJsonPath, $geojson);

$imageBase = 'merged_district_punjab_haryana';
$imageHaryanaPath = __DIR__ . "/imd/processed/{$imageBase}_HARYANA_warnings.png";
$imagePunjabPath  = __DIR__ . "/imd/processed/{$imageBase}_PUNJAB_warnings.png";

// Clean old images first
@unlink($imageHaryanaPath);
@unlink($imagePunjabPath);

// Now run Python script
$pythonScriptPath = __DIR__ . '/imd/intersection_map.py';
$pythonExe = 'python';
$cmd = "$pythonExe \"$pythonScriptPath\"";
$output = shell_exec($cmd);
file_put_contents(__DIR__ . '/python_log.txt', "Executed command: $cmd\n\nOutput:\n$output");

// Correct place to log the output
file_put_contents(__DIR__ . '/python_log.txt', $output);
error_log("Python output: " . $output);

// Wait for up to 15 seconds for image generation
$maxWait = 15;
$waited = 0;
while (!file_exists($imageHaryanaPath) || !file_exists($imagePunjabPath)) {
    if ($waited >= $maxWait) {
        die("Image generation timeout. One or both images not found.");
    }
    sleep(1);
    $waited++;
}

// Step 4: Embed images into Word
$template->setImageValue('image_haryana', [
    'path' => $imageHaryanaPath,
    'width' => 1000,
    'height' => 1000,
    'ratio' => true
]);

$template->setImageValue('image_punjab', [
    'path' => $imagePunjabPath,
    'width' => 1000,
    'height' => 1000,
    'ratio' => true
]);

// Step 5: Save DOCX with image placeholders
$template->saveAs($outputDocx);

// Step 6: Generate polygon table as WordML
function createTableXml($features) {
    $currentDate = null;
    $dayCount = 1;
    $tableXml = '';
    $index = 1;

    foreach ($features as $feature) {
        $props = $feature['properties'] ?? [];
        $impacts = $props['Impacts'] ?? [];
        $safeties = $props['SafetyMeasures'] ?? [];
        $warningDate = $props['Date'] ?? null;

        if (empty($impacts) && empty($safeties)) continue;

        if ($warningDate !== $currentDate) {
            $currentDate = $warningDate;
            $tableXml .= "
            <w:p><w:r><w:rPr><w:b/><w:color w:val=\"FF0000\"/><w:sz w:val=\"28\"/></w:rPr><w:t>Day $dayCount - Date: $currentDate</w:t></w:r></w:p>
            <w:p/>";
            $dayCount++;
            $index = 1;
        }

        $warningName = htmlspecialchars($props['Warning'] ?? 'No Warning');
        $tableXml .= "
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Polygon $index - $warningName</w:t></w:r></w:p>
        <w:p/>";

        $tableXml .= '<w:tbl>
            <w:tblPr>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                </w:tblBorders>
            </w:tblPr>';

        $tableXml .= '<w:tr>
            <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Impacts</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Safety Measures</w:t></w:r></w:p></w:tc>
        </w:tr>';

        $max = max(count($impacts), count($safeties));
        for ($i = 0; $i < $max; $i++) {
            $imp = htmlspecialchars($impacts[$i] ?? '');
            $safe = htmlspecialchars($safeties[$i] ?? '');
            $tableXml .= "<w:tr>
                <w:tc><w:p><w:r><w:t>$imp</w:t></w:r></w:p></w:tc>
                <w:tc><w:p><w:r><w:t>$safe</w:t></w:r></w:p></w:tc>
            </w:tr>";
        }

        $tableXml .= "</w:tbl><w:p><w:r><w:br/></w:r></w:p>";
        $index++;
    }

    return $tableXml ?: '<w:p><w:r><w:t>No polygon data available</w:t></w:r></w:p>';
}

$features = $geojsonData['type'] === 'FeatureCollection' ? $geojsonData['features'] : [$geojsonData];
$tableXml = createTableXml($features);

// Step 7: Replace ${polygon_table} with actual WordML table
$zip = new ZipArchive();
if ($zip->open($outputDocx) === true) {
    $xml = $zip->getFromName('word/document.xml');
    $xml = preg_replace('/<w:p[^>]*?>.*?\$\{polygon_table\}.*?<\/w:p>/s', $tableXml, $xml);
    $zip->addFromString('word/document.xml', $xml);
    $zip->close();
}

// Step 8: Convert DOCX to PDF
$sofficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
$cmd = "$sofficePath --headless --convert-to pdf \"$outputDocx\" --outdir \"" . __DIR__ . "\"";
shell_exec($cmd);

// Step 9: Convert district table DOCX to PDF
$warningsDocx = __DIR__ . '/imd/processed/merged_district_punjab_haryana_warnings_table.docx';
$warningsPdf  = __DIR__ . '/imd/processed/merged_district_punjab_haryana_warnings_table.pdf';
if (!file_exists($warningsPdf) && file_exists($warningsDocx)) {
    $convertCmd = "$sofficePath --headless --convert-to pdf \"$warningsDocx\" --outdir \"" . dirname($warningsPdf) . "\"";
    shell_exec($convertCmd);
}

// Step 10: Merge both PDFs
$finalPdf = new Fpdi();
foreach ([$outputPdf, $warningsPdf] as $pdf) {
    if (file_exists($pdf)) {
        $pageCount = $finalPdf->setSourceFile($pdf);
        for ($i = 1; $i <= $pageCount; $i++) {
            $tpl = $finalPdf->importPage($i);
            $finalPdf->AddPage();
            $finalPdf->useTemplate($tpl);
        }
    }
}

$finalPath = __DIR__ . '/final_weather_report.pdf';
$finalPdf->Output($finalPath, 'F');

// Step 11: Output the final PDF
if (file_exists($finalPath)) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="weather_warning.pdf"');
    readfile($finalPath);
} else {
    echo "Final merged PDF generation failed.";
}
?>
