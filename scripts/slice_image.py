import os
from PIL import Image

def slice_image(img_path, out_dir, slice_height=1000, overlap=100):
    os.makedirs(out_dir, exist_ok=True)
    im = Image.open(img_path)
    w, h = im.size
    print(f"Image {img_path} size: {w}x{h}")
    
    y = 0
    idx = 1
    slices = []
    while y < h:
        y_end = min(y + slice_height, h)
        box = (0, y, w, y_end)
        slice_im = im.crop(box)
        slice_name = f"slice_{idx:02d}_{y}_{y_end}.png"
        slice_path = os.path.join(out_dir, slice_name)
        slice_im.save(slice_path)
        slices.append((idx, y, y_end, slice_path))
        print(f"Saved slice {idx}: y=[{y}..{y_end}] -> {slice_name}")
        if y_end == h:
            break
        y += slice_height - overlap
        idx += 1
    return slices

if __name__ == '__main__':
    import sys
    img = sys.argv[1] if len(sys.argv) > 1 else 'data/tmp/procoursing_2022/2022-04-16_C.webp'
    out = sys.argv[2] if len(sys.argv) > 2 else 'C:/Users/Antal/.gemini/antigravity/brain/86fb3f94-5d73-4941-a838-af4e92e3d8ed/slices_20220416'
    slice_image(img, out, slice_height=1000, overlap=100)
