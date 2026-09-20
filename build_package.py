"""
Builds the standalone PythonAnywhere production deployment zip bundle.
"""
import os
import subprocess
import zipfile
import time

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_NAME = "innoelectronics_pythonanywhere.zip"
ZIP_PATH = os.path.join(PROJECT_DIR, ZIP_NAME)

print("[1/3] Ensuring SQLite database is up-to-date...")
import db
db.init_db()
summary = db.get_catalog_summary()
if summary['totalProducts'] == 0:
    print("Syncing products into catalog.db...")
    db.sync_products_from_sheet(force=True)
    summary = db.get_catalog_summary()
print(f"Catalog DB verified: {summary['totalProducts']} products ready.")

print("[2/3] Packaging files into deployment zip...")
files_to_include = [
    'app.py',
    'db.py',
    'wsgi.py',
    'catalog.db',
    'requirements.txt',
    'PYTHONANYWHERE.md',
    'test_backend.py'
]

directories_to_include = [
    'templates',
    'public'
]

if os.path.exists(ZIP_PATH):
    os.remove(ZIP_PATH)

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    # Add root files
    for fname in files_to_include:
        fpath = os.path.join(PROJECT_DIR, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=fname)
            print(f"  + Added {fname}")

    # Add directories (templates, public)
    for dname in directories_to_include:
        dir_path = os.path.join(PROJECT_DIR, dname)
        if os.path.exists(dir_path):
            for root, dirs, files in os.walk(dir_path):
                for f in files:
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, PROJECT_DIR)
                    zf.write(full_path, arcname=rel_path)
            print(f"  + Added {dname}/ directory")

    # Optionally add dist directory if it exists
    dist_dir = os.path.join(PROJECT_DIR, 'dist')
    if os.path.exists(dist_dir):
        for root, dirs, files in os.walk(dist_dir):
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, PROJECT_DIR)
                zf.write(full_path, arcname=rel_path)
        print("  + Added dist/ directory")

size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
print(f"[3/3] Package created successfully: {ZIP_NAME} ({round(size_mb, 2)} MB)")
