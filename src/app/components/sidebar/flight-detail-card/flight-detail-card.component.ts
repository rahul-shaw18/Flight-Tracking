import { Component, input, output, inject, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Flight } from '../../../core/models/flight.model';
import { FlightService } from '../../../core/services/flight.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-flight-detail-card',
  imports: [DatePipe, DecimalPipe, StatusBadgeComponent],
  templateUrl: './flight-detail-card.component.html',
})
export class FlightDetailCardComponent {
  readonly flight = input.required<Flight>();
  readonly clear = output<void>();

  protected readonly flightService = inject(FlightService);

  // Compute status pill color schemes
  readonly statusColor = computed(() => {
    switch (this.flight().status) {
      case 'Active':
        return 'text-emerald bg-emerald/10 border-emerald/20';
      case 'Delayed':
        return 'text-crimson bg-crimson/10 border-crimson/20';
      case 'Arrived':
        return 'text-cyan bg-cyan/10 border-cyan/20';
      default:
        return 'text-fog bg-steel/20 border-graphite';
    }
  });

  // Compute text accent colors
  readonly statusTextClass = computed(() => {
    switch (this.flight().status) {
      case 'Active':
        return 'text-emerald';
      case 'Delayed':
        return 'text-crimson';
      case 'Arrived':
        return 'text-cyan';
      default:
        return 'text-indigo';
    }
  });

  // Compute progress bar colors
  readonly progressColorClass = computed(() => {
    switch (this.flight().status) {
      case 'Active':
        return 'bg-emerald';
      case 'Delayed':
        return 'bg-crimson';
      case 'Arrived':
        return 'bg-cyan';
      default:
        return 'bg-indigo';
    }
  });

  // Compute card section background and borders
  readonly sectionClass = computed(() => {
    switch (this.flight().status) {
      case 'Active':
        return 'bg-emerald/[0.015] dark:bg-emerald/[0.025] border-emerald/10 dark:border-emerald/20';
      case 'Delayed':
        return 'bg-crimson/[0.015] dark:bg-crimson/[0.025] border-crimson/10 dark:border-crimson/20';
      case 'Arrived':
        return 'bg-cyan/[0.015] dark:bg-cyan/[0.025] border-cyan/10 dark:border-cyan/20';
      default:
        return 'bg-obsidian/30 border-graphite/20';
    }
  });

  protected togglePlayback(): void {
    if (this.flightService.isAnimating()) {
      this.flightService.stopPlayback();
    } else {
      this.flightService.startPlayback();
    }
  }

  protected resetPlayback(): void {
    this.flightService.stopPlayback();
    this.flightService.setPlaybackProgress(0);
  }

  protected onSpeedChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.flightService.animationSpeed.set(value);
  }

  protected onProgressChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.flightService.setPlaybackProgress(value);
  }
}
