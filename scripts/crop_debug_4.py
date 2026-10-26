from PIL import Image

im = Image.open('data/tmp/procoursing_2022/2022-04-16_C.webp')

# 1. Cat 25 JELANY RED TROY (around y=1700-1900)
# 2. Cat 30 PODAROK IS AFRIKI (around y=1850-2000)
# 3. Cat 47 SALGREY'S PRODIGY (around y=2850-3050)
# 4. Cat 95 SNOW SWALLOW (around y=4050-4250)

im.crop((600, 1600, 1440, 2050)).save('C:/Users/Antal/.gemini/antigravity/brain/86fb3f94-5d73-4941-a838-af4e92e3d8ed/check_dogs_1_2.png')
im.crop((600, 2800, 1440, 3100)).save('C:/Users/Antal/.gemini/antigravity/brain/86fb3f94-5d73-4941-a838-af4e92e3d8ed/check_dog_3.png')
im.crop((600, 4000, 1440, 4300)).save('C:/Users/Antal/.gemini/antigravity/brain/86fb3f94-5d73-4941-a838-af4e92e3d8ed/check_dog_4.png')
print("Saved 3 debug crops.")
