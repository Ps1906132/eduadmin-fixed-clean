
def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    
    # We only care about ensuring that logical blocks are closed.
    # Specifically {} and ().
    # We must ignore strings and comments.
    
    in_string = False
    string_char = ''
    in_comment = False # /* */
    
    for line_idx, line in enumerate(lines):
        i = 0
        while i < len(line):
            char = line[i]
            
            # Simple parser (not perfect but helpful)
            if in_string:
                if char == string_char:
                    # check escaped
                    if i > 0 and line[i-1] == '\\':
                        pass
                    else:
                        in_string = False
            elif in_comment:
                if char == '*' and i+1 < len(line) and line[i+1] == '/':
                    in_comment = False
                    i += 1
            else:
                if char == '"' or char == "'":
                    in_string = True
                    string_char = char
                elif char == '`':
                    in_string = True
                    string_char = char # Template literal can be multiline, simplified here
                elif char == '/' and i+1 < len(line) and line[i+1] == '*':
                    in_comment = True
                    i += 1
                elif char == '/' and i+1 < len(line) and line[i+1] == '/':
                    break # Line comment
                elif char in '{([<':
                    # We usually don't balance < > in JSX rigidly because of component usage, 
                    # but { ( [ are critical.
                    # Especially { and ( for code blocks.
                    if char in '{(':
                        stack.append((char, line_idx + 1))
                elif char in '})]':
                    if char in '})':
                        if not stack:
                            print(f"Error: Unexpected closing {char} at line {line_idx+1}")
                            return
                        last, last_line = stack.pop()
                        expected = '{' if char == '}' else '('
                        if last != expected:
                            print(f"Error: Mismatched closing {char} at line {line_idx+1}. Expected closing for {last} from line {last_line}")
                            return
            
            i += 1
            
    if stack:
        print(f"Error: Unclosed {stack[-1][0]} from line {stack[-1][1]}")
    else:
        print("Balance Check: OK")

check_balance("d:/01. PROJEK 2025/Projek 2025/Sistem Informasi/eduadmin---sistem-manajemen-sekolah/components/DashboardSuperAdmin.tsx")
