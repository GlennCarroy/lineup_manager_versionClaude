export type Position = 'B' | 'J';

export type Specialization = 'P' | 'O';

export type PlayerType = {
  playerId: string; // Numéro de joueuse en jeu
  derbyName: string;
  surname: string;
  position: Position;
  specialization?: Specialization; // Ex. un blocker qui joue aussi pivot (P) ou offense (O)
  rotation: number;
};
