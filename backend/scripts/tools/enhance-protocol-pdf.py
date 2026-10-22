import os
import sys
import glob
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import pymupdf

def enhance_page_image(im, scale=2.0, low_thresh=30, high_thresh=230):
    """
    Applies high-definition document enhancement:
    1. Lanczos upscale (smooth subpixel details)
    2. Median filter (removes JPEG compression noise/mosquito artifacts)
    3. Linear contrast stretch (pure white background, rich black text)
    4. Unsharp mask (crisp letter edges)
    """
    w, h = im.size
    up = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    
    # 1. Median filter to eliminate JPEG noise
    denoised = up.filter(ImageFilter.MedianFilter(size=3))
    
    # 2. Linear contrast stretch: maps low_thresh..high_thresh to 0..255
    def stretch_lut(x):
        if x <= low_thresh:
            return 0
        if x >= high_thresh:
            return 255
        return int(((x - low_thresh) / (high_thresh - low_thresh)) * 255)
    
    lut = [stretch_lut(i) for i in range(256)]
    stretched = denoised.point(lut * 3)
    
    # 3. Unsharp mask
    sharp = stretched.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=2))
    return sharp

def process_pdf(pdf_path, output_path=None):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Input file not found: {pdf_path}")
        
    if output_path is None:
        base_dir = os.path.dirname(pdf_path)
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        output_path = os.path.join(base_dir, f"{base_name}_enhanced.pdf")

    print(f"Opening PDF: {pdf_path}")
    doc = pymupdf.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    
    enhanced_pages = []
    
    for i, page in enumerate(doc):
        # Extract embedded image or render page at 200 DPI
        imgs = page.get_images()
        if len(imgs) == 1:
            xref = imgs[0][0]
            base_img = doc.extract_image(xref)
            from io import BytesIO
            pil_img = Image.open(BytesIO(base_img["image"])).convert("RGB")
            print(f"Page {i+1}: extracted embedded image ({pil_img.size[0]}x{pil_img.size[1]})")
        else:
            pix = page.get_pixmap(dpi=200)
            from io import BytesIO
            pil_img = Image.open(BytesIO(pix.tobytes("png"))).convert("RGB")
            print(f"Page {i+1}: rendered page at 200 DPI ({pil_img.size[0]}x{pil_img.size[1]})")

        print(f"Page {i+1}: enhancing text, removing noise, stretching contrast...")
        enhanced = enhance_page_image(pil_img)
        enhanced_pages.append(enhanced)

    print(f"Saving enhanced PDF to: {output_path}")
    if enhanced_pages:
        # Save multi-page PDF with 150 DPI tag so page physical size matches A4
        enhanced_pages[0].save(
            output_path,
            save_all=True,
            append_images=enhanced_pages[1:],
            resolution=150.0,
            quality=95
        )
        print("Success! Enhanced PDF created.")
        return output_path
    else:
        print("No pages processed.")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        in_pdf = sys.argv[1]
        out_pdf = sys.argv[2] if len(sys.argv) > 2 else None
        process_pdf(in_pdf, out_pdf)
    else:
        # Default test on 2022000
        target_dir = r"C:\Users\Antal\Documents\Google.Disk\Competitions\2026\2026-09-12 - Чемпионат России (Бега борзых) [Московская обл., ГО Сергиев По] [2022000]"
        target_pdf = os.path.join(target_dir, "protocol.pdf")
        process_pdf(target_pdf)
