// Passage dans une zone du track, pour la jammeuse ou pour la ligne de blockers
export type TrackPassage = {
  zoneId: string; // format s{1-20}-{interne|externe}
  outcome: 'win' | 'loss';
};

export type JamType = {
  jamNumber: number;
  jammer: string; // playerId de la jammeuse
  lineName: string;
  points: number;
  lead: boolean; // la jammeuse de ce jam est lead jammer
  penalties: string[]; // playerId, une entrée par pénalité (une même joueuse peut en avoir plusieurs)
  passages: TrackPassage[]; // passages de la jammeuse sur le track, dans l'ordre
  blockerPassages: TrackPassage[]; // passages de la ligne de blockers sur le track
};
