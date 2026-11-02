// Géométrie du track, calculée en millimètres d'après le schéma fourni, puis projetée dans un repère SVG de 1000 unités de large.
// Ovale à deux lignes droites et deux virages en demi-cercle.

// Dimensions relevées sur le schéma (mm)
const STRAIGHT = 10668; // ligne droite extérieure
const OUTER_RADIUS = 8607.1; // rayon extérieur des virages
const BAND_WIDTH = 3962.4; // largeur de la bande (13 ft)
const BAND_HALF = BAND_WIDTH / 2;
const MID_RADIUS = OUTER_RADIUS - BAND_HALF; // ligne médiane des virages
const STRAIGHT_HALF = STRAIGHT / 2;
const ARC_LENGTH = Math.PI * MID_RADIUS;
const PERIMETER = 2 * STRAIGHT + 2 * ARC_LENGTH;

// Projection vers le repère SVG
const SCALE = 1000 / (STRAIGHT + 2 * OUTER_RADIUS);
export const TRACK_VIEWBOX = { width: 1000, height: 2 * OUTER_RADIUS * SCALE };

export const SECTOR_COUNT = 20;
// Secteur qui commence sur la ligne de jam (le secteur précédent est la zone 1)
const JAM_SECTOR = 13;
// Repères au centre de la piste, tous les 10 ft (3,048 m) à partir de la ligne de pivot
const CENTER_MARK_SPACING = 3048;
// Ligne de pivot : 30 ft (9,144 m) avant la ligne de jam, dans le sens de la course
const PIVOT_OFFSET = 9144;
const SAMPLES_PER_ZONE = 12;

export type TrackSide = 'interne' | 'externe';

export type TrackZone = {
  id: string;
  number: number;
  side: TrackSide;
  path: string;
  center: { x: number; y: number };
};

// Passe d'un repère en mm (origine au centre du track) au repère SVG
function toSvg(x: number, y: number): { x: number; y: number } {
  return { x: (x + STRAIGHT_HALF + OUTER_RADIUS) * SCALE, y: (y + OUTER_RADIUS) * SCALE };
}

// Point sur la ligne médiane à la distance donnée (mm), décalé de `offset` mm vers l'extérieur
function trackPoint(distance: number, offset: number): { x: number; y: number } {
  const s = ((distance % PERIMETER) + PERIMETER) % PERIMETER;
  let x: number;
  let y: number;
  let nx: number;
  let ny: number;

  if (s < STRAIGHT) {
    // Ligne droite du haut, de gauche à droite
    x = -STRAIGHT_HALF + s;
    y = -MID_RADIUS;
    nx = 0;
    ny = -1;
  } else if (s < STRAIGHT + ARC_LENGTH) {
    // Virage de droite
    const angle = -Math.PI / 2 + (s - STRAIGHT) / MID_RADIUS;
    nx = Math.cos(angle);
    ny = Math.sin(angle);
    x = STRAIGHT_HALF + MID_RADIUS * nx;
    y = MID_RADIUS * ny;
  } else if (s < 2 * STRAIGHT + ARC_LENGTH) {
    // Ligne droite du bas, de droite à gauche
    x = STRAIGHT_HALF - (s - STRAIGHT - ARC_LENGTH);
    y = MID_RADIUS;
    nx = 0;
    ny = 1;
  } else {
    // Virage de gauche
    const angle = Math.PI / 2 + (s - 2 * STRAIGHT - ARC_LENGTH) / MID_RADIUS;
    nx = Math.cos(angle);
    ny = Math.sin(angle);
    x = -STRAIGHT_HALF + MID_RADIUS * nx;
    y = MID_RADIUS * ny;
  }

  return toSvg(x + offset * nx, y + offset * ny);
}

// Chemin d'un ovale concentrique à la ligne médiane, de rayon `radius` (mm)
export function stadiumPath(radius: number): string {
  const topLeft = toSvg(-STRAIGHT_HALF, -radius);
  const topRight = toSvg(STRAIGHT_HALF, -radius);
  const bottomRight = toSvg(STRAIGHT_HALF, radius);
  const bottomLeft = toSvg(-STRAIGHT_HALF, radius);
  const r = radius * SCALE;
  return [
    `M ${topLeft.x} ${topLeft.y}`,
    `L ${topRight.x} ${topRight.y}`,
    `A ${r} ${r} 0 0 1 ${bottomRight.x} ${bottomRight.y}`,
    `L ${bottomLeft.x} ${bottomLeft.y}`,
    `A ${r} ${r} 0 0 1 ${topLeft.x} ${topLeft.y}`,
    'Z',
  ].join(' ');
}

export const TRACK_LANE_PATH = stadiumPath(MID_RADIUS);
export const TRACK_OUTER_PATH = stadiumPath(MID_RADIUS + BAND_HALF);
export const TRACK_INNER_PATH = stadiumPath(MID_RADIUS - BAND_HALF);

// Début du secteur 12 : position de référence sur la ligne médiane
const SECTOR_12_START = (11 * PERIMETER) / 18;

// Début du secteur n : un repère tous les 3,048 m, à partir du début du secteur 12
function sectorStart(sectorNumber: number): number {
  return SECTOR_12_START + (sectorNumber - 12) * CENTER_MARK_SPACING;
}

function sectorZone(sector: number, side: TrackSide): TrackZone {
  // Numérotation dans le sens anti-horlogique : la zone 1 est le secteur qui précède la ligne de jam
  const number = ((((JAM_SECTOR - 1 - (sector + 1)) % SECTOR_COUNT) + SECTOR_COUNT) % SECTOR_COUNT) + 1;

  const startDistance = sectorStart(sector + 1);
  // Le dernier secteur absorbe le reliquat de périmètre entre le dernier repère et le premier
  const endDistance = sector === SECTOR_COUNT - 1 ? sectorStart(1) + PERIMETER : sectorStart(sector + 2);
  const [innerOffset, outerOffset] = side === 'interne' ? [-BAND_HALF, 0] : [0, BAND_HALF];

  // Contour de la zone : le bord extérieur dans un sens, le bord intérieur dans l'autre
  const outerEdge: { x: number; y: number }[] = [];
  const innerEdge: { x: number; y: number }[] = [];
  for (let step = 0; step <= SAMPLES_PER_ZONE; step++) {
    const distance = startDistance + ((endDistance - startDistance) * step) / SAMPLES_PER_ZONE;
    outerEdge.push(trackPoint(distance, outerOffset));
    innerEdge.push(trackPoint(distance, innerOffset));
  }

  const outline = [...outerEdge, ...innerEdge.reverse()];
  const path =
    outline
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ') + ' Z';

  const center = trackPoint((startDistance + endDistance) / 2, (innerOffset + outerOffset) / 2);

  return {
    id: `s${number}-${side}`,
    number,
    side,
    path,
    center: { x: Math.round(center.x), y: Math.round(center.y) },
  };
}

// 20 secteurs, chacun en bande interne et externe : 40 zones
export const TRACK_ZONES: TrackZone[] = Array.from({ length: SECTOR_COUNT }, (_, sector) => [
  sectorZone(sector, 'interne'),
  sectorZone(sector, 'externe'),
]).flat();

// Ligne de jam à la fin du secteur 12 ; ligne de pivot 30 ft avant, à la fin du secteur 9
const JAM_LINE = sectorStart(JAM_SECTOR);
const PIVOT_LINE = JAM_LINE - PIVOT_OFFSET;

function markerLine(distance: number): string {
  const inner = trackPoint(distance, -BAND_HALF);
  const outer = trackPoint(distance, BAND_HALF);
  return `M ${inner.x.toFixed(2)} ${inner.y.toFixed(2)} L ${outer.x.toFixed(2)} ${outer.y.toFixed(2)}`;
}

// Lignes blanches épaisses : ligne de pivot (fin du secteur 9) et ligne de jam (fin du secteur 12)
export const TRACK_SECTOR_BOUNDARIES: string = [PIVOT_LINE, JAM_LINE]
  .map(markerLine)
  .join(' ');

// Repères au centre de la piste, tous les 3,048 m à partir de la ligne de pivot
const TICK_HALF_LENGTH = 400;
export const TRACK_CENTER_MARKS: string = Array.from(
  { length: Math.floor(PERIMETER / CENTER_MARK_SPACING) },
  (_, index) => {
    const distance = PIVOT_LINE + index * CENTER_MARK_SPACING;
    const start = trackPoint(distance, -TICK_HALF_LENGTH);
    const end = trackPoint(distance, TICK_HALF_LENGTH);
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  },
).join(' ');
