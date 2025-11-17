from flask import Flask, Response
import pandas as pd
import pdfkit

app = Flask(__name__)

# Set the wkhtmltopdf path if not in PATH
# Change this path if wkhtmltopdf is installed elsewhere
path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

@app.route('/')
def home():
    return '<h2>Visit <a href="/pdf">pdf</a> to view the Excel data</h2>'

@app.route('/pdf')
def render_pdf():
    # Read the Excel file
    df = pd.read_excel('database.xlsx')

    # Convert to HTML table
    html = f"""
    <html>
        <head>
            <meta charset="utf-8">
            <style>
                h2 {{ text-align: center; }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                th, td {{
                    border: 1px solid #444;
                    padding: 8px;
                    text-align: left;
                }}
                th {{
                    background-color: #f2f2f2;
                }}
            </style>
        </head>
        <body>
            <h2>Excel Data Output</h2>
            {df.to_html(index=False)}
        </body>
    </html>
    """

    # Convert HTML to PDF and return it as response
    pdf = pdfkit.from_string(html, False, configuration=config)

    return Response(pdf, mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
