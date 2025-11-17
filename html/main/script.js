// Initialize Leaflet map
var map = L.map('map').setView([20.5937, 78.9629], 5);  // Centered on India

// ✅ STEP 2: Fetch impact & safety measure data from data.php
fetch('data.php')
  .then(res => res.json())
  .then(data => {
    const warningInfoMap = {};

    data.impacts.forEach(item => {
      const warning = item.imd_warning;
      if (!warningInfoMap[warning]) {
        warningInfoMap[warning] = { impacts: [], measures: [] };
      }
      warningInfoMap[warning].impacts.push(item.imd_impact);
    });

    data.measures.forEach(item => {
      const warning = item.imd_warning;
      if (!warningInfoMap[warning]) {
        warningInfoMap[warning] = { impacts: [], measures: [] };
      }
      warningInfoMap[warning].measures.push(item.imd_measure);
    });

    window.warningInfoMap = warningInfoMap; // Store globally
    console.log("✔ warningInfoMap loaded", warningInfoMap);
  })
  .catch(err => {
    console.error('❌ Failed to load data.php', err);
  });


// Add base map layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load and display the GeoJSON file with transparency and light gray color
fetch('data//states_india.geojson')
    .then(response => response.json())
    .then(geojsonData => {
        L.geoJSON(geojsonData, {
            style: function (feature) {
                return {
                    color: '#4682B4',  // Line color (light gray)
                    weight: 2,         // Line width
                    opacity: 0.7,      // Line transparency
                    fillOpacity: 0     // Fill transparency (fully transparent)
                };
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error loading GeoJSON:', error);
    });


    var intersectionsByDay = {
        1: { layer: L.layerGroup(), data: [] },
        2: { layer: L.layerGroup(), data: [] },
        3: { layer: L.layerGroup(), data: [] },
        4: { layer: L.layerGroup(), data: [] },
        5: { layer: L.layerGroup(), data: [] },
        6: { layer: L.layerGroup(), data: [] },
        7: { layer: L.layerGroup(), data: [] }
    };

    var allIntersections = {};
    
    
    function addIntersectionToDay(day, intersectionGeoJson) {
        if (intersectionsByDay[day]) {
            L.geoJSON(intersectionGeoJson, {
                style: { color: 'blue' } // Customize style if needed
            }).addTo(intersectionsByDay[day]);
        }
    }
function calculateAndAddIntersections(day) {
    // Assuming you have a function to calculate intersections
    var intersectionGeoJson = calculateIntersectionsForDay(day);

    if (intersectionGeoJson) {
        addIntersectionToDay(day, intersectionGeoJson);
    }
}

    
// Initialize Leaflet Draw
var layersByDay = {
    1: new L.FeatureGroup(),
    2: new L.FeatureGroup(),
    3: new L.FeatureGroup(),
    4: new L.FeatureGroup(),
    5: new L.FeatureGroup(),
    6: new L.FeatureGroup(),
    7: new L.FeatureGroup()
};
map.addLayer(layersByDay[1]);

var drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        marker: true,
        circlemarker: false
    },
    edit: {
        featureGroup: layersByDay[1],
        remove: true
    }
});
map.addControl(drawControl);

var formsContainer = document.getElementById('forms-container');

// Define warning icons
var warningIcons = {
    "Heavy Rain": L.icon({ iconUrl: 'icons/004-rain-1.png', iconSize: [32, 32] }),
    "Very Heavy Rain": L.icon({ iconUrl: 'icons/003-rain.png', iconSize: [32, 32] }),
    "Extremely Heavy Rain": L.icon({ iconUrl: 'icons/002-rainy.png', iconSize: [32, 32] }),
    "Heavy Snow": L.icon({ iconUrl: 'icons/005-snow.png', iconSize: [32, 32] }),
    "Thunderstorm & Lightning": L.icon({ iconUrl: 'icons/006-thunder.png', iconSize: [32, 32] }),
    "Hailstorm": L.icon({ iconUrl: 'icons/007-hailstorm.png', iconSize: [32, 32] }),
    "Dust Storm": L.icon({ iconUrl: 'icons/008-dust-storm.png', iconSize: [32, 32] }),
    "Dust Raising Winds": L.icon({ iconUrl: 'icons/009-dust-raising-winds.png', iconSize: [32, 32] }),
    "Strong Surface Winds": L.icon({ iconUrl: 'icons/010-strong-surface-winds.png', iconSize: [32, 32] }),
    "Heat Wave": L.icon({ iconUrl: 'icons/011-heat-wave.png', iconSize: [32, 32] }),
    "Hot Day": L.icon({ iconUrl: 'icons/014-hot-day.png', iconSize: [32, 32] }),
    "Hot and Humid": L.icon({ iconUrl: 'icons/012-humidity.png', iconSize: [32, 32] }),
    "Warm Night": L.icon({ iconUrl: 'icons/013-warm-night.png', iconSize: [32, 32] }),
    "Cold Wave": L.icon({ iconUrl: 'icons/003-rain.png', iconSize: [32, 32] }),
    "Cold Day": L.icon({ iconUrl: 'icons/003-rain.png', iconSize: [32, 32] }),
    "Ground Frost": L.icon({ iconUrl: 'icons/015-ice.png', iconSize: [32, 32] }),
    "Fog": L.icon({ iconUrl: 'icons/016-fog.png', iconSize: [32, 32] }),
};

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;

    // Initialize attributes
    layer.feature = {
        type: 'Feature',
        properties: {
            Warning: null,
            Color: null,
            Date: getDateForDay(activeTab)
        },
        geometry: {}
    };

    // Set initial style to blue
    layer.setStyle({ color: 'blue' });

    // Count how many polygons already exist (excluding intersections)
    let polygonNumber = 1;
    layersByDay[activeTab].eachLayer(l => {
        if (l.feature && l.feature.properties && !l.feature.properties.isIntersection) {
        polygonNumber++;
        }
    });

    // Assign polygon number to the layer
    layer.feature.properties.polygonNumber = polygonNumber;

    // Add the layer to the feature group for the active day
    layersByDay[activeTab].addLayer(layer);

    // Create a new form for the layer
    createForm(layer, true);
});





// Handle file upload
// Handle file upload
function handleFileUpload(event) {
    var file = event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var geojsonData = JSON.parse(e.target.result);

        L.geoJSON(geojsonData, {
            onEachFeature: function (feature, layer) {
                layersByDay[activeTab].addLayer(layer);
                // Do not create form for uploaded layers
            }
        }).addTo(map);

        // Upload the file to the server
        var formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert("File uploaded successfully.");
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error uploading file.");
        });
    };
    reader.readAsText(file);
}

// Prevent the page from refreshing on file upload
document.getElementById('file-upload').addEventListener('change', function(event) {
    event.preventDefault();
    handleFileUpload(event);
});

// Function to download all GeoJSON files with intersection details
// Function to download all GeoJSON files with intersection details and CRS
// Function to get covered districts
function getCoveredDistricts(polygonGeoJSON) {
    var coveredDistricts = [];
    
    if (districtsGeoJSON && polygonGeoJSON) {
        districtsGeoJSON.features.forEach(function(district) {
            var districtGeoJSON = {
                type: "Feature",
                geometry: district.geometry,
                properties: district.properties
            };
            var intersection = turf.intersect(polygonGeoJSON, districtGeoJSON);
            if (intersection) {
                coveredDistricts.push(district.properties.name); // Adjust this line as necessary
            }
        });
    }
    
    return coveredDistricts;
}

// Function to create and download the GeoJSON file
function downloadAllGeoJSON() {
    var allFeatures = [];
    var intersectionFeatures = [];

    // Collect all layers from all days
    for (var day in layersByDay) {
        layersByDay[day].eachLayer(function(layer) {
            if (layer.toGeoJSON) {
                allFeatures.push(layer.toGeoJSON());
            }
        });
    }

    // Process intersections
    for (var i = 0; i < allFeatures.length; i++) {
        for (var j = i + 1; j < allFeatures.length; j++) {
            const f1 = allFeatures[i];
const f2 = allFeatures[j];

// ✅ Skip invalid geometries
if (
    !f1.geometry || !f2.geometry ||
    (f1.geometry.type !== "Polygon" && f1.geometry.type !== "MultiPolygon") ||
    (f2.geometry.type !== "Polygon" && f2.geometry.type !== "MultiPolygon")
) {
    continue;
}

try {
    var intersection = turf.intersect(f1, f2);

                if (intersection) {
                    var combinedWarnings = new Set([
                        allFeatures[i].properties.Warning,
                        allFeatures[j].properties.Warning
                    ].filter(Boolean));

                    intersection.properties = {
                        combinedWarnings: Array.from(combinedWarnings).join(', ')
                    };

                    intersectionFeatures.push(intersection);
                }
            } catch (error) {
                console.error('Error processing intersection:', error);
            }
        }
    }

    // Combine all features
    var allGeoJSON = {
        type: "FeatureCollection",
        features: allFeatures.concat(intersectionFeatures)
    };

    // Add district information to each polygon feature
    allGeoJSON.features.forEach(function(feature) {
        try {
            feature.properties.coveredDistricts = getCoveredDistricts(feature);
        } catch (error) {
            console.error('Error getting covered districts:', error);
        }
    });

    // Add CRS property
    allGeoJSON.crs = {
        type: "name",
        properties: {
            name: "urn:ogc:def:crs:EPSG::4326"
        }
    };

    var prettyData = JSON.stringify(allGeoJSON, null, 2);
    var blob = new Blob([prettyData], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = `${getDateForDay(activeTab)}_all_polygons_with_intersections.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createForm(layer, showAttributes = true) {
    if (!showAttributes) return;

    var isIntersection = layer.feature && layer.feature.properties && layer.feature.properties.isIntersection;
    var formId = isIntersection
    ? `intersection-${layer.feature.properties.intersectionId}` 
    : `polygon-${layer._leaflet_id}`;

    // Remove any existing form for the same polygon or intersection
    var existingForm = document.querySelector(`[data-form-id="${formId}"]`);
    if (existingForm) {
        existingForm.remove();
    }

    var form = document.createElement('div');
    form.className = 'polygon-form';
    form.dataset.day = activeTab;
    form.dataset.formId = formId;

    var title = isIntersection
    ? `Intersection ${layer.feature.properties.intersectionId}`
    : `Polygon ${layer.feature.properties.polygonNumber || 1}`;

    var warnings = [
        { value: 'Heavy Rain' },
        { value: 'Very Heavy Rain' },
        { value: 'Extremely Heavy Rain' },
        { value: 'Heavy Snow' },
        { value: 'Thunderstorm & Lightning' },
        { value: 'Hailstorm' },
        { value: 'Dust Storm' },
        { value: 'Dust Raising Winds' },
        { value: 'Strong Surface Winds' },
        { value: 'Heat Wave' },
        { value: 'Hot Day' },
        { value: 'Hot and Humid' },
        { value: 'Warm Night' },
        { value: 'Cold Wave' },
        { value: 'Cold Day' },
        { value: 'Ground Frost' },
        { value: 'Fog' }
    ];

    // Generate dropdown options dynamically
   var selectedWarning = layer.feature?.properties?.Warning || "";

    var optionsHtml = warnings.map(warning => `
        <option value="${warning.value}" ${selectedWarning === warning.value ? 'selected' : ''}>
            ${warning.value}
    </option>
    `).join('');


    var colorOptions = ['Green', 'Yellow', 'Orange', 'Red'];
    var defaultColor = isIntersection
        ? 'Purple'
        : (layer.feature?.properties?.Color || 'Yellow');

    var colorOptionsHtml = colorOptions.map(color => `
        <option value="${color}" ${color === defaultColor ? 'selected' : ''}>${color}</option>
    `).join('');

   if (isIntersection) {
    form.innerHTML = `
        <h3>${title}</h3>

        <div class="form-group">
            <label for="color-${formId}">Color</label>
            <select id="color-${formId}">${colorOptionsHtml}</select>
        </div>

        <button class="btn" onclick="updateIntersectionAttributes('${formId}')">Update Attributes</button>
    `;
    } else {
        form.innerHTML = `
            <h3>${title}</h3>

            <div class="form-group">
                <label for="warning-${formId}">Warnings</label>
                <select id="warning-${formId}">
                    <option value="" ${!layer.feature.properties.Warning ? 'selected' : ''} disabled>Select a warning</option>
                    ${optionsHtml}
                </select>
            </div>

            <div class="form-group">
                <label>Impacts</label>
                <div class="custom-multiselect">
                    <div class="select-box" onclick="this.nextElementSibling.classList.toggle('show')">Select Impacts</div>
                    <div id="impact-${formId}" class="checkbox-options">
                        <label><input type="checkbox" id="impact-select-all-${formId}"> <span>Select All</span></label>
                        <!-- Checkboxes will be inserted dynamically -->
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label>Safety Measures</label>
                <div class="custom-multiselect">
                    <div class="select-box" onclick="this.nextElementSibling.classList.toggle('show')">Select Measures</div>
                    <div id="measure-${formId}" class="checkbox-options">
                        <label><input type="checkbox" id="measure-select-all-${formId}"> <span>Select All</span></label>
                        <!-- Checkboxes will be inserted dynamically -->
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="color-${formId}">Color</label>
                <select id="color-${formId}">${colorOptionsHtml}</select>
            </div>

            <div class="form-group">
                <label for="date-${formId}">Date</label>
                <input type="text" id="date-${formId}" value="${layer.feature.properties.Date || getDateForDay(activeTab)}" readonly>
            </div>

            <button class="btn" onclick="updateAttributes('${layer._leaflet_id}')">Update Attributes</button>
        `;
    }

    // ✅ Dynamically load impacts and measures from warningInfoMap
    const warningSelect = form.querySelector(`#warning-${formId}`);
    if (warningSelect) {
        warningSelect.addEventListener('change', function () {
            populateImpactAndMeasureDropdowns(this.value, formId);
        });
        if (warningSelect.value) {
            populateImpactAndMeasureDropdowns(warningSelect.value, formId);
        }
    }
    document.getElementById('forms-container').appendChild(form);

}

function populateImpactAndMeasureDropdowns(warning, formId) {
    const impactContainer = document.getElementById(`impact-${formId}`);
    const measureContainer = document.getElementById(`measure-${formId}`);
    if (!impactContainer || !measureContainer) return;
    // Remove all checkboxes except the "Select All" checkbox
    impactContainer.querySelectorAll(`input[type="checkbox"]:not(#impact-select-all-${formId})`).forEach(el => el.parentElement.remove());
    measureContainer.querySelectorAll(`input[type="checkbox"]:not(#measure-select-all-${formId})`).forEach(el => el.parentElement.remove());
    if (window.warningInfoMap && window.warningInfoMap[warning]) {
        const info = window.warningInfoMap[warning];

        // Add impact checkboxes
        info.impacts.forEach(impact => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${impact}" class="impact-option-${formId}">
                <span>${impact}</span>
            `;
            impactContainer.appendChild(label);
        });

        // Add measure checkboxes
        info.measures.forEach(measure => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${measure}" class="measure-option-${formId}">
                <span>${measure}</span>
            `;
            measureContainer.appendChild(label);
        });
    }
    // "Select All" logic (ensure this part isn't duplicated outside)
    const impactSelectAll = document.getElementById(`impact-select-all-${formId}`);
    if (impactSelectAll) {
        impactSelectAll.addEventListener('change', function () {
            const checkboxes = impactContainer.querySelectorAll(`.impact-option-${formId}`);
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    const measureSelectAll = document.getElementById(`measure-select-all-${formId}`);
    if (measureSelectAll) {
        measureSelectAll.addEventListener('change', function () {
            const checkboxes = measureContainer.querySelectorAll(`.measure-option-${formId}`);
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
}
// Function to get the date for each day
function getDateForDay(day = 1) {
    const date = new Date();
    date.setDate(date.getDate() + (day - 1));
    return date.toISOString().split('T')[0];
}



// Function to update the attributes of the specified layer
function updateAttributes(layerId) {
    var layer = null;
    for (var day in layersByDay) {
        layer = layersByDay[day].getLayer(layerId);
        if (layer) break;
    }

    if (layer) {
        var formId = `polygon-${layerId}`;
        var warning = document.getElementById(`warning-${formId}`).value;
        var color = document.getElementById(`color-${formId}`).value;
        var date = document.getElementById(`date-${formId}`).value;

        if (!warning || !color || !date) {
            alert('Please fill in all fields.');
            return;
        }

        // ✅ Get selected impacts
        var impactCheckboxes = document.querySelectorAll(`.impact-option-${formId}`);
        var selectedImpacts = Array.from(impactCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // ✅ Get selected safety measures
        var measureCheckboxes = document.querySelectorAll(`.measure-option-${formId}`);
        var selectedMeasures = Array.from(measureCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // ✅ Store in layer properties
        layer.feature.properties.Warning = warning;
        layer.feature.properties.Color = color;
        layer.feature.properties.Date = date;
        layer.feature.properties.Impacts = selectedImpacts;
        layer.feature.properties.SafetyMeasures = selectedMeasures;

        // ✅ Update color style
        layer.setStyle({ color: color });

        // ✅ Replace old marker
        if (layer.warningMarker) {
            layersByDay[activeTab].removeLayer(layer.warningMarker);
        }

        // ✅ Add new warning marker
        if (warningIcons[warning]) {
            var latLng = layer.getBounds().getCenter();
            layer.warningMarker = L.marker(latLng, { icon: warningIcons[warning] });
            layersByDay[activeTab].addLayer(layer.warningMarker);
        }

        updateIntersectionIcons(); // Recalculate intersections
        alert('Attributes updated successfully.');
    } else {
        console.error('Layer not found:', layerId);
    }
}

function collectLayers(activeDayLayers) {
    var layers = [];
    activeDayLayers.eachLayer(function(layer) {
        layers.push(layer);
    });
    return layers;
}

function removeExistingMarkers(map) {
    if (map.intersectionLayer) {
        map.removeLayer(map.intersectionLayer);
    }
}

function createSmallIcons(warningIcons) {
    var smallIcons = {};
    for (var key in warningIcons) {
        smallIcons[key] = L.icon({
            iconUrl: warningIcons[key].options.iconUrl,
            iconSize: [84, 84] // Adjust size as needed
        });
    }
    return smallIcons;
}

function createCombinedIconHtml(icon1Url, icon2Url) {
    return `
        <div style="position: relative; width: 24px; height: 24px;">
            <img src="${icon1Url}" style="position: absolute; width: 24px; height: 24px;"/>
            <img src="${icon2Url}" style="position: absolute; width: 24px; height: 24px; clip: rect(0, 12px, 24px, 0);"/>
        </div>
    `;
}

function addIconToIntersection(center, icon1Url, icon2Url, intersectionLayer) {
    var markers = [];
    if (icon1Url && icon2Url) {
        var combinedIconHtml = createCombinedIconHtml(icon1Url, icon2Url);
        var combinedIcon = L.divIcon({
            className: '',
            html: combinedIconHtml,
            iconSize: [24, 24]
        });
        markers.push(L.marker(center, { icon: combinedIcon }).addTo(map));
    } else if (icon1Url) {
        markers.push(L.marker(center, { icon: L.icon({ iconUrl: icon1Url, iconSize: [24, 24] }) }).addTo(map));
    } else if (icon2Url) {
        markers.push(L.marker(center, { icon: L.icon({ iconUrl: icon2Url, iconSize: [24, 24] }) }).addTo(map));
    }
    return markers;
}


function processIntersections(layers, smallIcons, intersectionLayer) {
    var intersectionCount = 0;
    for (var i = 0; i < layers.length; i++) {
        for (var j = i + 1; j < layers.length; j++) {
            var poly1 = layers[i].toGeoJSON();
            var poly2 = layers[j].toGeoJSON();
            if (
                !poly1.geometry || !poly2.geometry ||
                (poly1.geometry.type !== "Polygon" && poly1.geometry.type !== "MultiPolygon") ||
                (poly2.geometry.type !== "Polygon" && poly2.geometry.type !== "MultiPolygon")
            ) {
            continue;
            }
            var intersection = turf.intersect(poly1, poly2);

            if (intersection) {
                intersectionCount++;
                var latLngs = intersection.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                var intersectionPolygon = L.polygon(latLngs, {
                    color: 'red',
                    weight: 2,
                    fillOpacity: 0.3
                }).addTo(intersectionLayer);

                // Combine properties from both polygons
                intersectionPolygon.feature = {
                    type: 'Feature',
                    properties: {
                        isIntersection: true,
                        intersectionId: intersectionCount,
                        Warning: [poly1.properties.Warning, poly2.properties.Warning].filter(Boolean).join(', '),
                        Color: 'Red',
                        Date: poly1.properties.Date || poly2.properties.Date
                    },
                    geometry: intersection.geometry
                };

                var centroid = turf.centroid(intersectionPolygon.toGeoJSON()).geometry.coordinates;
                var center = [centroid[1], centroid[0]];

                var icon1Url = poly1.properties.Warning ? warningIcons[poly1.properties.Warning].options.iconUrl : null;
                var icon2Url = poly2.properties.Warning ? warningIcons[poly2.properties.Warning].options.iconUrl : null;

                addIconToIntersection(center, icon1Url, icon2Url, intersectionLayer);

                // Create form for intersection
                createForm(intersectionPolygon, true);
            }
        }
    }
}

function updateIntersectionIcons() {
    var layers = collectLayers(layersByDay[activeTab]);
    
    // Clear existing intersections for the active day
    if (allIntersections[activeTab]) {
        allIntersections[activeTab].forEach(intersection => {
            map.removeLayer(intersection.polygon);
            if (intersection.warningMarkers) {
                intersection.warningMarkers.forEach(marker => map.removeLayer(marker));
            }
        });
    }
    allIntersections[activeTab] = [];

    var intersectionCount = 0;

    for (var i = 0; i < layers.length; i++) {
        for (var j = i + 1; j < layers.length; j++) {
            var poly1 = layers[i].toGeoJSON();
            var poly2 = layers[j].toGeoJSON();
            // ✅ SKIP invalid or missing geometries
            if (
                !poly1.geometry || !poly2.geometry ||
                (poly1.geometry.type !== "Polygon" && poly1.geometry.type !== "MultiPolygon") ||
                (poly2.geometry.type !== "Polygon" && poly2.geometry.type !== "MultiPolygon")
            ) {
            continue;
        }
            var intersection = turf.intersect(poly1, poly2);

            if (intersection) {
                intersectionCount++;
                var latLngs = intersection.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                var intersectionPolygon = L.polygon(latLngs, {
                    color: 'red',
                    weight: 2,
                    fillOpacity: 0.3
                }).addTo(map);

                var intersectionData = {
                    id: intersectionCount,
                    warning: [poly1.properties.Warning, poly2.properties.Warning].filter(Boolean).join(', '),
                    color: 'Red',
                    date: poly1.properties.Date || poly2.properties.Date,
                    polygon: intersectionPolygon
                };

                intersectionPolygon.feature = {
                    type: 'Feature',
                    properties: {
                        isIntersection: true,
                        intersectionId: intersectionCount,
                        Warning: intersectionData.warning,
                        Color: intersectionData.color,
                        Date: intersectionData.date
                    },
                    geometry: intersection.geometry
                };

                var centroid = turf.centroid(intersectionPolygon.toGeoJSON()).geometry.coordinates;
                var center = [centroid[1], centroid[0]];

                var icon1Url = poly1.properties.Warning ? warningIcons[poly1.properties.Warning].options.iconUrl : null;
                var icon2Url = poly2.properties.Warning ? warningIcons[poly2.properties.Warning].options.iconUrl : null;

                var warningMarkers = addIconToIntersection(center, icon1Url, icon2Url, intersectionPolygon);

                allIntersections[activeTab].push({
                    id: intersectionCount,
                    warning: intersectionData.warning,
                    color: intersectionData.color,
                    date: intersectionData.date,
                    polygon: intersectionPolygon,
                    warningMarkers: warningMarkers
                });

                // Update or create form for intersection
                updateOrCreateIntersectionForm(intersectionPolygon);
            }
        }
    }

    // Remove forms for intersections that no longer exist
    removeObsoleteIntersectionForms(intersectionCount);

    // ✅ Re-render forms for non-intersection polygons
    layersByDay[activeTab].eachLayer(function(layer) {
        if (
            layer.feature &&
            layer.feature.properties &&
            !layer.feature.properties.isIntersection
        ) {
            createForm(layer, true);
        }
    });

}




function updateWarningIcons(day) {
    layersByDay[day].eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties && layer.feature.properties.Warning) {
            var warning = layer.feature.properties.Warning;
            if (warningIcons[warning]) {
                // Remove existing warning marker if any
                if (layer.warningMarker) {
                    layersByDay[day].removeLayer(layer.warningMarker);
                }
                var latLng = layer.getBounds().getCenter();
                layer.warningMarker = L.marker(latLng, { icon: warningIcons[warning] });
                layersByDay[day].addLayer(layer.warningMarker);
            }
        }
    });
}








function updateIntersectionColor(formId) {
    var intersectionId = parseInt(formId.split('-')[1]);
    var newColor = document.getElementById(`color-${formId}`).value;
    
    for (var day in intersectionsByDay) {
        intersectionsByDay[day].eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties && layer.feature.properties.intersectionId === intersectionId) {
                layer.setStyle({ color: newColor });
                layer.feature.properties.Color = newColor;
            }
        });
    }
}


function updateOrCreateIntersectionForm(intersectionPolygon) {
    var formId = `intersection-${intersectionPolygon.feature.properties.intersectionId}`;
    var existingForm = document.querySelector(`[data-form-id="${formId}"]`);
    
    if (existingForm) {
        // Update existing form
        updateIntersectionForm(existingForm, intersectionPolygon);
    } else {
        // Create new form
        createForm(intersectionPolygon, true);
    }
}

function updateIntersectionForm(form, intersectionPolygon) {
    var props = intersectionPolygon.feature.properties;
    form.querySelector('h3').textContent = `Intersection ${props.intersectionId}`;
    var warningSelect = form.querySelector('[id^="warning-"]');
    if (warningSelect) warningSelect.value = props.Warning;
    form.querySelector('[id^="color-"]').value = props.Color;
    var dateInput = form.querySelector('[id^="date-"]');
    if (dateInput) dateInput.value = props.Date;
}

function removeObsoleteIntersectionForms(currentIntersectionCount) {
    var forms = document.querySelectorAll('#forms-container [data-form-id^="intersection-"]');
    forms.forEach(form => {
        var formId = parseInt(form.dataset.formId.split('-')[1]);
        if (formId > currentIntersectionCount) {
            form.remove();
        }
    });
}


function updateIntersectionAttributes(formId) {
    var intersectionId = parseInt(formId.split('-')[1]);
    var newColor = document.getElementById(`color-${formId}`).value;
    
    var intersectionData = allIntersections[activeTab].find(i => i.id === intersectionId);

    if (intersectionData) {
        // Update color
        intersectionData.polygon.setStyle({ color: newColor });
        intersectionData.polygon.feature.properties.Color = newColor;
        intersectionData.color = newColor;

        // Update warning icons if needed
        var warnings = intersectionData.warning.split(', ');
        var center = intersectionData.polygon.getBounds().getCenter();
        
        // Remove existing warning markers
        if (intersectionData.warningMarkers) {
            intersectionData.warningMarkers.forEach(marker => {
                map.removeLayer(marker);
            });
        }

        // Add new warning markers
        intersectionData.warningMarkers = warnings.map(warning => {
            if (warningIcons[warning]) {
                var marker = L.marker(center, { icon: warningIcons[warning] });
                map.addLayer(marker);
                return marker;
            }
        }).filter(Boolean);

        alert('Intersection attributes updated successfully.');
    } else {
        console.error('Intersection data not found:', intersectionId);
        alert('Error: Intersection data not found.');
    }
}
// Function to download the GeoJSON of the specified polygon
// Function to download the GeoJSON of the specified polygon
function downloadPolygonGeoJSON(formId) {
    var layer;
    if (formId.startsWith('polygon-')) {
        // It's a regular polygon
        var layerId = parseInt(formId.split('-')[1]);
        for (var day in layersByDay) {
            layer = layersByDay[day].getLayer(layerId);
            if (layer) break;
        }
    } else if (formId.startsWith('intersection-')) {
        // It's an intersection
        var intersectionId = parseInt(formId.split('-')[1]);
        for (var day in intersectionsByDay) {
            intersectionsByDay[day].eachLayer(function(l) {
                if (l.feature && l.feature.properties && l.feature.properties.intersectionId === intersectionId) {
                    layer = l;
                }
            });
            if (layer) break;
        }
    }

    if (layer) {
        var data = layer.toGeoJSON();

        // Add CRS property to the GeoJSON
        data.crs = {
            type: "name",
            properties: {
                name: "urn:ogc:def:crs:EPSG::4326" // WGS84 coordinate system
            }
        };

        // Add district information
        if (typeof getCoveredDistricts === 'function') {
            data.properties.coveredDistricts = getCoveredDistricts(data);
        }

        var prettyData = JSON.stringify(data, null, 2);

        var blob = new Blob([prettyData], {type: "application/json"});
        var url = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = `${formId}.geojson`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        console.error('Layer not found:', formId);
        alert('Error: Layer not found. Cannot download GeoJSON.');
    }
}


// Function to handle tab switching
var activeTab = 1;


// Function to handle tab switching
function showTab(day) {
    // Hide all layers and forms
    for (var key in layersByDay) {
        map.removeLayer(layersByDay[key]);
        if (allIntersections[key]) {
            allIntersections[key].forEach(intersection => {
                map.removeLayer(intersection.polygon);
                if (intersection.warningMarkers) {
                    intersection.warningMarkers.forEach(marker => map.removeLayer(marker));
                }
            });
        }
    }
    
    // Show the layers for the selected day
    map.addLayer(layersByDay[day]);
    
    // Show intersections for the selected day
    if (allIntersections[day]) {
        allIntersections[day].forEach(intersection => {
            map.addLayer(intersection.polygon);
            if (intersection.warningMarkers) {
                intersection.warningMarkers.forEach(marker => map.addLayer(marker));
            }
        });
    }
    
    activeTab = day;
    
    // Update the UI to reflect the active tab
    updateTabUI(day);
    
    // Update the forms to reflect the active day's polygons and intersections
    updateFormsForActiveDay();

    // Update warning icons for the active day
    updateWarningIcons(day);

}





function recreateIntersectionForms(day) {
    intersectionsByDay[day].data.forEach(intersectionData => {
        createForm(intersectionData.polygon, true);
    });
}

function updateTabUI(day) {
    // Add logic to highlight the active tab in the UI
    var tabs = document.querySelectorAll('.day-tab');
    tabs.forEach(tab => {
        if (parseInt(tab.dataset.day) === day) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function updateFormsForActiveDay() {
    // Clear existing forms for polygons
    var polygonForms = formsContainer.querySelectorAll('[data-form-id^="polygon-"]');
    polygonForms.forEach(form => form.remove());

    // Add forms for the layers of the active day
    layersByDay[activeTab].eachLayer(function(layer) {
        createForm(layer, true);
    });

    // Update or add forms for intersections
    if (allIntersections[activeTab]) {
        allIntersections[activeTab].forEach(intersectionData => {
            var formId = `intersection-${intersectionData.id}`;
            var existingForm = formsContainer.querySelector(`[data-form-id="${formId}"]`);
            if (existingForm) {
                // Update existing form
                updateIntersectionForm(existingForm, intersectionData.polygon);
            } else {
                // Create new form
                createForm(intersectionData.polygon, true);
            }
        });
    }

    // Remove obsolete intersection forms
    var currentIntersectionIds = allIntersections[activeTab] ? allIntersections[activeTab].map(i => i.id) : [];
    var intersectionForms = formsContainer.querySelectorAll('[data-form-id^="intersection-"]');
    intersectionForms.forEach(form => {
        var formId = parseInt(form.dataset.formId.split('-')[1]);
        if (!currentIntersectionIds.includes(formId)) {
            form.remove();
        }
    });

    // Ensure all forms are visible for the active tab
    var allForms = formsContainer.querySelectorAll('.polygon-form');
    allForms.forEach(form => {
        if (form.dataset.day == activeTab) {
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    });
}




// Example usage: Add event listeners to tabs (assuming you have elements with class "day-tab")
document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        var day = parseInt(this.dataset.day);
        showTab(day);
    });
});

var districtsGeoJSON = null;

fetch('data//districts_india.geojson')
    .then(response => response.json())
    .then(data => {
        districtsGeoJSON = data;
    })
    .catch(error => {
        console.error('Error loading districts GeoJSON:', error);
    });

window.submitGeoJSONForPDF = function () {
    //console.log("Generate PDF button clicked!");

    var allFeatures = [];

    for (var day in layersByDay) {
        layersByDay[day].eachLayer(function(layer) {
            if (layer.toGeoJSON) {
                allFeatures.push(layer.toGeoJSON());
            }
        });
    }

    for (var day in allIntersections) {
        if (Array.isArray(allIntersections[day])) {
            allIntersections[day].forEach(intersection => {
                if (intersection.polygon && intersection.polygon.toGeoJSON) {
                    allFeatures.push(intersection.polygon.toGeoJSON());
                }
            });
        }
    }

    var geojsonData = {
        type: "FeatureCollection",
        features: allFeatures,
        crs: {
            type: "name",
            properties: {
                name: "urn:ogc:def:crs:EPSG::4326"
            }
        }
    };

    document.getElementById('geojsonInput').value = JSON.stringify(geojsonData);
    /*Converts into string - "{\"type\":\"FeatureCollection\",\"features\":[...],\"crs\":
    {\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::4326\"}}}"
    */
    document.getElementById('pdfForm').submit();
};

document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generate-pdf-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', window.submitGeoJSONForPDF);
    }
});
