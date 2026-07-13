from PIL import Image, ImageDraw
import sys

def create_green_rounded_icon(input_path, output_path, corner_radius, bg_color):
    try:
        # Open the transparent logo
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate size (make it a bit larger to add padding)
        size = max(img.size)
        bg_size = (size + 40, size + 40)
        
        # Create a solid green background
        bg = Image.new("RGBA", bg_size, bg_color)
        
        # Paste the transparent logo in the center
        offset = ((bg_size[0] - img.size[0]) // 2, (bg_size[1] - img.size[1]) // 2)
        bg.paste(img, offset, img)
        
        # Create a mask for rounded corners
        mask = Image.new("L", bg_size, 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle([(0, 0), bg_size], radius=corner_radius, fill=255)
        
        # Apply the mask to the image
        rounded_img = Image.new("RGBA", bg_size, (0, 0, 0, 0))
        rounded_img.paste(bg, mask=mask)
        
        # Save the result as the new icon
        rounded_img.save(output_path, format="PNG")
        print("Successfully created green rounded icon at:", output_path)
    except Exception as e:
        print("Error creating rounded icon:", e)
        sys.exit(1)

if __name__ == "__main__":
    # Create the icon with the requested theme color #e3f1e7
    create_green_rounded_icon("public/logo.png", "public/logo-favicon.png", 64, "#e3f1e7")
