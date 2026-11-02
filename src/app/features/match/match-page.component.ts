import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MAX_PENALTIES } from '../../models/penalty.model';
import { PlayerType } from '../../models/player.model';
import { StatsZoneComponent } from '../game/stats-zone/stats-zone.component';
import { JammerStatsZoneComponent } from './jammer-stats-zone/jammer-stats-zone.component';
import { PlayerCardComponent } from '../../shared/player-card/player-card.component';
import { GameService } from '../../services/game.service';
import { RosterService } from '../../services/roster.service';

function byPlayerId(a: PlayerType, b: PlayerType): number {
  return Number(a.playerId) - Number(b.playerId);
}

@Component({
  selector: 'app-match-page',
  imports: [RouterLink, PlayerCardComponent, StatsZoneComponent, JammerStatsZoneComponent],
  templateUrl: './match-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchPageComponent {
  private readonly rosterService = inject(RosterService);
  private readonly gameService = inject(GameService);

  // Joueuses du match : les blockers placées dans une ligne et les jammers de la zone Jammers
  protected readonly blockers = computed(() => {
    const placedIds = new Set(this.rosterService.lines().flatMap((line) => line.blockerIds));
    return this.rosterService
      .roster()
      .blockers.filter((player) => placedIds.has(player.playerId))
      .sort(byPlayerId);
  });

  protected readonly jammers = computed(() => [...this.rosterService.placedJammers()].sort(byPlayerId));

  protected penaltyCount(playerId: string): number {
    return this.gameService.penaltyCount(playerId);
  }

  // Numéro du dernier jam auquel la joueuse a participé (jammeuse, ou blocker de la ligne du jam)
  protected lastJamNumber(playerId: string): number | null {
    const lines = this.rosterService.lines();
    let lastJam: number | null = null;

    for (const jam of this.gameService.jams()) {
      const line = lines.find((candidate) => candidate.name === jam.lineName);
      const participated = jam.jammer === playerId || (line?.blockerIds.includes(playerId) ?? false);
      if (participated && (lastJam === null || jam.jamNumber > lastJam)) {
        lastJam = jam.jamNumber;
      }
    }

    return lastJam;
  }

  // Raison pour laquelle la card ne peut pas recevoir de pénalité, ou null si elle le peut
  protected cardHint(playerId: string): string | null {
    if (this.penaltyCount(playerId) >= MAX_PENALTIES) {
      return 'Nombre maximum de pénalités atteint';
    }
    if (this.lastJamNumber(playerId) === null) {
      return 'Aucun jam joué';
    }
    return null;
  }

  // Chaque clic sur la card ajoute une pénalité au dernier jam de la joueuse
  protected penalize(player: PlayerType): void {
    const jamNumber = this.lastJamNumber(player.playerId);
    if (jamNumber !== null) {
      this.gameService.addPenalty(jamNumber, player.playerId);
    }
  }

  protected removeLastPenalty(player: PlayerType): void {
    this.gameService.removeLastPenalty(player.playerId);
  }
}
