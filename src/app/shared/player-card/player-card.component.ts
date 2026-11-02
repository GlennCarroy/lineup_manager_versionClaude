import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MAX_PENALTIES } from '../../models/penalty.model';
import { PlayerType, Position, Specialization } from '../../models/player.model';

const PIVOT_ACCENT = 'bg-hot text-white';

const POSITION_LABELS: Record<Position, string> = {
  B: 'Blocker',
  J: 'Jammer',
};

const POSITION_ACCENTS: Record<Position, string> = {
  B: 'bg-ice text-track-night',
  J: 'bg-neon text-track-night',
};

const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  P: 'Pivot',
  O: 'Offense',
};

const SPECIALIZATION_ACCENTS: Record<Specialization, string> = {
  P: PIVOT_ACCENT,
  O: PIVOT_ACCENT,
};

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  readonly player = input.required<PlayerType>();
  // Pénalités de la joueuse sur le match
  readonly penalties = input(0);

  protected readonly isMaxed = computed(() => this.penalties() >= MAX_PENALTIES);

  // Fond selon les pénalités : orange à partir de 4, rouge à partir de 6
  protected readonly surface = computed(() => {
    if (this.penalties() >= 6) {
      return 'border-red-500 bg-red-700';
    }
    if (this.penalties() >= 4) {
      return 'border-orange-400 bg-orange-600';
    }
    return 'border-track-line bg-track-panel';
  });

  protected readonly positionLabel = computed(() => POSITION_LABELS[this.player().position]);
  protected readonly positionAccent = computed(() => POSITION_ACCENTS[this.player().position]);

  protected readonly specializationLabel = computed(() => {
    const specialization = this.player().specialization;
    return specialization ? SPECIALIZATION_LABELS[specialization] : null;
  });
  protected readonly specializationAccent = computed(() => {
    const specialization = this.player().specialization;
    return specialization ? SPECIALIZATION_ACCENTS[specialization] : '';
  });
}
