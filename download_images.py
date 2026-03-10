import urllib.request                                           
import urllib.error
import os
import time
import random
import json
from pathlib import Path

# Configuration
BASE_PATH = Path("c:/Users/USER/Desktop/Healther/Healther Platform/assets/images")
DELAY_BETWEEN_REQUESTS = 0.5  # seconds
TIMEOUT = 10  # seconds
MAX_RETRIES = 3

# Create directories if they don't exist
directories = [
    BASE_PATH / "pharmacy",
    BASE_PATH / "healthcare", 
    BASE_PATH / "wellness",
    BASE_PATH / "labtests"
]

for dir_path in directories:
    dir_path.mkdir(parents=True, exist_ok=True)
    print(f"Created directory: {dir_path}")

# Pharmacy images with diverse URLs
pharmacy_images = [
    ("aspirin.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("vitamin_c.jpg", "https://images.unsplash.com/photo-1607619056934-87cb5b83461e?w=200&h=200&fit=crop"),
    ("bandages.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("ibuprofen.jpg", "https://images.unsplash.com/photo-1587854697333-2e827728e1fa?w=200&h=200&fit=crop"),
    ("hand_sanitizer.jpg", "https://images.unsplash.com/photo-1584464491033-06261a7315bf?w=200&h=200&fit=crop"),
    ("face_masks.jpg", "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=200&h=200&fit=crop"),
    ("thermometer.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("bp_monitor.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("glucose_monitor.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("nebulizer.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("pulse_oximeter.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("compression_stockings.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("crutches.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("wheelchair.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("hearing_aid.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("oxygen_tank.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("stethoscope.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("medical_kit.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("surgical_gloves.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("antibiotics.jpg", "https://images.unsplash.com/photo-1587854697333-2e827728e1fa?w=200&h=200&fit=crop"),
    ("vitamin_d.jpg", "https://images.unsplash.com/photo-1607619056934-87cb5b83461e?w=200&h=200&fit=crop"),
    ("probiotics.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("allergy_medicine.jpg", "https://images.unsplash.com/photo-1584464491033-06261a7315bf?w=200&h=200&fit=crop"),
    ("pain_relief_cream.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("sleep_aid.jpg", "https://images.unsplash.com/photo-1607619056934-87cb5b83461e?w=200&h=200&fit=crop"),
    ("eye_drops.jpg", "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=200&h=200&fit=crop"),
    ("cold_medicine.jpg", "https://images.unsplash.com/photo-1587854697333-2e827728e1fa?w=200&h=200&fit=crop"),
    ("first_aid_kit.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("medical_tape.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("infrared_thermometer.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("smart_bp_monitor.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("medical_scale.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("premium_medical.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop")
]

# Healthcare images with diverse URLs
healthcare_images = [
    ("general_consultation.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("dental_checkup.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("eye_exam.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("blood_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("cardiology.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("dermatology.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("pediatric.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("orthopedic.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("neurology.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("gynecology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("ent.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("psychiatry.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("emergency_room.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("ultrasound.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("mri_scan.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("ct_scan.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("physical_therapy.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("nutritionist.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("vaccination.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("telemedicine.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("home_nursing.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("chronic_disease.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("preventive_care.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("mental_health.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("surgery.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c9903c3b?w=200&h=200&fit=crop"),
    ("allergy_testing.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("sleep_study.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("genetic_counseling.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("pain_management.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("rehabilitation.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("womens_health.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("mens_health.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("senior_care.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("travel_medicine.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("occupational_health.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("sports_medicine.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("endocrinology.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("rheumatology.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("gastroenterology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("pulmonology.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("nephrology.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop")
]

# Wellness images with diverse URLs
wellness_images = [
    ("yoga_mat.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("protein_powder.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("meditation_cushion.jpg", "https://images.unsplash.com/photo-1545166416-5b6315d9e6c4?w=200&h=200&fit=crop"),
    ("essential_oils.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("resistance_bands.jpg", "https://images.unsplash.com/photo-1584362925356-4cf0a5e3a2a?w=200&h=200&fit=crop"),
    ("foam_roller.jpg", "https://images.unsplash.com/photo-1517894918767-4eaf4ef1b2d8?w=200&h=200&fit=crop"),
    ("exercise_ball.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("dumbbells.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("jump_rope.jpg", "https://images.unsplash.com/photo-1584362925356-4cf0a5e3a2a?w=200&h=200&fit=crop"),
    ("pilates_ring.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("massage_ball.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("balance_board.jpg", "https://images.unsplash.com/photo-1517894918767-4eaf4ef1b2d8?w=200&h=200&fit=crop"),
    ("kettlebells.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("yoga_blocks.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("sleep_mask.jpg", "https://images.unsplash.com/photo-1545166416-5b6315d9e6c4?w=200&h=200&fit=crop"),
    ("acupressure_mat.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("pre_workout.jpg", "https://images.unsplash.com/photo-1571019613459-073b33aa028b?w=200&h=200&fit=crop"),
    ("post_workout.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("stretching_strap.jpg", "https://images.unsplash.com/photo-1517894918767-4eaf4ef1b2d8?w=200&h=200&fit=crop"),
    ("fitness_tracker.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("water_bottle.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("gym_bag.jpg", "https://images.unsplash.com/photo-1545166416-5b6315d9e6c4?w=200&h=200&fit=crop"),
    ("running_shoes.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("exercise_gloves.jpg", "https://images.unsplash.com/photo-1517894918767-4eaf4ef1b2d8?w=200&h=200&fit=crop"),
    ("workout_journal.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("muscle_roller.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("cooling_towel.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("compression_sleeves.jpg", "https://images.unsplash.com/photo-1517894918767-4eaf4ef1b2d8?w=200&h=200&fit=crop"),
    ("resistance_tubes.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("yoga_wheel.jpg", "https://images.unsplash.com/photo-1594746883505-8c3980a8e3e?w=200&h=200&fit=crop"),
    ("sliders.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop"),
    ("battle_ropes.jpg", "https://images.unsplash.com/photo-1545166416-5b6315d9e6c4?w=200&h=200&fit=crop"),
    ("medicine_ball.jpg", "https://images.unsplash.com/photo-1603056144-2b0c4f9a5a1a?w=200&h=200&fit=crop")
]

# Lab Tests images with diverse URLs
labtest_images = [
    ("covid_test.jpg", "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=200&h=200&fit=crop"),
    ("cholesterol_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("xray.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("allergy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("blood_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("mri_scan.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("ct_scan.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("ultrasound.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("ekg.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("diabetes_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("thyroid_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("kidney_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("liver_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("vitamin_d_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("iron_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("hormone_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("genetic_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("cancer_screening.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("pregnancy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("std_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("drug_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("heavy_metals_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("food_allergy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("environmental_allergy_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("autoimmune_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("cardiac_risk_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("bone_density_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("sleep_study.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("mammogram.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("colonoscopy.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("pap_smear.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("psa_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("hepatitis_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("hiv_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("urine_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("stool_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("pulmonary_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("metabolic_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("nutritional_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop")
]

def validate_url(url):
    """Basic URL validation"""
    if not url.startswith(('http://', 'https://')):
        return False
    if not any(domain in url for domain in ['unsplash.com', 'images.unsplash.com']):
        print(f"Warning: URL may not be from Unsplash: {url}")
    return True

def download_image(filename, url, directory, retry_count=0):
    """Download a single image with retry mechanism"""
    filepath = directory / filename
    
    # Skip if file already exists
    if filepath.exists():
        print(f"⏭️  Skipped {filename} (already exists)")
        return True
    
    # Validate URL
    if not validate_url(url):
        print(f"❌ Invalid URL for {filename}: {url}")
        return False
    
    try:
        # Add headers to mimic browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            if response.status == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.read())
                print(f"✅ Downloaded {filename}")
                return True
            else:
                print(f"❌ HTTP {response.status} for {filename}")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error for {filename}: {e.code} - {e.reason}")
    except urllib.error.URLError as e:
        print(f"❌ URL Error for {filename}: {e.reason}")
    except Exception as e:
        print(f"❌ Unexpected error for {filename}: {str(e)}")
    
    # Retry logic
    if retry_count < MAX_RETRIES:
        retry_count += 1
        wait_time = DELAY_BETWEEN_REQUESTS * retry_count
        print(f"🔄 Retrying {filename} (attempt {retry_count}/{MAX_RETRIES}) in {wait_time}s...")
        time.sleep(wait_time)
        return download_image(filename, url, directory, retry_count)
    
    return False

def download_images(image_list, directory):
    """Download all images in a list with progress tracking"""
    print(f"\n📁 Downloading to: {directory}")
    print(f"📊 Total images: {len(image_list)}")
    
    success_count = 0
    failed_count = 0
    
    for i, (filename, url) in enumerate(image_list, 1):
        print(f"📈 Progress: {i}/{len(image_list)} ({(i/len(image_list)*100):.1f}%)")
        
        if download_image(filename, url, directory):
            success_count += 1
        else:
            failed_count += 1
        
        # Rate limiting with random delay
        if i < len(image_list):  # Don't delay after the last image
            delay = DELAY_BETWEEN_REQUESTS + random.uniform(0, 0.2)
            time.sleep(delay)
    
    print(f"\n📈 Summary for {directory.name}:")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📊 Success Rate: {(success_count/len(image_list)*100):.1f}%")
    
    return success_count, failed_count

# Main execution
if __name__ == "__main__":
    print("🚀 Starting Healther Image Downloader")
    print(f"⚙️  Configuration:")
    print(f"   - Base Path: {BASE_PATH}")
    print(f"   - Delay: {DELAY_BETWEEN_REQUESTS}s")
    print(f"   - Timeout: {TIMEOUT}s")
    print(f"   - Max Retries: {MAX_RETRIES}")
    print("=" * 50)
    
    total_success = 0
    total_failed = 0
    
    # Download all image sets
    print("\n🏥 Downloading pharmacy images...")
    success, failed = download_images(pharmacy_images, BASE_PATH / "pharmacy")
    total_success += success
    total_failed += failed
    
    print("\n🩺 Downloading healthcare images...")
    success, failed = download_images(healthcare_images, BASE_PATH / "healthcare")
    total_success += success
    total_failed += failed
    
    print("\n🧘 Downloading wellness images...")
    success, failed = download_images(wellness_images, BASE_PATH / "wellness")
    total_success += success
    total_failed += failed
    
    print("\n🔬 Downloading lab test images...")
    success, failed = download_images(labtest_images, BASE_PATH / "labtests")
    total_success += success
    total_failed += failed
    
    # Final summary
    print("\n" + "=" * 50)
    print("🏁 FINAL SUMMARY")
    print("=" * 50)
    print(f"✅ Total Success: {total_success}")
    print(f"❌ Total Failed: {total_failed}")
    print(f"📊 Overall Success Rate: {(total_success/(total_success+total_failed)*100):.1f}%")
    
    if total_failed > 0:
        print(f"\n⚠️  {total_failed} images failed to download.")
        print("   Check the logs above for details.")
    else:
        print(f"\n🎉 All images downloaded successfully!")
    
    print(f"\n📁 Images saved to: {BASE_PATH}")
    print("✨ Done!")
    
    # Generate HTML image references for Healther pages
    generate_html_references()

def generate_html_references():
    """Generate HTML image references for Healther web pages"""
    print("\n🌐 Generating HTML image references...")
    
    # Create HTML reference file
    html_file = BASE_PATH / "image_references.html"
    
    with open(html_file, 'w') as f:
        f.write("<!-- Healther Platform Image References -->\n")
        f.write("<!-- Auto-generated by download_images.py -->\n\n")
        
        # Pharmacy images
        f.write("<!-- Pharmacy Images -->\n")
        for filename, url in pharmacy_images:
            alt_text = filename.replace('.jpg', '').replace('_', ' ').title()
            f.write(f'<img src="../assets/images/pharmacy/{filename}" alt="{alt_text}" />\n')
        
        # Healthcare images  
        f.write("\n<!-- Healthcare Images -->\n")
        for filename, url in healthcare_images:
            alt_text = filename.replace('.jpg', '').replace('_', ' ').title()
            f.write(f'<img src="../assets/images/healthcare/{filename}" alt="{alt_text}" />\n')
        
        # Wellness images
        f.write("\n<!-- Wellness Images -->\n")
        for filename, url in wellness_images:
            alt_text = filename.replace('.jpg', '').replace('_', ' ').title()
            f.write(f'<img src="../assets/images/wellness/{filename}" alt="{alt_text}" />\n')
        
        # Lab test images
        f.write("\n<!-- Lab Test Images -->\n")
        for filename, url in labtest_images:
            alt_text = filename.replace('.jpg', '').replace('_', ' ').title()
            f.write(f'<img src="../assets/images/labtests/{filename}" alt="{alt_text}" />\n')
    
    print(f"✅ HTML references saved to: {html_file}")
    
    # Create JSON mapping for dynamic loading
    json_file = BASE_PATH / "image_mapping.json"
    
    # Build image mapping for each category
    image_mapping = {}
    
    image_mapping["pharmacy"] = []
    for filename, url in pharmacy_images:
        name = filename.replace('.jpg', '').replace('_', ' ').title()
        path = f"../assets/images/pharmacy/{filename}"
        image_mapping["pharmacy"].append({"name": name, "path": path, "url": url})
    
    image_mapping["healthcare"] = []
    for filename, url in healthcare_images:
        name = filename.replace('.jpg', '').replace('_', ' ').title()
        path = f"../assets/images/healthcare/{filename}"
        image_mapping["healthcare"].append({"name": name, "path": path, "url": url})
    
    image_mapping["wellness"] = []
    for filename, url in wellness_images:
        name = filename.replace('.jpg', '').replace('_', ' ').title()
        path = f"../assets/images/wellness/{filename}"
        image_mapping["wellness"].append({"name": name, "path": path, "url": url})
    
    image_mapping["labtests"] = []
    for filename, url in labtest_images:
        name = filename.replace('.jpg', '').replace('_', ' ').title()
        path = f"../assets/images/labtests/{filename}"
        image_mapping["labtests"].append({"name": name, "path": path, "url": url})
    
    with open(json_file, 'w') as f:
        json.dump(image_mapping, f, indent=2)
    
    print(f"✅ JSON mapping saved to: {json_file}")
    print("🌐 Images can now be referenced in Healther pages!")
