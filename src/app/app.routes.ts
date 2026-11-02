import { Routes } from '@angular/router';

import { GamePageComponent } from './features/game/game-page.component';
import { MatchPageComponent } from './features/match/match-page.component';
import { RosterPageComponent } from './features/roster/roster-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'roster' },
  { path: 'roster', component: RosterPageComponent },
  { path: 'game', component: GamePageComponent },
  { path: 'game/match', component: MatchPageComponent },
  { path: '**', redirectTo: 'roster' },
];
