import sys
import os

target_path = r'C:/Users/user/.gemini/antigravity/scratch/community-portal/frontend/src/pages/AdminPlaceholders.jsx'
temp_path = target_path + '.tmp'

try:
    with open(target_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # We want to remove lines 864 to 900 (1-indexed)
    # 0-indexed, that's lines[863] to lines[899]
    # Keep lines[0...862] and lines[900...]
    new_lines = lines[:863] + lines[900:]
    
    with open(temp_path, 'w', encoding='utf-8', newline='\n') as f:
        f.writelines(new_lines)
    
    os.replace(temp_path, target_path)
    print("SUCCESS: Removed lines 864-900")
except Exception as e:
    print(f"ERROR: {str(e)}")
    if os.path.exists(temp_path):
        os.remove(temp_path)
