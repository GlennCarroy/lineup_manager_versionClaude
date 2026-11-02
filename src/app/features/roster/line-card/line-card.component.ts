import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { LineType } from '../../../models/line.model';
import { PlayerType } from '../../../models/player.model';

export type MemberDragEnd = {
  player: PlayerType;
  dropPoint: { x: number; y: number };
};

@Component({
  selector: 'app-line-card',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './line-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineCardComponent {
  readonly line = input.required<LineType>();
  readonly players = input.required<PlayerType[]>();
  readonly maxPlayers = input(5);

  readonly playerDropped = output<PlayerType>();
  readonly memberDragEnded = output<MemberDragEnd>();

  protected readonly isFull = computed(() => this.players().length >= this.maxPlayers());

  protected readonly emptySlots = computed(() =>
    Array.from({ length: Math.max(0, this.maxPlayers() - this.players().length) }, (_, index) => index),
  );

  // Seule une blocker peut entrer, si la ligne n'est pas pleine et qu'elle n'y est pas déjà
  protected readonly canEnter = (drag: CdkDrag<PlayerType>): boolean => {
    const player = drag.data;
    const alreadyInLine = this.players().some((member) => member.playerId === player.playerId);
    return player.position === 'B' && !alreadyInLine && !this.isFull();
  };

  protected onDrop(event: CdkDragDrop<LineType, LineType, PlayerType>): void {
    // Relâchée hors de la liste : c'est un retrait, géré par la page, pas un ajout
    if (!event.isPointerOverContainer || event.previousContainer === event.container) {
      return;
    }
    this.playerDropped.emit(event.item.data);
  }

  protected onMemberDragEnded(player: PlayerType, event: CdkDragEnd): void {
    this.memberDragEnded.emit({ player, dropPoint: event.dropPoint });
  }
}
