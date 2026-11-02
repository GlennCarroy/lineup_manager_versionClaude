import { computed, inject, Injectable, signal } from '@angular/core';

import { PlayerType } from '../models/player.model';
import { RosterType } from '../models/roster.model';
import { PlayerRepository } from './player.repository';

// Lignes proposées au départ, vides : les joueuses viennent de la base, le placement reste en mémoire
const DEFAULT_LINE_NAMES = ['Ligne 1', 'Ligne 2', 'Fatline'];

const INITIAL_ROSTER: RosterType = {
  blockers: [],
  jammers: [],
  lines: DEFAULT_LINE_NAMES.map((name) => ({ name, blockerIds: [] })),
  placedJammerIds: [],
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Erreur de synchronisation avec la base';
}

@Injectable({ providedIn: 'root' })
export class RosterService {
  private readonly repository = inject(PlayerRepository);
  private readonly rosterState = signal<RosterType>(INITIAL_ROSTER);

  readonly roster = this.rosterState.asReadonly();

  // Dernière erreur de synchronisation avec Supabase, ou null
  readonly syncError = signal<string | null>(null);

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

  constructor() {
    void this.loadPlayers();
  }

  // Charge les joueuses depuis la base ; le placement dans les lignes et la zone Jammers est conservé
  async loadPlayers(): Promise<void> {
    try {
      const players = await this.repository.list();
      this.rosterState.update((roster) => ({
        ...roster,
        blockers: players.filter((player) => player.position === 'B'),
        jammers: players.filter((player) => player.position === 'J'),
      }));
      this.syncError.set(null);
    } catch (error) {
      this.syncError.set(messageOf(error));
    }
  }

  // Ajoute une joueuse ou remplace celle qui a le même playerId (son poste et son numéro peuvent changer)
  savePlayer(player: PlayerType, previousPlayerId: string = player.playerId): void {
    this.rosterState.update((roster) => {
      const base = withoutPlayer(withoutPlayer(roster, previousPlayerId), player.playerId);
      const renamed =
        previousPlayerId === player.playerId ? base : renameInPlacement(base, previousPlayerId, player.playerId);
      const updated = withPlayer(renamed, player);
      // Une jammer n'appartient à aucune ligne, et une blocker n'est pas dans la zone Jammers
      return player.position === 'J'
        ? withoutBlockerFromLines(updated, player.playerId)
        : withoutJammerFromZone(updated, player.playerId);
    });

    void this.persist(() => this.repository.save(player, previousPlayerId));
  }

  removePlayer(playerId: string): void {
    this.rosterState.update((roster) =>
      withoutJammerFromZone(withoutBlockerFromLines(withoutPlayer(roster, playerId), playerId), playerId),
    );

    void this.persist(() => this.repository.remove(playerId));
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

  // L'état local est déjà à jour : si l'écriture échoue, on recharge la base et on signale l'erreur
  private async persist(action: () => Promise<void>): Promise<void> {
    try {
      await action();
      this.syncError.set(null);
    } catch (error) {
      const message = messageOf(error);
      await this.loadPlayers();
      this.syncError.set(message);
    }
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

// Une joueuse dont le numéro change garde sa place dans les lignes et la zone Jammers
function renameInPlacement(roster: RosterType, from: string, to: string): RosterType {
  const rename = (id: string): string => (id === from ? to : id);
  return {
    ...roster,
    lines: roster.lines.map((line) => ({ ...line, blockerIds: line.blockerIds.map(rename) })),
    placedJammerIds: roster.placedJammerIds.map(rename),
  };
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
