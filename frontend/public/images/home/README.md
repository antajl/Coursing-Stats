# Hero photos (homepage slideshow)

Drop image files here — they appear on the home page in random order.

Supported: `.jpg` `.jpeg` `.png` `.webp` `.avif`

Layout (any mix works):

```
images/home/
  photo-a.jpg          ← ok (flat)
  bzmp/
    01.jpg             ← ok (folder name → category)
  show/
    ring.jpg
  race/
    finish.webp
```

Vite rescans this folder on `npm run dev` / `vite build` and writes
`frontend/src/lib/homePhotos.generated.ts`. Commit new images + the
generated file (or let CI regenerate on build).

Do not put huge RAW dumps here — keep web-sized files.
