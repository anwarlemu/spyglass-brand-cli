# Spyglass imagery

What the brand's own imagery is, as its sources draw it. Each rule names where it comes from; nothing here goes beyond
them. `illustrate` follows these rules, and `brand/assets/illustrate.json` holds its styles.

Sources: **guidelines** = the brand guidelines (Figma file Qx2i6GhXZD1V4O7RE7hYQi, page 7, as `guide-pattern.png` and
`guide-imagery.png`: Brand Pattern page 33, ASCII Texture page 34, Brand Imagery page 36); **assets** = the Figma page
"8. Brand assets" (the layouts in `brand/assets/image.json`); **tokens** = `brand/tokens.css` and `brand/brand.json`.

## The light

1. **The brand pattern is light split into color: one shape drawn three times, in Red, Green and Blue, offset
   sideways, blurred and blended,** so the colors separate at the edges and turn pale where they overlap.
   (guidelines, Brand Pattern; tokens `--ds-color-light-r|g|b`, `--ds-light-offset`, `--ds-light-blur`)
2. **It flows in from the edges and corners of a layout, never boxed in, with a main mass and a smaller counterpart
   elsewhere.** (guidelines, Brand Pattern)
3. **Every light is a window onto the brand's one heat map,** in the named variants the assets cut: band, field,
   corner, strip-left, strip-right, tile, close-up and curved-strip. Seeds below the number of brand windows are the
   assets' own windows; `--source generated` builds a new heat map the same way. (assets; `registry/lib/light.ts`)
4. **The ground is Black.** (guidelines; tokens `--ds-color-black`)

## The ASCII texture

5. **A field of small characters (` .:-=+*#`, Geist Mono) on Black, behind the light,** adding grain where the light
   fades out. (guidelines, ASCII Texture; tokens `brand.json` ascii)
6. **Quiet: low opacity (0.35), a soft edge rather than a hard cut, clear of text, the logo and photos.** An accent,
   never the main graphic, so `illustrate texture` draws no subject. (guidelines, ASCII Texture)

## Photos

7. **Imagery is real creative, color as posted: no grading, filters or neon.** Photos sit on Black with the pattern
   behind or between them. (guidelines, Brand Imagery)
8. **The photo light split: the picture itself split into its blue, green and red channels, shifted sideways and
   added,** as the light separates. Shift 1.52% of the picture's width, the site light's own channel step, and bleed
   3.2% to cover both shifts. (assets, Post, picture grid 966:4434; the site's dispersion-light-*.svg)
9. **Never third-party photos or real people in examples:** pictures come from `--image`. (guidelines; SPEC)

## Motion

10. `illustrate` writes stills. The light moves only in `video`, as a slow constant drift that never eases in; reduced
    motion gets the still (`video --still`). (brand/assets/video.json)

## Output

SVG and PNG. The pattern, light, texture and split are vector SVG (the split holds the picture).
