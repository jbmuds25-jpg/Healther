import urllib.request
import os

# Create directories if they don't exist
directories = [
    "frontend/assets/images/pharmacy",
    "frontend/assets/images/healthcare", 
    "frontend/assets/images/wellness",
    "frontend/assets/images/labtests"
]

for dir_path in directories:
    os.makedirs(dir_path, exist_ok=True)

# Pharmacy images
pharmacy_images = [
    ("aspirin.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c
    9903c3b?w=200&h=200&fit=crop"),
    ("vitamin_c.jpg", "https://images.unsplash.com/photo-1607619056934-87cb5b83461e?w=200&h=200&fit=crop"),
    ("bandages.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("ibuprofen.jpg", "https://images.unsplash.com/photo-1587854697333-2e827728e1fa?w=200&h=200&fit=crop"),
    ("hand_sanitizer.jpg", "https://images.unsplash.com/photo-1584464491033-06261a7315bf?w=200&h=200&fit=crop"),
    ("face_masks.jpg", "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=200&h=200&fit=crop"),
    ("thermometer.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("bp_monitor.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("glucose_monitor.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("nebulizer.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("pulse_oximeter.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("compression_stockings.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("crutches.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("wheelchair.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("hearing_aid.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("oxygen_tank.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("stethoscope.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("medical_kit.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("surgical_gloves.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("antibiotics.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("vitamin_d.jpg", "https://images.unsplash.com/photo-1607619056934-87cb5b83461e?w=200&h=200&fit=crop"),
    ("probiotics.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("allergy_medicine.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("pain_relief_cream.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("sleep_aid.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("eye_drops.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("cold_medicine.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("first_aid_kit.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("medical_tape.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("infrared_thermometer.jpg", "https://images.unsplash.com/photo-1559181567-c3190ca385978?w=200&h=200&fit=crop"),
    ("smart_bp_monitor.jpg", "https://images.unsplash.com/photo-1605497785122-1c2e75dfb4b8?w=200&h=200&fit=crop"),
    ("medical_scale.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("premium_medical.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop")
]

# Healthcare images
healthcare_images = [
    ("general_consultation.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("dental_checkup.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("eye_exam.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("blood_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("cardiology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("dermatology.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("pediatric.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("orthopedic.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("neurology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("gynecology.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("ent.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("psychiatry.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("emergency_room.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("ultrasound.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("mri_scan.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("ct_scan.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("physical_therapy.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("nutritionist.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("vaccination.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("telemedicine.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("home_nursing.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("chronic_disease.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("preventive_care.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("mental_health.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("surgery.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("allergy_testing.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("sleep_study.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("genetic_counseling.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("pain_management.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("rehabilitation.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("womens_health.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("mens_health.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("senior_care.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("travel_medicine.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("occupational_health.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("sports_medicine.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("endocrinology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("rheumatology.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("gastroenterology.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("pulmonology.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("nephrology.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop")
]

# Wellness images
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

# Lab Tests images
labtest_images = [
    ("covid_test.jpg", "https://images.unsplash.com/photo-1584116769339-7c38b40b9b17?w=200&h=200&fit=crop"),
    ("cholesterol_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("xray.jpg", "https://images.unsplash.com/photo-1559839734-67b19d34a53e?w=200&h=200&fit=crop"),
    ("allergy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("blood_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("mri_scan.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("ct_scan.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("ultrasound.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("ekg.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("diabetes_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("thyroid_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("kidney_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("liver_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("vitamin_d_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("iron_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("hormone_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("genetic_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("cancer_screening.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("pregnancy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("std_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("drug_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("heavy_metals_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("food_allergy_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("environmental_allergy_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("autoimmune_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("cardiac_risk_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("bone_density_test.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("sleep_study.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("mammogram.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("colonoscopy.jpg", "https://images.unsplash.com/photo-1582750415299-4e9b2ff25334?w=200&h=200&fit=crop"),
    ("pap_smear.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("psa_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("hepatitis_test.jpg", "https://images.unsplash.com/photo-1576091160550-2173dba999efc?w=200&h=200&fit=crop"),
    ("hiv_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("urine_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("stool_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("pulmonary_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("metabolic_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop"),
    ("nutritional_test.jpg", "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop")
]

# Download all images
def download_images(image_list, directory):
    for filename, url in image_list:
        try:
            urllib.request.urlretrieve(url, os.path.join(directory, filename))
            print(f"Downloaded {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

# Download all image sets
print("Downloading pharmacy images...")
download_images(pharmacy_images, "c:/Users/USER/Desktop/Healther/Healther Platform/assets/images/pharmacy")

print("Downloading healthcare images...")
download_images(healthcare_images, "c:/Users/USER/Desktop/Healther/Healther Platform/assets/images/healthcare")

print("Downloading wellness images...")
download_images(wellness_images, "c:/Users/USER/Desktop/Healther/Healther Platform/assets/images/wellness")

print("Downloading lab test images...")
download_images(labtest_images, "c:/Users/USER/Desktop/Healther/Healther Platform/assets/images/labtests")

print("All images downloaded successfully!")
