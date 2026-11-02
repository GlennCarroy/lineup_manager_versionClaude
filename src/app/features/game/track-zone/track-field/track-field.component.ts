import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

import { TrackPassage } from '../../../../models/jam.model';
import {
  TRACK_CENTER_MARKS,
  TRACK_INNER_PATH,
  TRACK_LANE_PATH,
  TRACK_OUTER_PATH,
  TRACK_SECTOR_BOUNDARIES,
  TRACK_VIEWBOX,
  TRACK_ZONES,
  TrackZone,
} from '../track-geometry';

// Nombre de passages par zone et par issue
export type TrackHeat = Record<string, { win: number; loss: number }>;

export type TrackLabels = { win: string; loss: string };

type Rgb = [number, number, number];

// « Win » : du vert clair au vert foncé, selon la part de passages gagnés
const WIN_LOW: Rgb = [220, 252, 231];
const WIN_HIGH: Rgb = [22, 101, 52];
// « Loss » : du jaune au rouge, selon la part de passages perdus
const LOSS_LOW: Rgb = [253, 224, 71];
const LOSS_HIGH: Rgb = [185, 28, 28];

// Nombre de passages à partir duquel le volume atteint 50 % (plafond doux, jamais 100 %)
const VOLUME_HALF = 4;
// Opacité maximale d'une couche
const OPACITY_MAX = 0.9;

// Couleur de fond d'une zone vide : la surface de la piste (#151922)
const BASE_SURFACE: Rgb = [21, 25, 34];

function blendRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * ratio)) as Rgb;
}

function toCss(rgb: Rgb): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

function mix(from: Rgb, to: Rgb, ratio: number): string {
  return toCss(blendRgb(from, to, ratio));
}

// Part d'une issue dans la zone, entre 0 et 1, indépendante des autres zones
function share(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

// Volume de la zone : croît avec le nombre de passages, sans atteindre 100 %
function volume(total: number): number {
  return total / (total + VOLUME_HALF);
}

@Component({
  selector: 'app-track-field',
  templateUrl: './track-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closePopover()',
  },
})
export class TrackFieldComponent {
  readonly heat = input.required<TrackHeat>();
  readonly labels = input.required<TrackLabels>();
  readonly enabled = input(false);
  // Texte affiché au centre du track
  readonly label = input('');

  readonly passageChosen = output<{ zoneId: string; outcome: TrackPassage['outcome'] }>();

  private readonly wrapper = viewChild.required<ElementRef<HTMLElement>>('wrapper');

  protected readonly viewBox = `0 0 ${TRACK_VIEWBOX.width} ${TRACK_VIEWBOX.height}`;
  protected readonly zones = TRACK_ZONES;
  protected readonly outerPath = TRACK_OUTER_PATH;
  protected readonly innerPath = TRACK_INNER_PATH;
  protected readonly lanePath = TRACK_LANE_PATH;
  protected readonly sectorBoundaries = TRACK_SECTOR_BOUNDARIES;
  protected readonly centerMarks = TRACK_CENTER_MARKS;

  // Zone ouverte et position du panneau, relative au conteneur du track
  protected readonly popover = signal<{ zone: TrackZone; x: number; y: number } | null>(null);

  protected zoneTitle(zone: TrackZone): string {
    const { win, loss } = this.heatOf(zone.id);
    return `${zone.id}: ${win} ${this.labels().win}, ${loss} ${this.labels().loss}`;
  }

  // Couche verte : teinte selon la part de « win », opacité selon la part et le volume
  protected winFill(zone: TrackZone): string {
    const { win, loss } = this.heatOf(zone.id);
    return mix(WIN_LOW, WIN_HIGH, share(win, win + loss));
  }

  protected winOpacity(zone: TrackZone): number {
    const { win, loss } = this.heatOf(zone.id);
    const total = win + loss;
    return OPACITY_MAX * share(win, total) * volume(total);
  }

  // Couche jaune → rouge : teinte selon la part de « loss », opacité selon la part et le volume
  protected lossFill(zone: TrackZone): string {
    const { win, loss } = this.heatOf(zone.id);
    return mix(LOSS_LOW, LOSS_HIGH, share(loss, win + loss));
  }

  protected lossOpacity(zone: TrackZone): number {
    const { win, loss } = this.heatOf(zone.id);
    const total = win + loss;
    return OPACITY_MAX * share(loss, total) * volume(total);
  }

  // Numéro de zone : couleur à mi-chemin entre le blanc et le fond réel de la zone (surface + passages)
  protected zoneNumberColor(zone: TrackZone): string {
    const { win, loss } = this.heatOf(zone.id);
    const total = win + loss;
    let background = BASE_SURFACE;
    background = blendRgb(background, blendRgb(WIN_LOW, WIN_HIGH, share(win, total)), this.winOpacity(zone));
    background = blendRgb(background, blendRgb(LOSS_LOW, LOSS_HIGH, share(loss, total)), this.lossOpacity(zone));
    return toCss(blendRgb(background, [255, 255, 255], 0.5));
  }

  protected openPopover(event: MouseEvent, zone: TrackZone): void {
    event.stopPropagation();
    if (!this.enabled()) {
      return;
    }
    const rect = this.wrapper().nativeElement.getBoundingClientRect();
    this.popover.set({ zone, x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  protected closePopover(): void {
    this.popover.set(null);
  }

  protected choose(outcome: TrackPassage['outcome']): void {
    const current = this.popover();
    if (current === null) {
      return;
    }
    this.passageChosen.emit({ zoneId: current.zone.id, outcome });
    this.closePopover();
  }

  private heatOf(zoneId: string): { win: number; loss: number } {
    return this.heat()[zoneId] ?? { win: 0, loss: 0 };
  }
}
