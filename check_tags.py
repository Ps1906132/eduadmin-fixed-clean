
import re

def check_tags(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    
    # Simple regex for finding tags. 
    # Does not handle self-closing tags perfectly if they aren't marked as such (e.g. <br> vs <br/>), but in JSX <br> is invalid.
    # We focus on div, main, section, etc.
    
    # Regex to find tags: <tagName ... > or </tagName>
    # We ignore self closing <tagName ... />
    
    tag_pattern = re.compile(r'<(/?)(\w+)([^>]*)>')
    
    for line_idx, line in enumerate(lines):
        # Remove strings to avoid matching tags inside strings
        # Simplified string removal
        line_clean = re.sub(r'["\'].*?["\']', '""', line)
        line_clean = re.sub(r'`.*?`', '``', line_clean)
        
        matches = tag_pattern.finditer(line_clean)
        for match in matches:
            is_closing = match.group(1) == '/'
            tag_name = match.group(2)
            rest = match.group(3)
            
            # Skip self-closing void elements in HTML if using strict JSX? In JSX <input> is error, must be <input />
            # We assume valid JSX is intended.
            
            if rest.strip().endswith('/'):
                continue # <div />
            
            # Common void elements in HTML, but in JSX they MUST be self-closed.
            # If the user wrote <input>, that's an error in JSX too, but might be what we are looking for.
            
            if is_closing:
                if not stack:
                    print(f"Error: Unexpected closing </{tag_name}> at line {line_idx+1}")
                    continue
                
                last_tag, last_line = stack.pop()
                if last_tag != tag_name:
                     # Allow some flexibility? No, JSX is strict.
                     print(f"Error: Mismatched closing </{tag_name}> at line {line_idx+1}. Expected closing for <{last_tag}> from line {last_line}")
                     # Put it back to continue checking?
                     # stack.append((last_tag, last_line)) 
                     # If we found a mismatch, usually everything after is garbage.
                     return
            else:
                 # Check if it is a known void element that MIGHT be unclosed effectively?
                 # In TSX, <input> without closing is error.
                 # We track everything.
                 stack.append((tag_name, line_idx+1))
                 
    if stack:
        print(f"Error: Unclosed tags remaining:")
        for tag, line in stack[-5:]: # Show last 5
            print(f"<{tag}> from line {line}")

check_tags("d:/01. PROJEK 2025/Projek 2025/Sistem Informasi/eduadmin---sistem-manajemen-sekolah/components/DashboardSuperAdmin.tsx")
