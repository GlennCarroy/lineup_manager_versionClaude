export type LineType = {
  name: string;
  blockerIds: string[]; // playerId des blockers de la ligne, une blocker peut être dans plusieurs lignes
};
