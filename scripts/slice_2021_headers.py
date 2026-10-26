from PIL import Image
import os

os.makedirs('data/tmp/procoursing_2021/slices', exist_ok=True)

images = [
    ('2021-06-13.webp', 'header_20210613.png', 500),
    ('2021-09-19_R.webp', 'header_20210919_R.png', 400),
    ('2021-09-19_C.webp', 'header_20210919_C.png', 400),
    ('2021-10-10.webp', 'header_20211010.png', 500),
    ('2021-10-24.webp', 'header_20211024.png', 400),
]

for name, out, h in images:
    im = Image.open(os.path.join('data/tmp/procoursing_2021', name))
    crop = im.crop((0, 0, im.width, min(h, im.height)))
    crop.save(os.path.join('data/tmp/procoursing_2021/slices', out))
    print(f'Saved {out}')
