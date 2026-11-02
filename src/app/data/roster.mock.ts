import { RosterType } from '../models/roster.model';

// Données de démonstration, remplacées par Supabase dans une étape ultérieure
export const MOCK_ROSTER: RosterType = {
  blockers: [
    { playerId: '12', derbyName: 'Berlin Smash', surname: 'Martin', position: 'B', rotation: 1 },
    { playerId: '7', derbyName: 'Night Fury', surname: 'Durand', position: 'B', specialization: 'P', rotation: 2 },
    { playerId: '23', derbyName: 'Iron Maiden', surname: 'Leroy', position: 'B', rotation: 3 },
    { playerId: '4', derbyName: 'Storm Kitty', surname: 'Petit', position: 'B', rotation: 4 },
    { playerId: '15', derbyName: 'Atomic Ginger', surname: 'Garnier', position: 'B', specialization: 'P', rotation: 1 },
    { playerId: '16', derbyName: 'Pocket Rocket', surname: 'Roux', position: 'B', specialization: 'P', rotation: 2 },
    { playerId: '17', derbyName: 'Lady Havoc', surname: 'Blanc', position: 'B', specialization: 'O', rotation: 3 },
    { playerId: '18', derbyName: 'Mad Max Attack', surname: 'Faure', position: 'B', specialization: 'O', rotation: 4 },
    { playerId: '19', derbyName: 'Velvet Thunder', surname: 'Girard', position: 'B', rotation: 1 },
    { playerId: '20', derbyName: 'Cherry Bomb', surname: 'Lambert', position: 'B', rotation: 2 },
    { playerId: '21', derbyName: 'Silent Jack', surname: 'Fontaine', position: 'B', rotation: 3 },
    { playerId: '22', derbyName: 'Iron Lily', surname: 'Marchand', position: 'B', rotation: 4 },
    { playerId: '24', derbyName: 'Dizzy Lizzy', surname: 'Dupont', position: 'B', rotation: 1 },
    { playerId: '25', derbyName: 'Hell Bell', surname: 'Lefebvre', position: 'B', rotation: 2 },
  ],
  jammers: [
    { playerId: '88', derbyName: 'Flash Gordon', surname: 'Moreau', position: 'J', rotation: 1 },
    { playerId: '9', derbyName: 'Rocket Raven', surname: 'Bernard', position: 'J', rotation: 2 },
    { playerId: '30', derbyName: 'Storm Chaser', surname: 'Robin', position: 'J', rotation: 3 },
    { playerId: '31', derbyName: 'Neon Nova', surname: 'Simon', position: 'J', rotation: 4 },
    { playerId: '32', derbyName: 'Ghost Rider', surname: 'Chevalier', position: 'J', rotation: 1 },
    { playerId: '33', derbyName: 'Sugar Shock', surname: 'Mercier', position: 'J', rotation: 2 },
  ],
  lines: [
    { name: 'Ligne 1', blockerIds: ['12', '7'] },
    { name: 'Ligne 2', blockerIds: ['23', '4'] },
    { name: 'Fatline', blockerIds: [] },
  ],
  placedJammerIds: ['88', '9'],
};
