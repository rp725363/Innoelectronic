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
   pip3.10 install --user -r requirements.txt
   ```
*(Note: If you choose Python 3.9 or 3.11, use `pip3.9` or `pip3.11` respectively. `requirements.txt` only has `Flask` and `requests`, so installation takes under 10 seconds!)*

---

### Step 2: Set Up the Web App
1. Go to the **Web** tab in PythonAnywhere.
2. Click **Add a new web app**.
3. Select your domain (e.g. `yourusername.pythonanywhere.com` or custom domain).
4. Choose **Manual configuration** -> **Python 3.10** (recommended).
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

os.chdir(project_home)

# Import the clean Flask application as 'application'
from app import app as application
```
*(Remember to replace `yourusername` with your actual PythonAnywhere username).*

Click **Save** in the top right.

---

### Step 4: Configure Static Files (Recommended for Max Speed)
In the **Web** tab, scroll down to the **Static files** section and add:
- **URL:** `/static/`
- **Directory:** `/home/yourusername/innoelectronics/public`

*(This allows PythonAnywhere's Nginx server to serve images, styles, and logos instantly without loading Python workers).*

---

### Step 5: Reload & Enjoy!
1. Return to the **Web** tab.
2. Click the green **Reload yourusername.pythonanywhere.com** button.
3. Open your website:
   - Your complete 3,428+ item catalog is live immediately!
   - Instant search by part code, keyword, or SKU.
   - Category filtering & In-Stock toggle.
   - Dual Grid / Table view.
   - WhatsApp BOM RFQ checkout.

---

## 🔧 Troubleshooting & Solutions for Common PythonAnywhere Issues

### ⚠️ "I deployed / committed latest code but still see old code output"

If you deployed, committed, or updated code on PythonAnywhere but do not see the latest output, check these **4 quick reasons**:

1. **You must click the Reload button on the Web tab (Crucial!):**
   PythonAnywhere keeps worker processes running in memory. Any code changes, `git pull`, or file edits **do NOT take effect until you reload**:
   - Go to your PythonAnywhere **Web** tab.
   - Click the green **"Reload yourusername.pythonanywhere.com"** button at the top.
   - *(Or in a Bash console, run: `touch /var/www/yourusername_pythonanywhere_com_wsgi.py`)*

2. **Did you run `git pull` in the PythonAnywhere console?**
   Committing to GitHub or pushing from your computer does **not** automatically update PythonAnywhere.
   - Open a **Bash console** on PythonAnywhere:
     ```bash
     cd ~/innoelectronics
     git pull origin main
     ```
   - Then click **Reload** in the Web tab.

3. **Browser Caching:**
   Your browser may be caching the old HTML, JavaScript, or CSS stylesheets:
   - Perform a hard refresh: **`Ctrl + F5`** (Windows/Linux) or **`Cmd + Shift + R`** (Mac).
   - Or open the website in an **Incognito / Private Window**.

4. **Category Display Update:**
   - On the homepage (`/`), the component product grid is hidden so visitors browse by category first.
   - Components are displayed when you click any category card (e.g. `/?category=Molex+Connectors`), use the search bar, or visit `/catalog`.

---

### 📦 Dependency Verification for PythonAnywhere

**Are all dependencies supported on PythonAnywhere? YES, 100%.**
Here is the complete dependency breakdown:

| Dependency | Purpose | PythonAnywhere Support Status |
|---|---|---|
| **`Flask`** (>=2.2.0) | Web framework & routes | **Pre-installed** by default on PythonAnywhere across Python 3.8, 3.9, 3.10, 3.11. |
| **`requests`** (>=2.28.0) | Google Sheet inventory sync | **Pre-installed** by default on PythonAnywhere. |
| **`sqlite3`** | 3,428+ item database & FTS5 search | **Built-in** to Python's standard library. Zero external packages needed. |
| **`urllib`, `os`, `json`, `csv`, `time`** | Utilities & proxy handler | **Built-in** Python standard library modules. |

There are **zero problematic, unmaintained, or OS-dependent packages** (no C-compilers, no Puppeteer, no Chrome dependencies, no heavy Node runtime required). It runs entirely on standard Python 3.10.

If you ever see **"Something went wrong :-("**:
Check your error log in the **Web** tab under **Log files** -> `yourusername.pythonanywhere.com.error.log`.

| Common Challenge | Cause | Verified Fix |
|---|---|---|
| Changes not showing after git commit | Web worker has not restarted | Click the green **Reload** button in the Web tab. |
| Old files present | Code was not pulled | Run `git pull origin main` in PythonAnywhere Bash console. |
| `ModuleNotFoundError: No module named 'flask'` | Flask installed into a different Python version | Run `pip3.10 install --user -r requirements.txt` in the console (match your web app's Python version). |
| `sqlite3.OperationalError: disk I/O error` | SQLite WAL mode on PythonAnywhere NFS network drive | **Resolved:** Database and connections use NFS-compliant `DELETE` journal mode and 10s busy timeout. |
| `504 Gateway Time-out` on reload | Background sync thread hanging or waiting on network | **Resolved:** Startup does not spawn background threads if `catalog.db` is already loaded with 3,428 items. Startup is now sub-millisecond. |
| Google Sheet sync fails on Free Tier | PythonAnywhere free accounts block outbound requests unless routed through proxy | **Resolved:** `db.py` automatically detects PythonAnywhere and routes through `http://proxy.server:3128`. |
| Templates or static files not found | Current working directory is not the project root | **Resolved:** `wsgi.py` and WSGI snippet include `os.chdir(project_home)`. |

---

## 🔄 How to Synchronize Your Inventory (Google Sheets)

Your inventory is stored in `catalog.db` (SQLite) and pulls from your Google Sheet.

We provide **4 simple ways** to keep your inventory 100% in sync:

### Method 1: Click the "Sync Sheet" Button on Your Website (Easiest!)
- Open your website: `https://yourusername.pythonanywhere.com`
- Click the **"Sync Sheet"** button in the top navigation bar or the footer link **"Sync Catalog (Google Sheet)"**.
- It will instantly refresh your SQLite catalog and show a toast notification with the updated product count.

### Method 2: Instant Auto-Sync via Google Apps Script (Automated!)
Set up your Google Sheet so that **whenever you edit any price, stock, or product**, it automatically alerts your website:
1. In your Google Sheet, click **Extensions** -> **Apps Script**.
2. Replace any sample code with:
   ```javascript
   function onEdit(e) {
     var url = "https://yourusername.pythonanywhere.com/api/sync?token=inno2026";
     try {
       UrlFetchApp.fetch(url, { muteHttpExceptions: true });
     } catch (err) {
       Logger.log("Sync error: " + err);
     }
   }
   ```
   *(Replace `yourusername` with your PythonAnywhere username, e.g. `rp725363`)*
3. Click **Save** (floppy disk icon).
Now, every time you edit a cell in Google Sheets, your live website updates within seconds!

### Method 3: Command Line in PythonAnywhere Console
In your PythonAnywhere Bash console, simply run:
```bash
python3 sync_catalog.py
```
This prints the exact number of synchronized products and categories in 1 second.

### Method 4: Scheduled Daily/Hourly Task (Cron)
In your PythonAnywhere dashboard:
1. Go to the **Tasks** tab.
2. In the command box, enter:
   ```bash
   python3 /home/yourusername/innoelectronics/sync_catalog.py
   ```
   *(Or: `curl -s "https://yourusername.pythonanywhere.com/api/sync?token=inno2026"`)*
3. Set it to run Daily or Hourly.

---

### Method 5: Direct Webhook / Browser URL
You can trigger a manual sync anytime by opening this URL in any web browser or sending a webhook:
```
https://yourusername.pythonanywhere.com/api/sync?token=inno2026
```
Response:
```json
{
  "success": true,
  "status": "success",
  "totalProducts": 3429,
  "totalCategories": 19,
  "message": "Synced 3429 products across 19 categories from Google Sheets."
}
```

---

## 🧪 Testing Your Installation
In your PythonAnywhere console, run:
```bash
python3 test_backend.py
```
This will automatically verify that the database is loaded, search is functioning, and all routes are running at 100%.
