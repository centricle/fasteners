# fasteners.fyi

Open-source fastener specifications database, with a generated picture of every entry. Screws, bolts, anchors, nuts and washers. Objective data only, no opinions.

## Principles

- **Objective data only** - Specifications from manufacturer datasheets, not recommendations
- **Comprehensive coverage** - All common fastener types with dimensional specs
- **Reliable sources** - Industry standards (ASME, ISO, DIN) and manufacturer data
- **Open source** - All data version-controlled and freely available

## Tech Stack

- **Astro 7** - Static site generation
- **Tailwind 4** - Utility-first CSS
- **TypeScript** - Type safety for data handling, and the picture generator
- **JSON Database** - Version-controlled fastener specifications
- **Netlify** - Static hosting

## Pictures

No image files. Each entry's picture is generated at build time from a short
description of the part (head, drive, thread form, point, proportions) and
rendered as inline SVG: the part as solid metal, from the side and from above,
with its measurements named on it. See [docs/DRAWINGS.md](docs/DRAWINGS.md).

## Development

```bash
npm install
npm run dev          # Local development on port 7010
npm run build        # Production build
npm run preview      # Preview production build
```

## Data Structure

```
/data/
├── screws/          # Wood screws, machine screws, self-tapping
├── bolts/           # Hex bolts, carriage bolts, structural
├── anchors/         # Wall anchors, concrete anchors, toggle bolts
├── nuts/            # Hex nuts, lock nuts, wing nuts
└── washers/         # Flat, lock, spring and sealing washers
```

## License

MIT License - see [LICENSE](LICENSE) for details.
