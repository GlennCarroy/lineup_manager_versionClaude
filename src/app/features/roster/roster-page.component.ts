import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild } from '@angular/core';

import { LineType } from '../../models/line.model';
import { PlayerType } from '../../models/player.model';
import { RosterService } from '../../services/roster.service';
import { JammerZoneComponent } from './jammer-zone/jammer-zone.component';
import { LineCardComponent, MemberDragEnd } from './line-card/line-card.component';

@Component({
  selector: 'app-roster-page',
  imports: [LineCardComponent, JammerZoneComponent],
  templateUrl: './roster-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RosterPageComponent {
  private readonly rosterService = inject(RosterService);
  // Lignes et zone Jammers : relâcher une joueuse hors de ce tableau la retire de sa place
  private readonly board = viewChild.required<ElementRef<HTMLElement>>('board');

  protected readonly lines = this.rosterService.lines;
  protected readonly placedJammers = this.rosterService.placedJammers;
  private readonly blockers = computed(() => this.rosterService.roster().blockers);

  // Blockers présentes dans au moins une ligne, plus les jammers déposées dans la zone
  protected readonly placedCount = computed(
    () =>
      new Set(this.lines().flatMap((line) => line.blockerIds)).size +
      this.rosterService.roster().placedJammerIds.length,
  );

  protected playersOf(line: LineType): PlayerType[] {
    return line.blockerIds
      .map((playerId) => this.blockers().find((player) => player.playerId === playerId))
      .filter((player): player is PlayerType => player !== undefined);
  }

  protected assign(player: PlayerType, line: LineType): void {
    this.rosterService.addBlockerToLine(player.playerId, line.name);
  }

  protected assignJammer(player: PlayerType): void {
    this.rosterService.addJammerToZone(player.playerId);
  }

  protected onLineMemberDragEnded(line: LineType, event: MemberDragEnd): void {
    if (!this.isOutsideBoard(event)) {
      return;
    }
    this.rosterService.removeBlockerFromLine(event.player.playerId, line.name);
  }

  protected onJammerMemberDragEnded(event: MemberDragEnd): void {
    if (!this.isOutsideBoard(event)) {
      return;
    }
    this.rosterService.removeJammerFromZone(event.player.playerId);
  }

  private isOutsideBoard(event: MemberDragEnd): boolean {
    const board = this.board().nativeElement.getBoundingClientRect();
    const { x, y } = event.dropPoint;
    return x < board.left || x > board.right || y < board.top || y > board.bottom;
  }
}
