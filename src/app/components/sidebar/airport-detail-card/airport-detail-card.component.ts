import { Component, computed, inject, input, output } from '@angular/core';
import { FlightService } from '../../../core/services/flight.service';
import { Flight } from '../../../core/models/flight.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-airport-detail-card',
  imports: [DatePipe],
  templateUrl: './airport-detail-card.component.html',
})
export class AirportDetailCardComponent {
  private flightService = inject(FlightService);

  readonly airportCode = input.required<string>();
  readonly clear = output<void>();

  activeTab: 'departures' | 'arrivals' = 'departures';

  protected readonly details = computed(() =>
    this.flightService.airportDetails(this.airportCode()),
  );
  protected readonly departures = computed(() => this.flightService.departuresForAirport());
  protected readonly arrivals = computed(() => this.flightService.arrivalsForAirport());

  selectFlight(flight: Flight): void {
    this.flightService.selectFlight(flight);
  }
}
