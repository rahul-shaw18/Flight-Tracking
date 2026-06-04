import { Component, input, output, computed } from '@angular/core';
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

  // Compute card container styling classes
  readonly cardClass = computed(() => {
    const isSel = this.isSelected();
    const status = this.flight().status;

    if (isSel) {
      return 'border-acid-lime bg-steel/30 dark:bg-steel/20 shadow-[0_0_12px_rgba(228,242,34,0.15)]';
    }

    switch (status) {
      case 'Active':
        return 'border-emerald/20 dark:border-emerald/30 bg-emerald/[0.015] dark:bg-emerald/[0.03] hover:border-emerald/45';
      case 'Delayed':
        return 'border-crimson/20 dark:border-crimson/30 bg-crimson/[0.015] dark:bg-crimson/[0.03] hover:border-crimson/45';
      case 'Arrived':
        return 'border-cyan/20 dark:border-cyan/30 bg-cyan/[0.015] dark:bg-cyan/[0.03] hover:border-cyan/45';
      default:
        return 'border-graphite bg-obsidian/45 hover:border-iron';
    }
  });

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
}
