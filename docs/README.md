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

## 🧱 Tech Stack Explained According to Application Elements

This section explains the system architecture by breaking the project into logical application layers and mapping each technology to its responsibility within the system.

---

### 1️⃣ Frontend / Client Layer  
*(User Interface & Interaction)*

**Purpose:**  
This layer is responsible for visualizing weather alerts and enabling interactive, map-based user operations.

**Technologies & Roles:**
- **HTML5** – Structures the web interface (forms, map container, controls)
- **CSS3** – Styles the UI, map layout, and bulletin panels
- **JavaScript (Vanilla JS)** – Handles user interactions, form submission, and communication with backend services
- **Leaflet.js** – Displays interactive maps showing districts and warning regions
- **Leaflet.draw** – Allows users to draw and edit polygons representing affected weather areas
- **OpenStreetMap** – Provides base map tiles for geographic visualization

**Element Covered:** Frontend / UI / UX  


---

### 2️⃣ Data Representation Layer  
*(Geospatial Data Modeling)*

**Purpose:**  
Ensures spatial data is structured in a standard, interoperable format across system components.

**Technologies & Roles:**
- **GeoJSON** – Used to represent polygons (affected regions) along with alert metadata such as severity, type, and description

**Element Covered:** Data format & spatial modeling  


---

### 3️⃣ API / Communication Layer  
*(Frontend ↔ Backend Bridge)*

**Purpose:**  
Handles data exchange between frontend and backend systems.

**Technologies & Roles:**
- **RESTful APIs (Flask)** – Used to process meteorological data and generate alerts
- **HTTP GET/POST Requests** – Used by frontend to send GeoJSON and alert parameters
- **PHP Backend Endpoints** – Used to integrate frontend workflows with downstream processing

**Element Covered:** API layer / Backend interface  


---

### 4️⃣ Backend / Application Logic Layer  
*(Core Processing & Business Logic)*

**Purpose:**  
Executes the main logic of the system.

**Technologies & Roles:**
- **Python (Flask)** – Processes meteorological inputs, applies alert logic, and exposes REST APIs
- **PHP** – Handles integration logic, request handling, data orchestration, and report workflows

**Element Covered:** Backend / Business logic  


---

### 5️⃣ Geospatial Processing Layer  
*(Region Identification Logic)*

**Purpose:**  
Determines which districts or regions are affected by a weather event.

**Technologies & Roles:**
- **Polygon-based geospatial logic** – Used to compare drawn or predefined polygons to identify impacted regions
- Advanced spatial databases like **PostGIS** were explored but not finalized

**Element Covered:** Spatial computation  


---

### 6️⃣ Report Generation Layer  
*(Output & Automation)*

**Purpose:**  
Automates official document generation for weather alerts.

**Technologies & Roles:**
- **PHPWord** – Used to generate editable DOCX reports
- **FPDF** – Used to generate structured IMD-style PDF bulletins

**Element Covered:** Document / Output layer  


---

### 7️⃣ Database Layer  
*(Persistent Storage)*

**Purpose:**  
Stores system data and metadata.

**Technologies & Roles:**
- **MySQL** – Stores alert metadata, district information, impacts, and safety instructions

**Element Covered:** Database / Persistence  

---

### 8️⃣ Hosting & Infrastructure Layer  
*(Deployment & Execution Environment)*

**Purpose:**  
Runs and serves the application reliably.

**Technologies & Roles:**
- **NGINX** – Acts as the web server and reverse proxy
- **PHP Runtime + Python Runtime** – Executes backend services
- Local/server-based deployment for internal IMD usage and testing

**Element Covered:** Hosting / Infrastructure  


---

### 9️⃣ Development, Testing & Collaboration Tools  
*(Engineering Workflow)*

**Purpose:**  
Supports coding, testing, and collaboration.

**Technologies & Roles:**
- **VS Code** – Development environment
- **Postman** – API testing for Flask endpoints
- **GitHub** – Version control and collaboration

**Element Covered:** DevOps (basic) / Tooling  


---

## 🔄 End-to-End System Flow

```
User
↓
Frontend (HTML/CSS/JS + Leaflet)
↓
GeoJSON Data
↓
REST API / PHP Endpoints
↓
Flask (Python) Alert Processing
↓
Database (MySQL)
↓
DOCX / PDF Generation
↓
Alert Output to User
```
## 🔥 One-Line Architecture Summary

> The system uses a Leaflet-based frontend for geospatial visualization, GeoJSON for spatial data exchange, Flask REST APIs and PHP backend logic for alert processing, MySQL for storage, and automated DOCX/PDF generation, deployed using NGINX.

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
