import { computed, Injectable, signal } from '@angular/core';

import { MOCK_ROSTER } from '../data/roster.mock';
import { PlayerType } from '../models/player.model';
import { RosterType } from '../models/roster.model';

@Injectable({ providedIn: 'root' })
export class RosterService {
  private readonly rosterState = signal<RosterType>(MOCK_ROSTER);

  readonly roster = this.rosterState.asReadonly();

  readonly lines = computed(() => this.rosterState().lines);

  // Jammers déposées dans la zone Jammers, dans l'ordre de dépôt
  readonly placedJammers = computed(() => {
    const { jammers, placedJammerIds } = this.rosterState();
    return placedJammerIds
      .map((playerId) => jammers.find((jammer) => jammer.playerId === playerId))
      .filter((jammer): jammer is PlayerType => jammer !== undefined);
  });

  readonly players = computed(() => {
    const { blockers, jammers } = this.rosterState();
    return [...blockers, ...jammers];
  });

  // Ajoute une joueuse ou remplace celle qui a le même playerId (son poste peut changer)
  savePlayer(player: PlayerType): void {
    this.rosterState.update((roster) => {
      const updated = withPlayer(withoutPlayer(roster, player.playerId), player);
      // Une jammer n'appartient à aucune ligne, et une blocker n'est pas dans la zone Jammers
      return player.position === 'J'
        ? withoutBlockerFromLines(updated, player.playerId)
        : withoutJammerFromZone(updated, player.playerId);
    });
  }

  removePlayer(playerId: string): void {
    this.rosterState.update((roster) =>
      withoutJammerFromZone(withoutBlockerFromLines(withoutPlayer(roster, playerId), playerId), playerId),
    );
  }

  // Une blocker peut rejoindre plusieurs lignes, sans quitter les autres
  addBlockerToLine(playerId: string, lineName: string): void {
    this.rosterState.update((roster) => ({
      ...roster,
      lines: roster.lines.map((line) =>
        line.name === lineName && !line.blockerIds.includes(playerId)
          ? { ...line, blockerIds: [...line.blockerIds, playerId] }
          : line,
      ),
    }));
  }

  removeBlockerFromLine(playerId: string, lineName: string): void {
    this.rosterState.update((roster) => ({
      ...roster,
      lines: roster.lines.map((line) =>
        line.name === lineName
          ? { ...line, blockerIds: line.blockerIds.filter((id) => id !== playerId) }
          : line,
      ),
    }));
  }

  // La zone Jammers accepte un nombre illimité de jammers, une seule fois chacune
  addJammerToZone(playerId: string): void {
    this.rosterState.update((roster) =>
      roster.placedJammerIds.includes(playerId)
        ? roster
        : { ...roster, placedJammerIds: [...roster.placedJammerIds, playerId] },
    );
  }

  removeJammerFromZone(playerId: string): void {
    this.rosterState.update((roster) => withoutJammerFromZone(roster, playerId));
  }
}

function withoutPlayer(roster: RosterType, playerId: string): RosterType {
  return {
    ...roster,
    blockers: roster.blockers.filter((player) => player.playerId !== playerId),
    jammers: roster.jammers.filter((player) => player.playerId !== playerId),
  };
}

function withPlayer(roster: RosterType, player: PlayerType): RosterType {
  if (player.position === 'J') {
    return { ...roster, jammers: [...roster.jammers, player] };
  }
  return { ...roster, blockers: [...roster.blockers, player] };
}

function withoutBlockerFromLines(roster: RosterType, playerId: string): RosterType {
  return {
    ...roster,
    lines: roster.lines.map((line) => ({
      ...line,
      blockerIds: line.blockerIds.filter((id) => id !== playerId),
    })),
  };
}

function withoutJammerFromZone(roster: RosterType, playerId: string): RosterType {
  return {
    ...roster,
    placedJammerIds: roster.placedJammerIds.filter((id) => id !== playerId),
  };
}
