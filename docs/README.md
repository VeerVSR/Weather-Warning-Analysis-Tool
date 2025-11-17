# 🌩️ Weather Warning & Geospatial Analysis Tool
*A Complete System for Fetching, Visualizing, Analyzing & Reporting Weather Warnings*

![Weather Warning Map](https://raw.githubusercontent.com/VeerVSR/Weather-Warning-Analysis-Tool/master/html/main/complete_map.png)

This project is a comprehensive web-based platform designed to fetch, visualize, and analyze weather warnings. It enables users to review live weather alerts, draw custom polygons, compute intersections with district boundaries, and generate detailed DOCX/PDF reports.

---

# 🚀 Features

### 🛰️ Real-Time Weather Data
Automatically fetches the latest weather warning GeoJSON and updates the map.

### 🗺️ Interactive Map Interface
Built with Leaflet.js and Leaflet.draw allowing users to:
- View weather warning zones  
- Draw and edit custom polygon areas  
- Analyze selected regions  

### 🌍 Geospatial Analysis
Backend compares:
- Weather warning polygons  
- Districts of Punjab & Haryana  
and determines intersection areas in real time.

### 📊 Dynamic Visualization
- Highlights affected districts  
- Displays warning details in structured tables  
- Provides color-coded map overlays  

### 📄 Report Generation
Generates downloadable DOCX (PHPWord) and PDF (FPDF) reports via `generate.php`.

### ⚙️ Robust Backend Architecture
- Flask backend for API & geospatial analysis  
- Nginx server for hosting  
- Structured modules for scalability  

---

# 🧱 Technology Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Python, Flask, Flask-Cors |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Mapping** | Leaflet.js, Leaflet.draw |
| **Server** | Nginx, FastCGI |
| **Docs** | PHP, PHPWord, FPDF |
| **Data** | GeoJSON, XLSX |

---

# 📁 Directory Structure

```
veervsr-weather-warning-analysis-tool/
├── app.py
├── testDatabase.py
├── database.xlsx
├── IMPACTS AND SAFTEY MEASURES FOR WARNINGS.docx
│
├── conf/
│   ├── nginx.conf
│   ├── fastcgi.conf
│   ├── fastcgi_params
│   ├── mime.types
│   └── ...
│
├── docs/
│   ├── README.md
│   ├── LICENSE
│   ├── CONTRIBUTING.md
│   └── ...
│
├── contrib/
│   └── ...
│
└── html/
    ├── index.html
    ├── composer.json
    ├── generate.php
    ├── vendor/
    ├── uploads/
    │
    └── main/
        ├── index.html
        ├── script.js
        ├── styles.css
        ├── data.php
        ├── fetch_latest_geojson.py
        ├── intersection_map.py
        ├── temp_input.geojson
        │
        ├── data/
        │   ├── states_india.geojson
        │   ├── districts_india.geojson
        │   ├── latest_warning.geojson
        │   └── merged_district_punjab_haryana_warnings_table.docx
        │
        ├── libs/
        ├── libs2/
        │
        └── processed/
            ├── latest_warning.geojson
            └── merged_district_punjab_haryana_warnings_table.docx
```

---

# ⚙️ Installation & Setup

## 1️⃣ Prerequisites
- Python 3.8+
- Pip
- PHP 7+
- Composer
- Nginx

---

# 2️⃣ Clone the Repository

```sh
git clone https://github.com/VeerVSR/veervsr-weather-warning-analysis-tool.git
cd veervsr-weather-warning-analysis-tool
```

---

# 3️⃣ Setup Python Backend

### Create virtual environment
**Windows**
```sh
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**
```sh
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies
```sh
pip install Flask Flask-Cors
```

---

# 4️⃣ Setup PHP Dependencies

```sh
cd html
composer install
cd ..
```

---

# 5️⃣ Configure Nginx

Set the root inside `conf/nginx.conf`:

```
root <project-path>/veervsr-weather-warning-analysis-tool/html;
```

Example configuration:

```nginx
location / {
    try_files $uri $uri/ /main/index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:5000;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

Start Nginx:

```
nginx.exe
```

---

# 6️⃣ Start Flask API

```sh
python app.py
```

Visit:
```
http://localhost/main/
```

---

# 🧠 How the System Works

1. **Fetch Latest Data**  
   `fetch_latest_geojson.py` retrieves warnings.

2. **Map Rendering**  
   Leaflet shows districts, warnings, user polygons.

3. **User Interaction**  
   Draw polygons → sent to Flask API.

4. **Intersection Logic**  
   `intersection_map.py` analyzes:
   - Warning polygons  
   - District boundaries  

5. **Report Generation**  
   `generate.php` builds:
   - DOCX  
   - PDF  

6. **Output Storage**  
   Saved under:
   ```
   html/main/processed/
   ```

---

# 📄 License
MIT License — see `docs/LICENSE`.

---
