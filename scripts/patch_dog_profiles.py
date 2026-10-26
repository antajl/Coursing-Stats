with open('backend/scripts/build-derived/dog-profiles.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.writeFileSync(dogsIndexPath, JSON.stringify(dogsIndexList, null, 2), 'utf-8');
      break;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if ((code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM') && attempt < 4) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }"""

replacement = """  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      fs.writeFileSync(dogsIndexPath, JSON.stringify(dogsIndexList, null, 2), 'utf-8');
      break;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if ((code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM') && attempt < 14) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }"""

norm_text = text.replace('\r\n', '\n')
norm_target = target.replace('\r\n', '\n')
norm_replacement = replacement.replace('\r\n', '\n')

assert norm_target in norm_text, "target not found"
new_text = norm_text.replace(norm_target, norm_replacement)
if '\r\n' in text:
    new_text = new_text.replace('\n', '\r\n')

with open('backend/scripts/build-derived/dog-profiles.ts', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Updated dog-profiles.ts")
