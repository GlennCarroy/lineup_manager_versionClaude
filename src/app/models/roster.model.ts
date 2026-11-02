import { LineType } from './line.model';
import { PlayerType } from './player.model';

export type RosterType = {
  blockers: PlayerType[];
  jammers: PlayerType[];
  lines: LineType[];
  placedJammerIds: string[]; // jammers déposées dans la zone Jammers, sans limite
};
