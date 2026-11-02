import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase.config';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private instance: SupabaseClient | null = null;

  // Créé à la première utilisation, pour que l'application démarre même si la clé n'est pas renseignée
  get client(): SupabaseClient {
    if (!SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Clé Supabase manquante : renseigne SUPABASE_PUBLISHABLE_KEY dans core/supabase.config.ts');
    }
    this.instance ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    return this.instance;
  }
}
