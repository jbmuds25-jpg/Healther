import os

# List of required images
required_images = [
    "frontend/assets/images/pharmacy/bandages.jpg",
    "frontend/assets/images/pharmacy/first_aid_kit.jpg",
    "frontend/assets/images/pharmacy/medical_scale.jpg",
    "frontend/assets/images/pharmacy/premium_medical.jpg",
    "frontend/assets/images/pharmacy/thermometer.jpg",
    "frontend/assets/images/pharmacy/glucose_monitor.jpg",
    "frontend/assets/images/pharmacy/nebulizer.jpg",
    "frontend/assets/images/pharmacy/pulse_oximeter.jpg",
    "frontend/assets/images/pharmacy/compression_stockings.jpg",
    "frontend/assets/images/pharmacy/crutches.jpg",
    "frontend/assets/images/pharmacy/hearing_aid.jpg",
    "frontend/assets/images/pharmacy/oxygen_tank.jpg",
    "frontend/assets/images/pharmacy/stethoscope.jpg",
    "frontend/assets/images/pharmacy/surgical_gloves.jpg",
    "frontend/assets/images/pharmacy/medical_kit.jpg"
    "frontend/assets/images/pharmacy/antibiotics.jpg",
    "frontend/assets/images/pharmacy/allergy_medicine.jpg",
    "frontend/assets/images/pharmacy/pain_relief_cream.jpg",
    "frontend/assets/images/pharmacy/sleep_aid.jpg",
    "frontend/assets/images/pharmacy/eye_drops.jpg",
    "frontend/assets/images/pharmacy/cold_medicine.jpg",
    "frontend/assets/images/pharmacy/vitamin_d.jpg",
    "frontend/assets/images/pharmacy/ibuprofen.jpg"
]

# Check if images exist, create placeholders if they don't
def ensure_images():
    missing_images = []
    
    for image_path in required_images:
        if not os.path.exists(image_path):
            missing_images.append(image_path)
            print(f"Missing: {image_path}")
        else:
            print(f"Exists: {image_path}")
    
    if missing_images:
        print(f"\nMissing {len(missing_images)} images. Please run download_images.py first.")
        return False
    
    print(f"All {len(required_images)} required images exist.")
    return True

if __name__ == "__main__":
    ensure_images()
