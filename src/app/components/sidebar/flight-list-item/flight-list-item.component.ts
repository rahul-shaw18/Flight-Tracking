import { Component, input, output } from '@angular/core';
import { Flight } from '../../../core/models/flight.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-flight-list-item',
  imports: [StatusBadgeComponent],
  templateUrl: './flight-list-item.component.html',
})
export class FlightListItemComponent {
  readonly flight = input.required<Flight>();
  readonly isSelected = input<boolean>(false);
  readonly select = output<void>();
}
