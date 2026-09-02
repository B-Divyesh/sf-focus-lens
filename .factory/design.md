# Focus Lens visual thesis

## Direction

**Glacial minimal ceramics** turns an accessibility utility into a calm, legible instrument. Frosted white surfaces, ink-dark type, mineral blue controls, and a coral focus edge resemble glazed ceramic tools on pale ice. The hard coral ring is intentionally different from the quiet shell: it must remain visible over hostile web interfaces.

This is a light-first, explicitly painted system. The extension also supports a dark panel selected by the user. The landing site stays light to preserve the ceramic direction.

## Tokens

| Role | Token | Value | Reason |
|---|---|---:|---|
| Ice canvas | `--ice-50` | `#f5f8f7` | Cold, low-glare page ground |
| Ceramic surface | `--ceramic` | `#fffefd` | Warm enough to separate from the canvas |
| Deep ink | `--ink-900` | `#172524` | Primary text; 14.2:1 on ceramic |
| Mineral text | `--ink-650` | `#425a58` | Secondary text; 7.0:1 on ceramic |
| Glacier blue | `--glacier-700` | `#075d72` | Primary action; white text exceeds 7:1 |
| Glacier pale | `--glacier-100` | `#d6edf0` | Selected and informative surfaces |
| Focus coral | `--coral-600` | `#c63d2f` | Focus, warnings, and the page focus rail |
| Success moss | `--moss-700` | `#35613f` | Saved state with text label |
| Danger clay | `--clay-700` | `#8f2f27` | Destructive action with text label |

## Type and spacing

The product uses system fonts so every character stays crisp at high browser zoom and no font request can fail. Display text uses Charter/Georgia for the soft, carved quality of ceramic labels. Controls and body copy use `Inter`, `Aptos`, `Segoe UI`, then the system sans stack. No external font files load.

Spacing follows an 8 px scale with 4 px only for tight label relationships. Body text is at least 16 px, panel text 17 px, controls at least 44 px, and prose is capped at 68 characters.

## Shape and interaction grammar

- Panels use asymmetric 28 px / 12 px corners, like a hand-finished ceramic tile.
- Key controls use compact 10 px corners and a 2 px mineral outline.
- The signature focus treatment is a double rail: 4 px coral with a 2 px pale halo.
- Active settings are stated in words and color, never color alone.
- The popup is a single vertical tool rail at narrow widths. Secondary details collapse behind native disclosure controls.

## Motion

The reading lane settles vertically over 180 ms, as if a thin glass slide moves into place. Controls use opacity and one-pixel press feedback only. Nothing loops. With `prefers-reduced-motion: reduce`, all transitions are removed and focus changes are immediate.

## Original asset plan and provenance

The hero image is a generated still life: a translucent magnifying lens and coral marker resting on hand-glazed ice-white ceramic tiles. It explains magnification and focus without showing a fake interface. The image has no people, brands, text, or logos.

Prompt sheet:

- Subject: translucent optical lens, narrow coral focus rail, stacked ceramic tiles.
- World: quiet accessibility workbench, abstract rather than clinical.
- Materials: satin glaze, translucent glass, fine ceramic grain.
- Light: diffuse winter daylight with precise soft shadows.
- Lens: editorial product still life, elevated three-quarter view.
- Palette words: glacier, milk ceramic, deep green-black, mineral blue, coral edge.
- Avoid: text, letters, logos, watermark, people, hands, screens, gradients, neon, chrome, generic SaaS motifs.

Asset: `site/public/assets/focus-lens-hero.webp` and derived social preview. Generated 2026-09-02 with the Factory image deployment through `/opt/fleet/lib/gen-image.sh`. Original project asset; no third-party source material.
