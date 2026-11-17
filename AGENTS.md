# Using this CLI

`spyglass-ds` is the Spyglass brand system, the component library and the brand graphics. An agent that has the CLI
does not invent tokens, components, templates, sizes or rules. Query them, then use the names the CLI returns.

From a checkout, build once (`bun run build`) and run `node bin.js`. When the package is installed, the same commands
are `npx spyglass-ds`. Below, `spyglass-ds` means that command.

## Start here

```sh
spyglass-ds manifest --json
```

`describe` is the same command. The JSON document lists every command, flag, brand section, token name, principle,
group, component (with parts, states and examples), image and video template and size. If a name is not in the
document, the command exits 1 and names what is allowed. Do not substitute a nearby value.

## Brand

```sh
spyglass-ds brand --json
spyglass-ds brand --section color
spyglass-ds brand --token --ds-color-surface-raised
spyglass-ds principles --surface website --json
```

Black is the ground and White the type; the spectrum colors come only from the light and small accents. Funnel Display
for heads, DM Sans for text (Medium for labels and buttons, labels in capitals at 6%), Geist Mono for code and the
texture. The voice is short declarative sentences ending in a period, sentence case, concrete numbers.

## Components

```sh
spyglass-ds list --json
spyglass-ds view search-bar --json
spyglass-ds component emit button --state variant:secondary
spyglass-ds add button card --dry-run
```

React apps get React; everything else gets web components (`<spyglass-button>`). Read `view` before using an item.

## Graphics

```sh
spyglass-ds light --list
spyglass-ds light --variant band --seed 1 --out band.svg
spyglass-ds light --variant corner --source generated --seed 7 --format png --out corner.png
spyglass-ds ascii --seed 4 --width 1080 --height 1350 --out texture.svg
```

The light and the texture are generated from a seed; never paste them as images or draw them by hand. Logos are the
files `brand --section logos` lists; never redraw, recolor or stretch them.

## Check

```sh
spyglass-ds check --json
```

Exit 0 means no values off the brand. Register `spyglass-ds hook` as an edit hook to check each edit as it is made.
