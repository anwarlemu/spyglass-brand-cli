# Using this CLI

`conare-ds` is the brand system, the component library, and the image and video generators. An agent that has the CLI does not invent tokens, components, templates, sizes, or rules. Query them, then use the names the CLI returns.

From a checkout, build once (`bun run build`) and run `node bin.js`. When the package is installed, the same commands are `npx conare-ds`. Below, `conare-ds` means that command.

## Start here

```sh
conare-ds manifest --json
```

`describe` is the same command. The JSON document (`schemaVersion` 1) lists every command, flag, brand section, token name, principle, group, component (with parts, states, and examples), image template and size, and video template and size. It also lists gaps: facts this repository does not contain. If a name is not in the document, the command exits 1 and names what is allowed. Do not substitute a nearby value.

Pass `--json` on any command when you need a machine-readable result. `--help` prints that command's flags. An unknown flag is an error.

## Brand

```sh
conare-ds brand --json
conare-ds brand --section color
conare-ds brand colour
conare-ds brand --token --ds-color-fg
```

Sections are `color`, `type`, `spacing`, `radii`, `motion`, `fonts`, `logos`, `voice`, and `other`. `colour` is `color`. Spacing includes the space, size, layout, and border tokens; the `group` field on each token says which. Type includes font, text, and tracking. Motion includes duration and easing.

Fonts are the faces named in `brand/brand.json` and the woff2 files beside them. A named face with no file is reported. Nothing is substituted.

Logos are the files in `brand/logo`. Each SVG fill is matched to a token when the hex is one of the brand's. Image cards redraw `brand/logo/svg/mark.svg`. The video logo template redraws `brand/logo/svg/primary-logo.svg`. Every video draws `mark.svg` in the footer. This repository has no clearance, minimum size, or exclusion zone. Do not invent one.

Voice is the Voice section of `brand/principles.md`, including the Never list. `conare-ds tokens <term>` searches by name or value and errors when nothing matches. One exact token is `brand --token`.

## Principles

```sh
conare-ds principles --json
conare-ds principles --surface product
conare-ds principles --surface website
```

`product` is the console: the do list, the do-not list, and the rules transcribed from `brand/principles.md`. `website` has no section of its own in that file. The website rules are only the sentences in `brand/principles.md`, and the comments in `brand/tokens.css`, that name the website or a brand surface outside the console. Do not add website rules those files do not state. Voice is included with either surface.

## Components

```sh
conare-ds component list --json
conare-ds component list --group ui
conare-ds component inspect button --json
conare-ds component emit button --state variant:dark --json
conare-ds component emit button --state example:Dark
conare-ds component emit field --prop label=Email --json
```

Groups are `ui`, `product`, `site`, `visuals`. `list` (the library command, not `component list`) prints the group label in JSON and `groupId` for the id. `component list` uses the ids.

`inspect` returns every part, its props, and the states derived from the source: `rest` (defaults), `<prop>:<value>` for each union literal and each boolean, and `example:<Name>` for each example file. In `manifest --json`, `part` is the default component and `states` are that part's states. `parts` lists every component in the item with its own states. When `part` is absent, pass `--part` with one of those names. `emit` writes a Vue single-file component that imports that part and sets the state's props. `example:<Name>` copies that example file unchanged. Generated markup leaves the default slot empty and says so in a comment. Copy an example when you need real children. A required prop with no default must be `--prop name=value`, or you emit an example. `--prop` cannot set a non-scalar prop. `--part` selects one component when an item has several. The import is `@/...` when the project has an `@` alias, otherwise a relative path.

Use these components in product and website UI. Do not redraw a component that `component list` already names.

`view` (or `show`), `search`, `add`, and `diff` are the install path: `view` is the usage page, `add` copies the files into an app.

## Images

```sh
conare-ds image --list
conare-ds image --title "The right context, on every call" --text "Store it and keep it current."
conare-ds image --template quote --title "Search should return the passage." --by "Acme" --size square
conare-ds image --template frame --title "What came back" --image ./shot.png --size og
```

Templates: `headline`, `statement` (default), `quote`, `announcement`, `frame`. Sizes: `og` 1200x630, `square` 1080x1080, `portrait` 1080x1350, `landscape` 1200x675. `--size all` writes every size. `--ground paper` (default) or `ink`. `--format png`, `svg`, or `both` (default).

A template refuses a field it does not draw: headline refuses `--text`, `--by`, and `--image`; statement and announcement refuse `--by` and `--image`; quote refuses `--text` and `--image`; frame refuses `--by`. `--text` and `--subtitle` must agree when both are set, and so must `--by` and `--author`. A headline ends in a red full stop. Write copy in sentence case. The same inputs write the same PNG and SVG. Samples are in `imagery/samples/`.

## Video

```sh
conare-ds video --list
conare-ds video --template headline --size square --title "Context that stays current"
conare-ds video --template statement --size landscape --title "The right context, on every call" --text "Store it, keep it current, and hand it to the model."
conare-ds video --template announcement --size vertical --eyebrow "Now shipping" --title "Sources sync themselves" --text "Connect a source once."
conare-ds video --template logo --size square
```

There is no default template. Sizes are `square` 1080x1080 (default), `vertical` 1080x1920 (9:16), and `landscape` 1920x1080 (16:9). `og` is not a video size. `--ground paper` (default) or `ink`. `--size all` writes every size.

Each clip is 18 frames at 12 fps (1.5 seconds), Motion JPEG inside an MP4. The raster is the same headless SVG path as the stills: brand tokens, the vendored faces, and the logo files. No browser and no system fonts. The same inputs write the same bytes. The file plays in ffprobe, ffmpeg, VLC, and QuickTime. It is not H.264, so a browser video element may not play it.

Headline does not draw `--text`. Logo does not draw a title, `--text`, or `--eyebrow`. One sample per template is in `imagery/samples/` (`video-<template>-<size>.mp4` and a PNG of the last frame).

## Determinism

Same inputs produce the same bytes for stills and for video. Rendering does not read the clock into the file, does not load system fonts, and does not pick a random template, size, or component. Validation fails closed.

## What this repository does not contain

- A website principles section. Use `principles --surface website` and stop there.
- Logo clearance, a minimum size, or an exclusion zone.
- An H.264 video encoder. Clips are Motion JPEG.
- Components or fonts beyond the files in `registry/` and `brand/fonts/`.
