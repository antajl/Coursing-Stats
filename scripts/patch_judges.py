with open('backend/scripts/build-derived/judges-indexes.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'const detailJson = JSON.stringify(payload)' in line:
        new_lines.append('    if (fs.existsSync(detailPath)) {\n')
        new_lines.append('      try {\n')
        new_lines.append('        if (fs.readFileSync(detailPath, "utf-8") === detailJson) {\n')
        new_lines.append('          count += 1;\n')
        new_lines.append('          continue;\n')
        new_lines.append('        }\n')
        new_lines.append('      } catch {}\n')
        new_lines.append('    }\n')

with open('backend/scripts/build-derived/judges-indexes.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Patch applied.")
