# Pictures

Every catalog entry has its own picture. None are files: each is generated at
build time from a short description of the part and rendered as inline SVG.
This replaced a set of 44 hand-written silhouettes that the 88 entries shared.

## Who they are for

Someone holding a fastener, or standing in front of a wall of them, who wants
to match what is in their hand. So a picture shows the part as a solid piece
of metal, from the side and from above, and names its measurements in words.
It is not an engineering drawing and should not become one: no center
lines, no hidden edges, no letters that need a key.

The reader-facing notes on what the pictures do and do not show are at the
bottom of `/sizes` (`src/pages/sizes.astro`). This file is for whoever changes
the code.

## Where things are

| File | What it holds |
|------|---------------|
| `src/lib/figure/core.ts` | `Fig`, the drawing surface: an ordered list of paths, each tagged with a line kind, plus the measurements to mark |
| `src/lib/figure/parts.ts` | Thread forms and the thread generator, turned profiles, hex geometry, drive recesses, knurling, bent rod |
| `src/lib/figure/screws.ts` | Head definitions and `screw()`, the builder most headed fasteners use; the 27 screws |
| `src/lib/figure/bolts.ts`, `nuts.ts`, `washers.ts`, `anchors.ts` | One function or spec per entry |
| `src/lib/figure/index.ts` | `figure(category, slug)`: the lookup every page uses |
| `src/components/Figure.astro` | Renders a `Fig` as SVG in one of four variants: `full`, `card`, `mini`, `ghost` |
| `src/styles/global.css` (`.fig`) | Turns line kinds into a look |
| `src/layouts/BaseLayout.astro` (`#metal`) | The one gradient every metal part is filled with |

## How a picture is described, and how it is drawn

A figure never names a color or a stroke width. It adds paths by *kind*, and
the renderer decides what each kind looks like. The kinds come from drafting,
because that is the complete way to describe a part. The look does not.

| Kind | What it describes | How it is drawn |
|------|-------------------|-----------------|
| `body` | A metal part | Filled with the `#metal` gradient, dark outline |
| `soft` | A part that is not metal (nylon, rubber, plastic, resin) | Filled blue, dark outline |
| `ink` | A cut face too thin to shade | Filled solid dark |
| `edge` | An edge on the part | Dark line |
| `thin` | Thread crests and roots, knurling, chamfers | Fine gray line |
| `hatch` | The cut face of a part shown cut open | Faint diagonal lines |
| `phantom` | A part in its other position, or the thing next to it | Dashed outline |
| `hid` | A hidden edge | **Not drawn** |
| `ctr` | A center line | **Not drawn**, and left out of the picture's bounds |

`hid` and `ctr` are described anyway. They cost nothing, they are correct,
and a print or spec-sheet view could use them. `Figure.astro` filters them out
(`SKIP`).

The metal fill is a horizontal gradient in `objectBoundingBox` units, so it
runs across each shape's own width: a head and a shank each get a highlight
down the left, which is what makes them read as round. Its three stops are
the `--metal-hi`, `--metal` and `--metal-lo` tokens, so both themes and the
tuner reach it. The gradient is defined once at the top of the page, so its
stops read those tokens from the root: a container cannot give the pictures
inside it a different metal.

Strokes use `vector-effect: non-scaling-stroke`, so a thumbnail and a
full-size picture carry the same line weights. That is why one description
serves every size.

Units are arbitrary. Every figure is drawn around a nominal thread diameter of
10 units (`D` in `parts.ts`), which is what makes two figures comparable.
Proportions follow the cited standards (a hex head is 1.5 d across flats, a
nut 0.875 d thick). Thread pitch is deliberately about 40 percent wider than
true, because true pitch closes into a gray band at catalog size.

## Measurements

`fig.dim(key, a, b, side, offset, note)` marks a measurement. On the `full`
variant it becomes two extension lines, a line with arrowheads, and a yellow
tag with a word on it.

- The **key** (`d`, `L`, `ID`, `OD`, `T`) ties the measurement to a size on
  the page. `FastenerPage.astro` owns the mapping from key to word (`Length`,
  `Diameter`, `Thread size`, `Hole`, `Outside`, `Thickness`) and passes it to
  `Figure` as `words`. The same word heads the size cell, so the picture and
  the numbers use one vocabulary.
- The **note** says how the trade takes that measurement ("Measured overall,
  head included."). It prints in the size cell.
- The tag is HTML laid over the SVG, so it stays one size while the picture
  scales. `Figure.astro` estimates its footprint (`EM`, `wide()`) to grow the
  picture's bounds around it. Along a vertical line the tag sits on the line;
  along a horizontal one it sits just outside.

## Adding an entry

1. Add the entry to `data/<category>/index.json` as before.
2. Add a figure under the same slug in that category's map.
   - A headed, threaded part is usually one line:
     `'machine-screw': S({ head: 'pan', drive: 'phillips', L: 30 })`.
     `ScrewSpec` in `screws.ts` lists the options (thread form, threaded
     length, point, square neck, shoulder, captive washer).
   - Anything else is a function that builds a `Fig` from the parts in
     `parts.ts`. The existing ones are short; copy the nearest.
3. Mark its measurements with `fig.dim(...)`. Leave one off rather than guess
   where it starts.
4. If the two views need explaining, say so with `fig.says(...)` in plain
   words ("The dashed outline is the wings folded to pass through the hole.").
   No drafting terms: not "section", "phantom" or "projection".
5. An entry with no figure still builds; it just has no picture.

## Rules

- **Draw the length the way it is sold.** Under the head for a head that sits
  on the surface, overall for one that sinks flush or for a headless part.
- **A right-hand thread rises to the right** when the axis is vertical. The
  generator does this; a part drawn upside down must be turned (rotated 180
  degrees), not mirrored, or it becomes a left-hand thread. `Fig.with()` takes
  the transform.
- **The view from above goes over the side view** and shares its axis.
  Washers put the view from above first.
- **Hollow parts are drawn cut open.** Thin cut faces are `ink`, not hatched.
- **A moving part gets a dashed outline** (`phantom`) in its other position,
  not a second figure.
- **A picture sits on paper in both themes.** `--stage` is white in light and
  dimmed card stock in dark, so a part is a dark outline around gray metal
  either way. Lists use `--thumb`, which is the same paper in dark and
  nothing in light, where the page is already paper.
- **A picture takes its colors from the `--metal-*` and `--fig-*` tokens
  only.** Never from the page's text tokens (`--ink`, `--muted`): in dark
  those are light, and so is the paper. Only pictures and their yellow tags
  go on the paper. Words stay off it.

## Checking a change

`npm run dev`, then the category page (all figures at card size) and one
entry page (the full picture with its measurements). Look at both themes: add
`?theme=dark` or `?theme=light` to any URL. Check an entry page at phone
width too, since the tags do not shrink with the picture.
