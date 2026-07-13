from PIL import Image
import sys

def crop_transparent(image_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            cropped = img.crop(bbox)
            cropped.save(image_path)
            print("Cropped successfully to", bbox)
        else:
            print("Image is entirely transparent or couldn't find bounding box.")
    except Exception as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    crop_transparent(sys.argv[1])
