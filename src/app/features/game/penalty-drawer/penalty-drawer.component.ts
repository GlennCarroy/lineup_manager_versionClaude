import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { JamType } from '../../../models/jam.model';
import { MAX_PENALTIES } from '../../../models/penalty.model';
import { PlayerType } from '../../../models/player.model';
import { GameService } from '../../../services/game.service';
import { PlayerCardComponent } from '../../../shared/player-card/player-card.component';

@Component({
  selector: 'app-penalty-drawer',
  imports: [PlayerCardComponent],
  templateUrl: './penalty-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class PenaltyDrawerComponent {
  private readonly gameService = inject(GameService);

  protected readonly maxPenalties = MAX_PENALTIES;

  // Null quand le drawer est fermé
  readonly jam = input.required<JamType | null>();
  readonly players = input.required<PlayerType[]>();

  readonly closed = output<void>();
  readonly penaltyAdded = output<string>();
  readonly penaltyRemoved = output<string>();

  protected countInJam(playerId: string): number {
    return this.jam()?.penalties.filter((id) => id === playerId).length ?? 0;
  }

  protected countInMatch(playerId: string): number {
    return this.gameService
      .jams()
      .reduce((sum, jam) => sum + jam.penalties.filter((id) => id === playerId).length, 0);
  }
}
