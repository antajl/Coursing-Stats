import urllib.request
import os
import re
from urllib.parse import urljoin

base_url = "http://www.procoursing.ru/"
s_2022_url = "http://www.procoursing.ru/s_2022.html"

out_dir = "data/tmp/procoursing_2022"
os.makedirs(out_dir, exist_ok=True)

print("Fetching s_2022.html...")
req = urllib.request.Request(s_2022_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('windows-1251', errors='replace')

# Find all links in s_2022.html
links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, flags=re.DOTALL | re.IGNORECASE)

downloaded = set()
results_pages = []
catalog_files = []

for href, text in links:
    href = href.strip()
    full_url = urljoin(s_2022_url, href)
    
    if href.endswith('.pdf'):
        catalog_files.append((full_url, href))
    elif 'results/2022' in full_url or 'Complete_Results_2022' in full_url:
        results_pages.append((full_url, href))

print(f"Found {len(catalog_files)} PDFs and {len(results_pages)} results pages.")

def download_file(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        print(f"  Already exists: {target_path}")
        return True
    try:
        r = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(r, timeout=15) as resp:
            content = resp.read()
            with open(target_path, "wb") as f:
                f.write(content)
        print(f"  Downloaded: {target_path} ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"  Failed to download {url}: {e}")
        return False

# 1. Download catalogs
print("\n--- Downloading Catalogs ---")
for url, rel in catalog_files:
    fname = os.path.basename(rel)
    target = os.path.join(out_dir, fname)
    download_file(url, target)

# 2. Inspect results pages to find webp images
print("\n--- Inspecting Results Pages ---")
for url, rel in results_pages:
    print(f"\nProcessing results page: {url}")
    try:
        r = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(r, timeout=10) as resp:
            page_content = resp.read().decode('windows-1251', errors='replace')
        
        # Save html
        page_slug = re.sub(r'[^a-zA-Z0-9_\-]', '_', rel.strip('/'))
        html_target = os.path.join(out_dir, f"{page_slug}.html")
        with open(html_target, "w", encoding="utf-8") as f:
            f.write(page_content)
        
        # Find images
        img_srcs = re.findall(r'<img\s+[^>]*src=["\']([^"\']+)["\']', page_content, flags=re.IGNORECASE)
        for img_src in img_srcs:
            img_url = urljoin(url, img_src)
            img_fname = os.path.basename(img_src)
            img_target = os.path.join(out_dir, img_fname)
            print(f"  Found image: {img_url} -> {img_fname}")
            download_file(img_url, img_target)
            
    except Exception as e:
        print(f"  Error on page {url}: {e}")

print("\nDownload routine complete.")
