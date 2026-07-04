import re

def check_brackets():
    with open("public/index.html", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract the babel script block
    match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
    if not match:
        print("Error: Could not find <script type='text/babel'> tag!")
        return
        
    script = match.group(1)
    
    # Count brackets
    stack = []
    brackets = {')': '(', '}': '{', ']': '['}
    
    for idx, char in enumerate(script):
        if char in brackets.values():
            stack.append((char, idx))
        elif char in brackets.keys():
            if not stack:
                print(f"Extra closing bracket '{char}' at index {idx} or nearby context:")
                print(script[max(0, idx-50):min(len(script), idx+50)])
                return
            top, top_idx = stack.pop()
            if top != brackets[char]:
                print(f"Mismatched bracket: opened '{top}' at index {top_idx} but closed '{char}' at index {idx}!")
                print("Context:")
                print(script[max(0, idx-50):min(len(script), idx+50)])
                return
                
    if stack:
        print(f"Unclosed brackets left: {len(stack)}")
        for char, idx in stack[:5]:
            print(f"Unclosed '{char}' at index {idx}. Context:")
            print(script[max(0, idx-20):min(len(script), idx+80)])
    else:
        print("Success: All brackets are balanced!")

if __name__ == "__main__":
    check_brackets()
