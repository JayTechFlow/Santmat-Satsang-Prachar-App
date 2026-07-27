import os
import re

src_dir = 'src'
pages_dir = os.path.join(src_dir, 'pages')
features_dir = os.path.join(src_dir, 'features')

legacy_modules = ['Books', 'StutiVinati', 'Suvichar', 'Banners', 'Categories', 'Notifications']
feature_modules = ['Bhajans', 'Dashboard']

def scan_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

print("=== MIGRATION MATRIX ===")
print(f"{'Module':<20} | {'CRUD?':<6} | {'Storage?':<8} | {'Validation?':<12} | {'ErrorMapping?':<14} | {'Complexity'}")
print("-" * 70)

modules = [
    ('Books', 'src/pages/Books.tsx'),
    ('Stuti-Vinati', 'src/pages/StutiVinati.tsx'),
    ('Suvichar', 'src/pages/Suvichar.tsx'),
    ('Banners', 'src/pages/Banners.tsx'),
    ('Categories', 'src/pages/Categories.tsx'),
    ('Notifications', 'src/pages/Notifications.tsx'),
    ('Users', 'None'),
    ('Reports', 'None'),
    ('Settings', 'None'),
]

for mod, filepath in modules:
    if filepath == 'None' or not os.path.exists(filepath):
        print(f"{mod:<20} | {'No':<6} | {'No':<8} | {'No':<12} | {'No':<14} | {'N/A (Not implemented)'}")
        continue
    
    content = scan_file(filepath)
    
    uses_crud = "useCrud" in content or "BaseCrudService" in content
    uses_storage = "StorageService" in content or "storageService" in content
    uses_validation = "validation/validators" in content or "required(" in content
    uses_error_map = "mapError(" in content or "AppError" in content
    
    # Estimate complexity based on lines of code and direct firestore usage
    loc = len(content.splitlines())
    direct_firestore = len(re.findall(r'from \'firebase/firestore\'', content)) > 0
    direct_storage = len(re.findall(r'from \'firebase/storage\'', content)) > 0
    
    complexity = 'Low'
    if loc > 250 or direct_storage:
        complexity = 'High'
    elif loc > 150 or direct_firestore:
        complexity = 'Medium'
        
    print(f"{mod:<20} | {'Yes' if uses_crud else 'No':<6} | {'Yes' if uses_storage else 'No':<8} | {'Yes' if uses_validation else 'No':<12} | {'Yes' if uses_error_map else 'No':<14} | {complexity}")

print("\n=== CODE DUPLICATION AUDIT ===")
duplicates = {
    'Firebase queries (collection, getDocs, etc.)': r'(collection\(db|getDocs\(|addDoc\(|updateDoc\()',
    'Storage uploads (ref, uploadBytes)': r'(ref\(storage|uploadBytesResumable)',
    'Validation logic (if !value, etc.)': r'(if \(!\w+\) {)',
    'Toast logic (success\(, error\()': r'(success\("|error\(")',
}

def scan_directory_for_dupes(directory):
    results = {k: 0 for k in duplicates}
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(('.tsx', '.ts')):
                continue
            filepath = os.path.join(root, file)
            # Skip core
            if 'src/core' in filepath:
                continue
            content = scan_file(filepath)
            for name, pattern in duplicates.items():
                if re.search(pattern, content):
                    results[name] += 1
    return results

dupes = scan_directory_for_dupes('src')
for name, count in dupes.items():
    print(f"{name}: Found in {count} files outside core")

print("\n=== ARCHITECTURE COMPLIANCE ===")
# Look for components importing firebase directly instead of through a service/hook
for root, _, files in os.walk('src'):
    for file in files:
        if not file.endswith('.tsx'): continue
        filepath = os.path.join(root, file)
        content = scan_file(filepath)
        if 'firebase/firestore' in content or 'firebase/storage' in content:
            print(f"Violation: {filepath} imports Firebase directly.")

