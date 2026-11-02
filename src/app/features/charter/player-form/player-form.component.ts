import { ChangeDetectionStrategy, Component, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';

import { PlayerType, Position, Specialization } from '../../../models/player.model';

@Component({
  selector: 'app-player-form',
  imports: [ReactiveFormsModule],
  templateUrl: './player-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerFormComponent implements OnInit {
  // Null en création, joueuse existante en édition
  readonly player = input<PlayerType | null>(null);
  readonly existingIds = input<string[]>([]);

  readonly saved = output<PlayerType>();
  readonly cancelled = output<void>();

  protected readonly duplicateId = signal(false);

  protected readonly form = new FormGroup({
    playerId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    derbyName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    surname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    position: new FormControl<Position>('B', { nonNullable: true }),
    specialization: new FormControl<Specialization | null>(null),
    rotation: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  // Un jammer n'a pas de spécialisation : on masque le champ et on le remet à Aucune
  protected readonly isJammer = toSignal(
    this.form.controls.position.valueChanges.pipe(map((position) => position === 'J')),
    { initialValue: false },
  );

  constructor() {
    this.form.controls.position.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((position) => {
        if (position === 'J') {
          this.form.controls.specialization.setValue(null);
        }
      });
  }

  ngOnInit(): void {
    const player = this.player();
    if (!player) {
      return;
    }

    this.form.setValue({
      playerId: player.playerId,
      derbyName: player.derbyName,
      surname: player.surname,
      position: player.position,
      specialization: player.specialization ?? null,
      rotation: player.rotation,
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const playerId = value.playerId.trim();
    const isSamePlayer = playerId === this.player()?.playerId;

    if (!isSamePlayer && this.existingIds().includes(playerId)) {
      this.duplicateId.set(true);
      return;
    }

    this.duplicateId.set(false);
    this.saved.emit({
      playerId,
      derbyName: value.derbyName.trim(),
      surname: value.surname.trim(),
      position: value.position,
      specialization: value.position === 'J' ? undefined : (value.specialization ?? undefined),
      rotation: value.rotation,
    });
  }
}
