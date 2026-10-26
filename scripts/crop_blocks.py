import os
from PIL import Image

def crop_box(img_path, box, out_path):
    im = Image.open(img_path)
    cropped = im.crop(box)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    cropped.save(out_path)
    print(f"Saved crop {box} -> {out_path}")

if __name__ == '__main__':
    # We can crop specific Y ranges of 2022-04-16_C.webp
    crops = [
        ("basenji", (0, 100, 1440, 800)),
        ("greyhound_wolfhound", (0, 750, 1440, 1400)),
        ("levretka_rhodesian", (0, 1350, 1440, 2050)),
        ("rhodesian_borzaya_m", (0, 2000, 1440, 2600)),
        ("borzaya_f_saluki_thai", (0, 2550, 1440, 3200)),
        ("whippet_vet_m", (0, 3150, 1440, 3800)),
        ("whippet_f_p1", (0, 3750, 1440, 4400)),
        ("whippet_f_p2_sprinter_m", (0, 4350, 1440, 5000)),
        ("sprinter_f_pharaoh_cirneco_absent", (0, 4950, 1440, 5903)),
    ]
    for name, box in crops:
        out_p = f"C:/Users/Antal/.gemini/antigravity/brain/86fb3f94-5d73-4941-a838-af4e92e3d8ed/crops_20220416/{name}.png"
        crop_box("data/tmp/procoursing_2022/2022-04-16_C.webp", box, out_p)
