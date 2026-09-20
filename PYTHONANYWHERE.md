# Innoelectronics – Simple PythonAnywhere Deployment Guide

A clean, fast, and simple inventory showcase built with **Python, Flask, and SQLite**.
No complicated build steps, no Node.js required on PythonAnywhere — pure Python with high-performance instant search and 1-click WhatsApp quotes.

---

## 🌟 Why This Setup is Clean & Simple

1. **Pure Python & Flask:** Runs directly on PythonAnywhere without npm, Vite, or Node setup.
2. **Instant Search & Filters:** Powered by an embedded SQLite FTS5 search index containing all 3,428+ components. Sub-millisecond response times.
3. **Clean UI with Dual-View:**
   - **Grid View** with component cards, stock badges, and quick quote actions.
   - **Table View** for engineers and buyers wanting a compact, spreadsheet-like view.
4. **1-Click WhatsApp RFQs:**
   - Direct button on every component to chat on WhatsApp with pre-filled SKU and product name.
   - **RFQ Cart:** Users can add multiple components to a quote basket and generate an itemized BOM WhatsApp inquiry in one click.
5. **Zero Maintenance:** Auto-syncs with your Google Sheet inventory in the background without slowing down page loads.

---

## 🚀 3-Minute Deployment on PythonAnywhere

### Step 1: Upload the Pre-Built Package
In this repository, download or copy the file:
`innoelectronics_pythonanywhere.zip`

1. Log in to [PythonAnywhere](https://www.pythonanywhere.com/).
2. Open the **Files** tab.
3. Upload `innoelectronics_pythonanywhere.zip` to your home directory (`/home/yourusername/`).
4. Click on **Consoles** -> Open a **Bash console**, then run:
   ```bash
   mkdir -p innoelectronics
   unzip -o innoelectronics_pythonanywhere.zip -d innoelectronics
   cd innoelectronics
   pip install -r requirements.txt
   ```
*(Note: `requirements.txt` only has `Flask` and `requests`, so installation takes under 10 seconds!)*

---

### Step 2: Set Up the Web App
1. Go to the **Web** tab in PythonAnywhere.
2. Click **Add a new web app**.
3. Select your domain (e.g. `yourusername.pythonanywhere.com` or custom domain).
4. Choose **Manual configuration** -> **Python 3.10** (or 3.9/3.11).
5. In the Web App configuration settings:
   - **Source code directory:** `/home/yourusername/innoelectronics`
   - **Working directory:** `/home/yourusername/innoelectronics`

---

### Step 3: Configure WSGI File
In the **Web** tab, click on the **WSGI configuration file** link (e.g. `/var/www/yourusername_pythonanywhere_com_wsgi.py`).

Replace all of its contents with:
```python
import sys
import os

# Set working directory to project folder
project_home = '/home/yourusername/innoelectronics'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import the clean Flask application as 'application'
from app import app as application
```
*(Remember to replace `yourusername` with your actual PythonAnywhere username).*

Click **Save** in the top right.

---

### Step 4: Reload & Enjoy!
1. Return to the **Web** tab.
2. Click the green **Reload yourusername.pythonanywhere.com** button.
3. Open your website:
   - Your complete 3,428+ item catalog is live immediately!
   - Instant search by part code, keyword, or SKU.
   - Category filtering & In-Stock toggle.
   - Dual Grid / Table view.
   - WhatsApp BOM RFQ checkout.

---

## 🔄 How to Update Your Inventory

Your inventory is stored in `catalog.db` (SQLite) and syncs from your Google Sheet.

1. **Automatic Background Sync**: The server periodically checks for updates to your Google Sheet without interrupting site visitors.
2. **Instant Manual Sync**: Whenever you make bulk edits to your Google Sheet, trigger an instant refresh by visiting:
   ```
   https://yourusername.pythonanywhere.com/api/sync?token=inno2026
   ```
   Or via curl in your console:
   ```bash
   curl -X POST "https://yourusername.pythonanywhere.com/api/sync?token=inno2026"
   ```

---

## 🧪 Testing Your Installation
In your PythonAnywhere console, run:
```bash
python3 test_backend.py
```
This will automatically verify that the database is loaded, search is functioning, and all routes are running at 100%.
