import { CdkDrag, CdkDragPlaceholder, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PlayerType, Position, Specialization } from '../../models/player.model';
import { CharterDrawerService } from '../../services/charter-drawer.service';
import { RosterService } from '../../services/roster.service';
import { PlayerFormComponent } from './player-form/player-form.component';

type CharterFilter = Position | Specialization;

const FILTERS: { code: CharterFilter; label: string }[] = [
  { code: 'B', label: 'Blocker' },
  { code: 'J', label: 'Jammer' },
  { code: 'P', label: 'Pivot' },
  { code: 'O', label: 'Offense' },
];

type FormMode = { kind: 'create' } | { kind: 'edit'; player: PlayerType };

@Component({
  selector: 'app-charter-drawer',
  imports: [PlayerFormComponent, CdkDrag, CdkDragPlaceholder, CdkDragPreview, CdkDropList],
  templateUrl: './charter-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class CharterDrawerComponent {
  private readonly drawer = inject(CharterDrawerService);
  private readonly rosterService = inject(RosterService);

  protected readonly isOpen = this.drawer.isOpen;
  protected readonly filters = FILTERS;
  protected readonly activeFilter = signal<CharterFilter | null>(null);
  protected readonly formMode = signal<FormMode | null>(null);

  // La liste sert de source de drag uniquement : rien ne peut y être déposé
  protected readonly noDrop = () => false;

  protected readonly players = this.rosterService.players;
  protected readonly playerIds = computed(() => this.players().map((player) => player.playerId));

  // Sans filtre, toutes les joueuses ; sinon celles qui ont le poste ou la spécialisation choisi
  // Triées par numéro croissant
  protected readonly filteredPlayers = computed(() => {
    const active = this.activeFilter();
    const players =
      active === null
        ? this.players()
        : this.players().filter((player) => player.position === active || player.specialization === active);

    return [...players].sort((a, b) => Number(a.playerId) - Number(b.playerId));
  });

  protected readonly isEditing = computed(() => this.formMode()?.kind === 'edit');

  protected readonly formPlayer = computed(() => {
    const mode = this.formMode();
    return mode?.kind === 'edit' ? mode.player : null;
  });

  protected close(): void {
    this.formMode.set(null);
    this.drawer.close();
  }

  protected labelOf(code: CharterFilter): string {
    return FILTERS.find((filter) => filter.code === code)?.label ?? code;
  }

  // Un seul filtre actif à la fois ; recliquer sur le filtre actif le désactive
  protected toggleFilter(code: CharterFilter): void {
    this.activeFilter.update((active) => (active === code ? null : code));
  }

  protected openCreate(): void {
    this.formMode.set({ kind: 'create' });
  }

  protected openEdit(player: PlayerType): void {
    this.formMode.set({ kind: 'edit', player });
  }

  protected savePlayer(player: PlayerType): void {
    this.rosterService.savePlayer(player);
    this.formMode.set(null);
  }

  protected deletePlayer(player: PlayerType): void {
    if (!confirm(`Supprimer ${player.derbyName} ?`)) {
      return;
    }

    this.rosterService.removePlayer(player.playerId);
    if (this.formPlayer()?.playerId === player.playerId) {
      this.formMode.set(null);
    }
  }
}
