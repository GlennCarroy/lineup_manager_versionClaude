import { computed, Injectable, signal } from '@angular/core';

import { MOCK_JAMS } from '../data/jams.mock';
import { JamType, TrackPassage } from '../models/jam.model';
import { MAX_PENALTIES } from '../models/penalty.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly jamsState = signal<JamType[]>(MOCK_JAMS);

  readonly jams = this.jamsState.asReadonly();

  readonly totalPoints = computed(() => this.jamsState().reduce((sum, jam) => sum + jam.points, 0));

  readonly leadCount = computed(() => this.jamsState().filter((jam) => jam.lead).length);

  readonly totalPenalties = computed(() => this.jamsState().reduce((sum, jam) => sum + jam.penalties.length, 0));

  // Efface toutes les données du match ; le roster n'est pas concerné
  resetMatch(): void {
    this.jamsState.set([]);
  }

  // Ajoute un passage sur le track au jam donné
  addPassage(jamNumber: number, passage: TrackPassage): void {
    this.jamsState.update((jams) =>
      jams.map((jam) =>
        jam.jamNumber === jamNumber ? { ...jam, passages: [...jam.passages, passage] } : jam,
      ),
    );
  }

  // Ajoute un passage de la ligne de blockers au jam donné
  addBlockerPassage(jamNumber: number, passage: TrackPassage): void {
    this.jamsState.update((jams) =>
      jams.map((jam) =>
        jam.jamNumber === jamNumber ? { ...jam, blockerPassages: [...jam.blockerPassages, passage] } : jam,
      ),
    );
  }

  // Nombre de pénalités d'une joueuse sur l'ensemble du match
  penaltyCount(playerId: string): number {
    return this.jamsState().reduce((sum, jam) => sum + jam.penalties.filter((id) => id === playerId).length, 0);
  }

  addJam(lineName: string, jammer: string): void {
    this.jamsState.update((jams) => [
      ...jams,
      { jamNumber: jams.length + 1, jammer, lineName, points: 0, penalties: [], lead: false, passages: [], blockerPassages: [] },
    ]);
  }

  toggleLead(jamNumber: number): void {
    this.jamsState.update((jams) =>
      jams.map((jam) => (jam.jamNumber === jamNumber ? { ...jam, lead: !jam.lead } : jam)),
    );
  }

  // Chaque appel compte une pénalité de plus pour cette joueuse dans ce jam, dans la limite du match
  addPenalty(jamNumber: number, playerId: string): void {
    if (this.penaltyCount(playerId) >= MAX_PENALTIES) {
      return;
    }
    this.jamsState.update((jams) =>
      jams.map((jam) =>
        jam.jamNumber === jamNumber ? { ...jam, penalties: [...jam.penalties, playerId] } : jam,
      ),
    );
  }

  // Retire la dernière pénalité de cette joueuse, dans le dernier jam où elle en a une
  removeLastPenalty(playerId: string): void {
    const lastJam = this.jamsState()
      .filter((jam) => jam.penalties.includes(playerId))
      .sort((a, b) => b.jamNumber - a.jamNumber)[0];
    if (lastJam) {
      this.removePenalty(lastJam.jamNumber, playerId);
    }
  }

  // Retire la dernière pénalité de cette joueuse dans ce jam
  removePenalty(jamNumber: number, playerId: string): void {
    this.jamsState.update((jams) =>
      jams.map((jam) => {
        const index = jam.penalties.lastIndexOf(playerId);
        if (jam.jamNumber !== jamNumber || index === -1) {
          return jam;
        }
        return { ...jam, penalties: jam.penalties.filter((_, position) => position !== index) };
      }),
    );
  }

  // Les points ne descendent jamais sous zéro
  addPoints(jamNumber: number, delta: number): void {
    this.jamsState.update((jams) =>
      jams.map((jam) =>
        jam.jamNumber === jamNumber ? { ...jam, points: Math.max(0, jam.points + delta) } : jam,
      ),
    );
  }
}
