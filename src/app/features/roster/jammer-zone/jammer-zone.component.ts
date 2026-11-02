import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PlayerType } from '../../../models/player.model';
import { MemberDragEnd } from '../line-card/line-card.component';

@Component({
  selector: 'app-jammer-zone',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './jammer-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JammerZoneComponent {
  readonly players = input.required<PlayerType[]>();
  // Nombre d'emplacements libres affichés quand la zone est vide ; la zone accepte davantage de jammers
  readonly minSlots = input(3);

  readonly playerDropped = output<PlayerType>();
  readonly memberDragEnded = output<MemberDragEnd>();

  protected readonly emptySlots = computed(() =>
    Array.from({ length: Math.max(0, this.minSlots() - this.players().length) }, (_, index) => index),
  );

  // Seules les jammers peuvent entrer, une seule fois chacune
  protected readonly canEnter = (drag: CdkDrag<PlayerType>): boolean => {
    const player = drag.data;
    const alreadyPlaced = this.players().some((member) => member.playerId === player.playerId);
    return player.position === 'J' && !alreadyPlaced;
  };

  protected onDrop(event: CdkDragDrop<unknown, unknown, PlayerType>): void {
    // Relâchée hors de la zone : c'est un retrait, géré par la page
    if (!event.isPointerOverContainer || event.previousContainer === event.container) {
      return;
    }
    this.playerDropped.emit(event.item.data);
  }

  protected onMemberDragEnded(player: PlayerType, event: CdkDragEnd): void {
    this.memberDragEnded.emit({ player, dropPoint: event.dropPoint });
  }
}
