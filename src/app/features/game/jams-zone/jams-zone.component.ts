import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { JamType } from '../../../models/jam.model';
import { PlayerType } from '../../../models/player.model';
import { GameService } from '../../../services/game.service';
import { RosterService } from '../../../services/roster.service';
import { PenaltyDrawerComponent } from '../penalty-drawer/penalty-drawer.component';

@Component({
  selector: 'app-jams-zone',
  imports: [PenaltyDrawerComponent],
  templateUrl: './jams-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JamsZoneComponent {
  private readonly rosterService = inject(RosterService);
  private readonly gameService = inject(GameService);

  protected readonly lines = this.rosterService.lines;
  protected readonly jammers = this.rosterService.placedJammers;

  // Du dernier jam au premier
  protected readonly jams = computed(() =>
    [...this.gameService.jams()].sort((a, b) => b.jamNumber - a.jamNumber),
  );

  protected readonly selectedLineName = signal<string | null>(null);
  protected readonly selectedJammerId = signal<string | null>(null);
  protected readonly canAdd = computed(
    () => this.selectedLineName() !== null && this.selectedJammerId() !== null,
  );

  // Jam dont le drawer de pénalités est ouvert
  protected readonly openedJamNumber = signal<number | null>(null);
  protected readonly openedJam = computed<JamType | null>(
    () => this.jams().find((jam) => jam.jamNumber === this.openedJamNumber()) ?? null,
  );
  protected readonly openedCandidates = computed(() => {
    const jam = this.openedJam();
    return jam ? this.penaltyCandidates(jam) : [];
  });

  protected selectLine(event: Event): void {
    this.selectedLineName.set((event.target as HTMLSelectElement).value || null);
  }

  protected selectJammer(event: Event): void {
    this.selectedJammerId.set((event.target as HTMLSelectElement).value || null);
  }

  protected addJam(): void {
    const lineName = this.selectedLineName();
    const jammerId = this.selectedJammerId();
    if (lineName === null || jammerId === null) {
      return;
    }
    this.gameService.addJam(lineName, jammerId);
  }

  protected toggleLead(jamNumber: number): void {
    this.gameService.toggleLead(jamNumber);
  }

  protected addPoints(jamNumber: number, delta: number): void {
    this.gameService.addPoints(jamNumber, delta);
  }

  protected openPenaltyDrawer(jamNumber: number): void {
    this.openedJamNumber.set(jamNumber);
  }

  protected closePenaltyDrawer(): void {
    this.openedJamNumber.set(null);
  }

  protected addPenalty(playerId: string): void {
    const jamNumber = this.openedJamNumber();
    if (jamNumber !== null) {
      this.gameService.addPenalty(jamNumber, playerId);
    }
  }

  protected removePenalty(playerId: string): void {
    const jamNumber = this.openedJamNumber();
    if (jamNumber !== null) {
      this.gameService.removePenalty(jamNumber, playerId);
    }
  }

  // Joueuses pouvant être pénalisées : la jammeuse du jam et les blockers de la ligne
  private penaltyCandidates(jam: JamType): PlayerType[] {
    const line = this.rosterService.lines().find((candidate) => candidate.name === jam.lineName);
    const playerIds = [jam.jammer, ...(line?.blockerIds ?? [])];
    return playerIds
      .map((playerId) => this.rosterService.players().find((player) => player.playerId === playerId))
      .filter((player): player is PlayerType => player !== undefined);
  }

  protected jammerLabel(playerId: string): string {
    const jammer = this.rosterService.players().find((player) => player.playerId === playerId);
    return jammer ? `${jammer.playerId} · ${jammer.derbyName}` : playerId;
  }
}
