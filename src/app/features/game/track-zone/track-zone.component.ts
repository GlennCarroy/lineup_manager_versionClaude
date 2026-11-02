import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { JamType, TrackPassage } from '../../../models/jam.model';
import { GameService } from '../../../services/game.service';
import { RosterService } from '../../../services/roster.service';
import { TrackFieldComponent, TrackHeat, TrackLabels } from './track-field/track-field.component';

const JAMMER_LABELS: TrackLabels = { win: 'Got points !', loss: 'Kicked out' };
const BLOCKER_LABELS: TrackLabels = { win: 'Stopped', loss: 'Broken' };

// Nombre de passages par zone, à partir d'une liste de passages
function heatOf(passages: TrackPassage[]): TrackHeat {
  const heat: TrackHeat = {};
  for (const passage of passages) {
    const entry = heat[passage.zoneId] ?? { win: 0, loss: 0 };
    entry[passage.outcome] += 1;
    heat[passage.zoneId] = entry;
  }
  return heat;
}

@Component({
  selector: 'app-track-zone',
  imports: [TrackFieldComponent],
  templateUrl: './track-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackZoneComponent {
  private readonly gameService = inject(GameService);
  private readonly rosterService = inject(RosterService);

  protected readonly jammerLabels = JAMMER_LABELS;
  protected readonly blockerLabels = BLOCKER_LABELS;

  // Dernier jam ajouté : c'est lui qui reçoit les passages
  protected readonly activeJam = computed<JamType | null>(() =>
    this.gameService
      .jams()
      .reduce<JamType | null>((last, jam) => (last === null || jam.jamNumber > last.jamNumber ? jam : last), null),
  );

  protected readonly enabled = computed(() => this.activeJam() !== null);

  // Numéro et nom de la jammeuse du dernier jam
  protected readonly jammerLabel = computed(() => {
    const jammerId = this.activeJam()?.jammer;
    const jammer = this.rosterService.players().find((player) => player.playerId === jammerId);
    return jammer ? `${jammer.playerId} · ${jammer.derbyName}` : '';
  });

  // Passages de la jammeuse du dernier jam : chaque nouvelle jammeuse remet son track à zéro
  protected readonly jammerHeat = computed<TrackHeat>(() => {
    const jammer = this.activeJam()?.jammer;
    if (jammer === undefined) {
      return {};
    }
    return heatOf(
      this.gameService
        .jams()
        .filter((jam) => jam.jammer === jammer)
        .flatMap((jam) => jam.passages),
    );
  });

  // Passages de la ligne du dernier jam : chaque nouvelle ligne remet son track à zéro
  protected readonly blockerHeat = computed<TrackHeat>(() => {
    const lineName = this.activeJam()?.lineName;
    if (lineName === undefined) {
      return {};
    }
    return heatOf(
      this.gameService
        .jams()
        .filter((jam) => jam.lineName === lineName)
        .flatMap((jam) => jam.blockerPassages),
    );
  });

  protected addJammerPassage(passage: { zoneId: string; outcome: TrackPassage['outcome'] }): void {
    const jam = this.activeJam();
    if (jam !== null) {
      this.gameService.addPassage(jam.jamNumber, passage);
    }
  }

  protected addBlockerPassage(passage: { zoneId: string; outcome: TrackPassage['outcome'] }): void {
    const jam = this.activeJam();
    if (jam !== null) {
      this.gameService.addBlockerPassage(jam.jamNumber, passage);
    }
  }
}
