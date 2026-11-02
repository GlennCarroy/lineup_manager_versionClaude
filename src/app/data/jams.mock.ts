import { JamType } from '../models/jam.model';

// Jams de démonstration : seule la ligne et la jammeuse sont renseignées
export const MOCK_JAMS: JamType[] = [
  { jamNumber: 1, jammer: '88', lineName: 'Ligne 1', points: 0, lead: false, penalties: [], passages: [], blockerPassages: [] },
  { jamNumber: 2, jammer: '9', lineName: 'Ligne 2', points: 0, lead: false, penalties: [], passages: [], blockerPassages: [] },
  { jamNumber: 3, jammer: '9', lineName: 'Ligne 1', points: 0, lead: false, penalties: [], passages: [], blockerPassages: [] },
  { jamNumber: 4, jammer: '88', lineName: 'Fatline', points: 0, lead: false, penalties: [], passages: [], blockerPassages: [] },
  { jamNumber: 5, jammer: '88', lineName: 'Ligne 2', points: 0, lead: false, penalties: [], passages: [], blockerPassages: [] },
];
