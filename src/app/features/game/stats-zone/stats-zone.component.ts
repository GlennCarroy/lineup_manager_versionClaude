import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { RosterService } from '../../../services/roster.service';
import { performanceClass } from '../../../shared/performance-color';

// Lignes absentes des statistiques de lead par ligne
const EXCLUDED_LINES = ['Fatline'];

function percentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

@Component({
  selector: 'app-stats-zone',
  templateUrl: './stats-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsZoneComponent {
  private readonly gameService = inject(GameService);
  private readonly rosterService = inject(RosterService);

  protected barColor(percent: number): string {
    return performanceClass(percent);
  }

  protected readonly jamCount = computed(() => this.gameService.jams().length);
  protected readonly totalPoints = this.gameService.totalPoints;
  protected readonly totalPenalties = this.gameService.totalPenalties;

  protected readonly leadPercentage = computed(() =>
    percentage(this.gameService.leadCount(), this.jamCount()),
  );

  protected readonly lineLeadRates = computed(() => {
    const jams = this.gameService.jams();
    return this.rosterService
      .lines()
      .filter((line) => !EXCLUDED_LINES.includes(line.name))
      .map((line) => {
        const lineJams = jams.filter((jam) => jam.lineName === line.name);
        const leads = lineJams.filter((jam) => jam.lead).length;
        return { name: line.name, percentage: percentage(leads, lineJams.length) };
      });
  });
}
