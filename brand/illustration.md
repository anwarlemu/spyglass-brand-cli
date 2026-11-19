# Spyglass imagery

What the brand's own imagery is, as its sources draw it. Each rule names where it comes from; nothing here goes beyond
them. `illustrate` follows these rules, and `brand/assets/illustrate.json` holds its styles, subjects, presets and
looks.

Sources: **guidelines** = the brand guidelines (Figma file Qx2i6GhXZD1V4O7RE7hYQi, page 7, as `guide-pattern.png` and
`guide-imagery.png`: Brand Pattern page 33, ASCII Texture page 34, Brand Imagery page 36); **assets** = the Figma page
"8. Brand assets" (the layouts in `brand/assets/image.json`); **tokens** = `brand/tokens.css` and `brand/brand.json`;
**shader** = agd-playground `public/spyglass-shader/shader.js`.

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
   added,** as the light separates. Shift 4% and bleed 6% of the picture's width, as the assets set it (8 and 12 on a
   200px picture). (assets, Post, picture grid 966:4434)
9. **Never third-party photos or real people in examples:** pictures come from `--image`. (guidelines; SPEC)

## The shader

10. **A shape becomes spectral light: trails streaming out of its ends, each copy turned away in depth, smaller,
    softer and a step along the spectrum; a glass split, cool one way and warm the other, white where they overlap;
    or a burst of copies growing out of the middle.** Copies add up, so they burn white where they meet. (shader
    header and `draw`)
11. **Subjects are the lockup, the logomark, an orb and a wave,** or any picture (its transparency, or its background
    keyed out, gives the shape). (shader `SAMPLES`, `getCut`)
12. **The subject stays on top, clean, in White** (Black on a White ground, its own colors when asked); the light never
    covers it. The logo itself is never recolored, outlined or distorted: the copies are light, not the logo.
    (shader, the subject is drawn last; guidelines logo misuse)
13. **Colors are the brand spectrum, in its order: Magenta, Red, Orange, Yellow, Green, Cyan, Blue.** The shader's
    Prism look runs in that order already, so each stop takes the spectrum color in its place. (shader `LOOKS.prism`;
    tokens; SPEC "keep this order when shown together")
14. **The hairline edge on the subject is the light's own Red and Blue.** (shader `edgeSplit`; tokens Light R, Light B)
15. **Presets are the playground's:** wordmark trails, banner trails, glass icon, glass split, burst, trail on one side.
    (shader `PRESETS`)

## Motion

16. `illustrate` writes stills. The light moves only in `video`, as a slow constant drift that never eases in; reduced
    motion gets the still (`video --still`). (brand/assets/video.json)

## Where the playground and the tokens disagree

`brand/tokens.css` wins, and each change is recorded in `brand/assets/illustrate.json` (`looks.*.from`, `shader.notes`):

- Prism's stops (#ff7ad9 #ff4d6a #ffd23a #5dff6a #22d6ff #2f5bff #5a1fd6; split #4d1fff to #f21f47) are the brand
  spectrum colors in the same order (look `spectrum`).
- Ice, Ember and Chrome keep their stops, each snapped to the nearest brand token (listed per look).
- The Night (#07070d) and Paper (#fafafa) grounds are not brand colors: grounds are Black, White or none.
- The ink subject (#0a0a0a) is Black; the edge hairlines (#ff2a4a, #1e8cff) are Light R and Light B; the glass tile's
  #131317 to #050507 is card-fill to Black (#e9e9ec to #dadadf on White is neutral-12 to neutral-11).
- The grain comes from a seeded generator instead of `Math.random`, so the same seed writes the same bytes.

## Output

SVG and PNG. The pattern, light, texture and split are vector SVG (the split holds the picture). The shader's light is
many blurred copies added together, which SVG renderers do not blend the same way, so its SVG holds the light as a
picture with the subject over it in vector (a picture subject stays inside the picture).
