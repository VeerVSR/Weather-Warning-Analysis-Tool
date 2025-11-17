<?php
header('Content-Type: application/json');

// PostgreSQL credentials (change these)
$host = "localhost";
$dbname = "imd";
$user = 'postgres';
$password = 'sql123T';

$conn = pg_connect("host=$host dbname=$dbname user=$user password=$password");

if (!$conn) {
    echo json_encode(["error" => "Failed to connect to DB"]);
    exit;
}

// Get data from imd_impacts
$impacts_result = pg_query($conn, "SELECT * FROM imd_impacts");
$impacts = [];
while ($row = pg_fetch_assoc($impacts_result)) {
    $impacts[] = $row;
}

// Get data from imd_safetymeasure
$measures_result = pg_query($conn, "SELECT * FROM imd_safetymeasure");
$measures = [];
while ($row = pg_fetch_assoc($measures_result)) {
    $measures[] = $row;
}

pg_close($conn);

// Send as JSON
echo json_encode([
    "impacts" => $impacts,
    "measures" => $measures
]);
?>
