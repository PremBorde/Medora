/**
 * bodyRegions.js
 *
 * Defines all clickable regions for the human body SVG map.
 * Each region has:
 *  - id          : unique identifier sent as `bodyLocation` to the API
 *  - label       : human-readable display name
 *  - side        : 'front' | 'back' — which body view the region belongs to
 *  - description : short helper text shown in the tooltip
 *  - color       : base fill color (Tailwind-compatible hex)
 *
 * The SVG paths below are drawn on a 120×280 viewBox (portrait figure).
 * Front and back views share the same coordinate space so toggling the
 * view is a simple filter on `side`.
 */

export const BODY_REGIONS = [
  // ── FRONT ──────────────────────────────────────────────────────────────
  {
    id: 'head',
    label: 'Head',
    side: 'front',
    description: 'Headaches, dizziness, scalp issues',
    // Ellipse approximated as path: circle centered at (60, 22) r=18
    path: 'M60,4 C69.9,4 78,12.1 78,22 C78,31.9 69.9,40 60,40 C50.1,40 42,31.9 42,22 C42,12.1 50.1,4 60,4 Z',
  },
  {
    id: 'neck',
    label: 'Neck / Throat',
    side: 'front',
    description: 'Sore throat, swollen lymph nodes, stiffness',
    path: 'M54,40 L66,40 L68,56 L52,56 Z',
  },
  {
    id: 'chest',
    label: 'Chest',
    side: 'front',
    description: 'Chest pain, breathing difficulty, heart palpitations',
    path: 'M36,56 L84,56 L86,106 L34,106 Z',
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    side: 'front',
    description: 'Stomach pain, nausea, bloating',
    path: 'M36,106 L84,106 L82,140 L38,140 Z',
  },
  {
    id: 'pelvis',
    label: 'Pelvis / Groin',
    side: 'front',
    description: 'Pelvic pain, urinary symptoms',
    path: 'M38,140 L82,140 L80,158 L40,158 Z',
  },
  {
    id: 'left-arm',
    label: 'Left Arm',
    side: 'front',
    description: 'Pain, weakness, or injury in the left arm',
    // Left arm (patient's left = viewer's right)
    path: 'M84,58 L100,62 L104,120 L88,118 Z',
  },
  {
    id: 'right-arm',
    label: 'Right Arm',
    side: 'front',
    description: 'Pain, weakness, or injury in the right arm',
    path: 'M36,58 L20,62 L16,120 L32,118 Z',
  },
  {
    id: 'left-leg',
    label: 'Left Leg',
    side: 'front',
    description: 'Pain, swelling, or injury in the left leg',
    path: 'M60,158 L80,158 L82,240 L62,240 Z',
  },
  {
    id: 'right-leg',
    label: 'Right Leg',
    side: 'front',
    description: 'Pain, swelling, or injury in the right leg',
    path: 'M40,158 L60,158 L58,240 L38,240 Z',
  },

  // ── BACK ───────────────────────────────────────────────────────────────
  {
    id: 'back-head',
    label: 'Back of Head',
    side: 'back',
    description: 'Occipital pain, neck stiffness',
    path: 'M60,4 C69.9,4 78,12.1 78,22 C78,31.9 69.9,40 60,40 C50.1,40 42,31.9 42,22 C42,12.1 50.1,4 60,4 Z',
  },
  {
    id: 'upper-back',
    label: 'Upper Back / Shoulders',
    side: 'back',
    description: 'Shoulder pain, upper spine issues',
    path: 'M34,56 L86,56 L86,106 L34,106 Z',
  },
  {
    id: 'lower-back',
    label: 'Lower Back',
    side: 'back',
    description: 'Lumbar pain, kidney area pain, sciatica',
    path: 'M36,106 L84,106 L82,158 L38,158 Z',
  },
  {
    id: 'back-left-arm',
    label: 'Left Arm (Back)',
    side: 'back',
    description: 'Posterior arm pain or injury (left)',
    path: 'M84,58 L100,62 L104,120 L88,118 Z',
  },
  {
    id: 'back-right-arm',
    label: 'Right Arm (Back)',
    side: 'back',
    description: 'Posterior arm pain or injury (right)',
    path: 'M36,58 L20,62 L16,120 L32,118 Z',
  },
  {
    id: 'back-left-leg',
    label: 'Left Leg (Back)',
    side: 'back',
    description: 'Hamstring, calf, or posterior leg pain (left)',
    path: 'M60,158 L80,158 L82,240 L62,240 Z',
  },
  {
    id: 'back-right-leg',
    label: 'Right Leg (Back)',
    side: 'back',
    description: 'Hamstring, calf, or posterior leg pain (right)',
    path: 'M40,158 L60,158 L58,240 L38,240 Z',
  },
];

/** Unique body-region IDs for use in zod validation if needed. */
export const BODY_REGION_IDS = BODY_REGIONS.map((r) => r.id);

/** Lookup a region by its id. */
export function getBodyRegion(id) {
  return BODY_REGIONS.find((r) => r.id === id) ?? null;
}
