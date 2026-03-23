import os
import re

# Directory to recursively search and replace
DIR_PATH = "app"

# Mapping from hardcoded classes to semantic classes
# Be careful with order: e.g. text-neutral-400 vs text-neutral-50
MAPPINGS = {
    # Backgrounds
    r"\bbg-neutral-950\b": "bg-background",
    r"\bbg-neutral-900\b": "bg-surface",
    r"\bhover:bg-neutral-800\b": "hover:bg-surface-hover",
    
    # Borders
    r"\bborder-neutral-800\b": "border-border",
    r"\bborder-neutral-900\b": "border-neutral-800", # Revert this specific hardcoded border exception on progress page
    
    # Text
    r"\btext-white\b": "text-foreground",
    r"\btext-neutral-200\b": "text-muted",
    r"\btext-neutral-300\b": "text-muted",
    r"\btext-neutral-400\b": "text-muted",
    r"\btext-neutral-500\b": "text-muted",
    r"\bbg-neutral-800\b": "bg-surface-hover", # Adding this generic hover surface
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in MAPPINGS.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    modified_files = 0
    for root, dirs, files in os.walk(DIR_PATH):
        for file in files:
            if file.endswith((".tsx", ".ts")):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    modified_files += 1
                    print(f"Updated: {filepath}")
    
    print(f"\nDone! Modified {modified_files} files.")

if __name__ == "__main__":
    main()
