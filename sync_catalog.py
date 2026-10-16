#!/usr/bin/env python3
"""
Innoelectronics - Standalone Catalog Synchronizer
Directly syncs the SQLite database from Google Sheets.
Can be executed in the PythonAnywhere console or scheduled as a PythonAnywhere Task (Cron).

Usage:
    python3 sync_catalog.py
"""
import sys
import time
import db

def main():
    print("=" * 60)
    print("Innoelectronics Catalog Synchronizer")
    print("Connecting to Google Sheets...")
    print(f"Sheet ID: {db.SHEET_ID} | Sheet Tab: {db.SHEET_NAME}")
    print("=" * 60)

    start_time = time.time()
    db.init_db()
    result = db.sync_products_from_sheet(force=True)
    duration = round(time.time() - start_time, 2)

    if result.get('status') == 'success':
        summary = db.get_catalog_summary()
        print(f"\n[SUCCESS] Catalog synchronized in {duration}s!")
        print(f"  + Total Products : {summary['totalProducts']}")
        print(f"  + Total Categories: {summary['totalCategories']}")
        print("  + Database Location : catalog.db")
        print("\nAll changes from your Google Sheet are now live on your website!\n")
        sys.exit(0)
    else:
        print(f"\n[ERROR] Sync failed: {result.get('message', 'Unknown error')}")
        print("Please check your internet connection or Google Sheet sharing permissions.")
        sys.exit(1)

if __name__ == '__main__':
    main()
