import { inject, Injectable } from '@angular/core';

import { SupabaseService } from '../core/supabase.service';
import { PlayerType } from '../models/player.model';

const TABLE = 'Player';
const COLUMNS = 'playerId, derbyName, surname, position, specialization, rotation';

// Ligne de la table Player ; toutes les colonnes sont nullables côté base
type PlayerRow = {
  playerId: string | null;
  derbyName: string | null;
  surname: string | null;
  position: string | null;
  specialization: string | null;
  rotation: number | string | null;
};

function fromRow(row: PlayerRow): PlayerType | null {
  if (!row.playerId) {
    return null;
  }
  return {
    playerId: row.playerId,
    derbyName: row.derbyName ?? '',
    surname: row.surname ?? '',
    position: row.position === 'J' ? 'J' : 'B',
    specialization: row.specialization === 'P' || row.specialization === 'O' ? row.specialization : undefined,
    rotation: Number(row.rotation ?? 1),
  };
}

function toRow(player: PlayerType): PlayerRow {
  return {
    playerId: player.playerId,
    derbyName: player.derbyName,
    surname: player.surname,
    position: player.position,
    specialization: player.specialization ?? null,
    rotation: player.rotation,
  };
}

@Injectable({ providedIn: 'root' })
export class PlayerRepository {
  private readonly supabase = inject(SupabaseService);

  async list(): Promise<PlayerType[]> {
    const { data, error } = await this.supabase.client.from(TABLE).select(COLUMNS);
    if (error) {
      throw new Error(error.message);
    }
    return (data as PlayerRow[]).map(fromRow).filter((player): player is PlayerType => player !== null);
  }

  // Modifie la joueuse retrouvée par son ancien numéro, ou l'insère si elle n'existe pas encore
  async save(player: PlayerType, previousPlayerId: string): Promise<void> {
    const client = this.supabase.client;

    const lookup = await client.from(TABLE).select('id').eq('playerId', previousPlayerId).limit(1);
    if (lookup.error) {
      throw new Error(lookup.error.message);
    }

    const existingId = (lookup.data as { id: number }[])[0]?.id;
    const result =
      existingId === undefined
        ? await client.from(TABLE).insert(toRow(player))
        : await client.from(TABLE).update(toRow(player)).eq('id', existingId);

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async remove(playerId: string): Promise<void> {
    const { error } = await this.supabase.client.from(TABLE).delete().eq('playerId', playerId);
    if (error) {
      throw new Error(error.message);
    }
  }
}
