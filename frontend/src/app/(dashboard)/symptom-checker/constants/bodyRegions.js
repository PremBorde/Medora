/**
 * bodyRegions.js
 *
 * Defines all clickable regions for the human body SVG map.
 * SVG paths are drawn on a 120×280 viewBox (portrait figure).
 *
 * Each region entry:
 *  - id          : unique identifier sent as `bodyLocation` to the API
 *  - label       : human-readable display name shown in tooltip + chip
 *  - side        : 'front' | 'back' — which body view the region belongs to
 *  - description : short helper text shown in the hover tooltip
 */

export const BODY_REGIONS = [
  // ── FRONT VIEW ────────────────────────────────────────────────────────────
  {
    id: 'head',
    label: 'Head',
    side: 'front',
    description: 'Headaches, dizziness, scalp issues',
    path: 'M60,4 C70,4 78,12 78,22 C78,32 70,40 60,40 C50,40 42,32 42,22 C42,12 50,4 60,4 Z',
  },
  {
    id: 'neck',
    label: 'Neck',
    side: 'front',
    description: 'Sore throat, swollen lymph nodes, stiffness',
    path: 'M53,40 L67,40 L69,56 L51,56 Z',
  },
  {
    id: 'chest',
    label: 'Chest',
    side: 'front',
    description: 'Chest pain, palpitations, breathing difficulty',
    path: 'M36,56 L84,56 L84,100 L36,100 Z',
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    side: 'front',
    description: 'Stomach pain, nausea, bloating',
    path: 'M36,100 L84,100 L82,130 L38,130 Z',
  },
  {
    id: 'pelvis',
    label: 'Pelvis / Groin',
    side: 'front',
    description: 'Pelvic pain, urinary symptoms, groin discomfort',
    path: 'M38,130 L82,130 L80,152 L40,152 Z',
  },
  {
    id: 'upper-left-arm',
    label: 'Upper Left Arm',
    side: 'front',
    description: 'Shoulder to elbow pain or weakness (left)',
    path: 'M84,58 L100,65 L100,95 L84,92 Z',
  },
  {
    id: 'lower-left-arm',
    label: 'Lower Left Arm',
    side: 'front',
    description: 'Elbow to wrist pain or injury (left)',
    path: 'M84,92 L100,95 L102,122 L86,118 Z',
  },
  {
    id: 'left-hand',
    label: 'Left Hand',
    side: 'front',
    description: 'Hand pain, swelling, or numbness (left)',
    path: 'M86,118 L102,122 L103,136 L85,132 Z',
  },
  {
    id: 'upper-right-arm',
    label: 'Upper Right Arm',
    side: 'front',
    description: 'Shoulder to elbow pain or weakness (right)',
    path: 'M36,58 L20,65 L20,95 L36,92 Z',
  },
  {
    id: 'lower-right-arm',
    label: 'Lower Right Arm',
    side: 'front',
    description: 'Elbow to wrist pain or injury (right)',
    path: 'M36,92 L20,95 L18,122 L34,118 Z',
  },
  {
    id: 'right-hand',
    label: 'Right Hand',
    side: 'front',
    description: 'Hand pain, swelling, or numbness (right)',
    path: 'M34,118 L18,122 L17,136 L35,132 Z',
  },
  {
    id: 'upper-left-leg',
    label: 'Upper Left Leg',
    side: 'front',
    description: 'Thigh pain, hip discomfort (left)',
    path: 'M60,152 L80,152 L80,200 L62,200 Z',
  },
  {
    id: 'lower-left-leg',
    label: 'Lower Left Leg',
    side: 'front',
    description: 'Knee, shin, or calf pain (left)',
    path: 'M62,200 L80,200 L80,248 L64,248 Z',
  },
  {
    id: 'left-foot',
    label: 'Left Foot',
    side: 'front',
    description: 'Foot, ankle, or heel pain (left)',
    path: 'M64,248 L80,248 L82,260 L63,260 Z',
  },
  {
    id: 'upper-right-leg',
    label: 'Upper Right Leg',
    side: 'front',
    description: 'Thigh pain, hip discomfort (right)',
    path: 'M40,152 L60,152 L58,200 L40,200 Z',
  },
  {
    id: 'lower-right-leg',
    label: 'Lower Right Leg',
    side: 'front',
    description: 'Knee, shin, or calf pain (right)',
    path: 'M40,200 L58,200 L56,248 L40,248 Z',
  },
  {
    id: 'right-foot',
    label: 'Right Foot',
    side: 'front',
    description: 'Foot, ankle, or heel pain (right)',
    path: 'M40,248 L56,248 L57,260 L38,260 Z',
  },

  // ── BACK VIEW ─────────────────────────────────────────────────────────────
  {
    id: 'back-head',
    label: 'Back of Head',
    side: 'back',
    description: 'Occipital pain, scalp tenderness',
    path: 'M60,4 C70,4 78,12 78,22 C78,32 70,40 60,40 C50,40 42,32 42,22 C42,12 50,4 60,4 Z',
  },
  {
    id: 'back-neck',
    label: 'Neck (Back)',
    side: 'back',
    description: 'Neck stiffness, cervical pain',
    path: 'M53,40 L67,40 L69,56 L51,56 Z',
  },
  {
    id: 'left-shoulder',
    label: 'Left Shoulder',
    side: 'back',
    description: 'Shoulder blade or rotator cuff pain (left)',
    path: 'M60,56 L84,56 L84,72 L60,72 Z',
  },
  {
    id: 'right-shoulder',
    label: 'Right Shoulder',
    side: 'back',
    description: 'Shoulder blade or rotator cuff pain (right)',
    path: 'M36,56 L60,56 L60,72 L36,72 Z',
  },
  {
    id: 'upper-back',
    label: 'Upper Back',
    side: 'back',
    description: 'Upper spine, trapezoid, or thoracic pain',
    path: 'M36,72 L84,72 L84,112 L36,112 Z',
  },
  {
    id: 'lower-back',
    label: 'Lower Back',
    side: 'back',
    description: 'Lumbar pain, kidney area, sciatica',
    path: 'M36,112 L84,112 L82,152 L38,152 Z',
  },
  {
    id: 'back-left-arm',
    label: 'Left Arm (Back)',
    side: 'back',
    description: 'Posterior arm pain or injury (left)',
    path: 'M84,58 L100,65 L102,122 L84,118 Z',
  },
  {
    id: 'back-right-arm',
    label: 'Right Arm (Back)',
    side: 'back',
    description: 'Posterior arm pain or injury (right)',
    path: 'M36,58 L20,65 L18,122 L36,118 Z',
  },
  {
    id: 'buttocks',
    label: 'Buttocks',
    side: 'back',
    description: 'Gluteal or sacral pain, sitting discomfort',
    path: 'M38,152 L82,152 L80,178 L40,178 Z',
  },
  {
    id: 'back-left-leg',
    label: 'Left Leg (Back)',
    side: 'back',
    description: 'Hamstring, calf, or posterior leg pain (left)',
    path: 'M60,178 L80,178 L80,260 L62,260 Z',
  },
  {
    id: 'back-right-leg',
    label: 'Right Leg (Back)',
    side: 'back',
    description: 'Hamstring, calf, or posterior leg pain (right)',
    path: 'M40,178 L60,178 L58,260 L40,260 Z',
  },
];

/** Unique body-region IDs for use in zod validation if needed. */
export const BODY_REGION_IDS = BODY_REGIONS.map((r) => r.id);

/** Lookup a region by its id. */
export function getBodyRegion(id) {
  return BODY_REGIONS.find((r) => r.id === id) ?? null;
}

/** All regions for a given side. */
export function getRegionsForSide(side) {
  return BODY_REGIONS.filter((r) => r.side === side);
}
