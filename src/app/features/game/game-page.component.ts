import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GameService } from '../../services/game.service';
import { JamsZoneComponent } from './jams-zone/jams-zone.component';
import { StatsZoneComponent } from './stats-zone/stats-zone.component';
import { TrackZoneComponent } from './track-zone/track-zone.component';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink, TrackZoneComponent, StatsZoneComponent, JamsZoneComponent],
  templateUrl: './game-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class GamePageComponent {
  private readonly gameService = inject(GameService);

  protected readonly menuOpen = signal(false);
  protected readonly resetDialogOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected openResetDialog(): void {
    this.menuOpen.set(false);
    this.resetDialogOpen.set(true);
  }

  protected cancelReset(): void {
    this.resetDialogOpen.set(false);
  }

  // Efface les données du match ; le roster est conservé
  protected confirmReset(): void {
    this.gameService.resetMatch();
    this.resetDialogOpen.set(false);
  }

  protected onEscape(): void {
    this.closeMenu();
    this.cancelReset();
  }
}
