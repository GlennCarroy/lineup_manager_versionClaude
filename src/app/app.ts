import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeaderComponent } from './core/layout/app-header.component';
import { CharterDrawerComponent } from './features/charter/charter-drawer.component';
import { CharterDrawerService } from './services/charter-drawer.service';

@Component({
  selector: 'app-root',
  imports: [CdkDropListGroup, RouterOutlet, AppHeaderComponent, CharterDrawerComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly drawerOpen = inject(CharterDrawerService).isOpen;
}
