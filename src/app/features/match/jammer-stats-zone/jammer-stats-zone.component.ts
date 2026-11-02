import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { RosterService } from '../../../services/roster.service';
import { performanceClass } from '../../../shared/performance-color';

function percentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

@Component({
  selector: 'app-jammer-stats-zone',
  templateUrl: './jammer-stats-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JammerStatsZoneComponent {
  private readonly gameService = inject(GameService);
  private readonly rosterService = inject(RosterService);

  protected barColor(percent: number): string {
    return performanceClass(percent);
  }

  // Pour chaque jammer ayant joué : points marqués, part des points totaux, taux de lead
  protected readonly jammerStats = computed(() => {
    const jams = this.gameService.jams();
    const total = this.gameService.totalPoints();
    const players = this.rosterService.players();

    return [...new Set(jams.map((jam) => jam.jammer))].map((playerId) => {
      const ownJams = jams.filter((jam) => jam.jammer === playerId);
      const points = ownJams.reduce((sum, jam) => sum + jam.points, 0);
      const leads = ownJams.filter((jam) => jam.lead).length;
      const player = players.find((candidate) => candidate.playerId === playerId);

      return {
        id: playerId,
        name: player ? `${player.playerId} · ${player.derbyName}` : playerId,
        points,
        pointsShare: percentage(points, total),
        leadRate: percentage(leads, ownJams.length),
      };
    });
  });
}
