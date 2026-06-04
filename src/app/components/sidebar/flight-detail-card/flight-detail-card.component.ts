import { Component, input, output, inject } from '@angular/core';
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
