import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { FlightService } from '../../core/services/flight.service';
import { KpiCardComponent } from './kpi-card/kpi-card.component';
import { FlightListItemComponent } from './flight-list-item/flight-list-item.component';
import { FlightDetailCardComponent } from './flight-detail-card/flight-detail-card.component';
import { AirportDetailCardComponent } from './airport-detail-card/airport-detail-card.component';
import { ToggleSwitchComponent } from '../../shared/components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    ReactiveFormsModule,
    KpiCardComponent,
    FlightListItemComponent,
    FlightDetailCardComponent,
    AirportDetailCardComponent,
    ToggleSwitchComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  protected readonly flightService = inject(FlightService);
  protected readonly kpis = this.flightService.kpis;
  private readonly fb = inject(FormBuilder);

  protected readonly filterForm = this.fb.group({
    searchTerm: [''],
    statusFilter: ['All'],
    originFilter: ['All'],
    destinationFilter: ['All'],
  });

  protected get searchTermControl(): FormControl<string | null> {
    return this.filterForm.controls.searchTerm;
  }

  // Modern, memory-leak-safe reactive signal representing form state
  private readonly filterValues = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(200),
      distinctUntilChanged(),
    ),
  );

  constructor() {
    effect(() => {
      const values = this.filterValues();
      if (values) {
        this.flightService.searchTerm.set(values.searchTerm ?? '');
        this.flightService.statusFilter.set(values.statusFilter ?? 'All');
        this.flightService.originFilter.set(values.originFilter ?? 'All');
        this.flightService.destinationFilter.set(values.destinationFilter ?? 'All');
      }
    });

    effect(() => {
      if (this.flightService.resetTrigger() > 0) {
        this.resetFilters();
      }
    });
  }

  protected resetFilters(): void {
    this.filterForm.patchValue({
      searchTerm: '',
      statusFilter: 'All',
      originFilter: 'All',
      destinationFilter: 'All',
    });
  }

  protected toggleClouds(): void {
    this.flightService.showCloudOverlay.update((v) => !v);
  }

  protected toggleRain(): void {
    this.flightService.showRainOverlay.update((v) => !v);
  }

  protected toggleSun(): void {
    this.flightService.showSunOverlay.update((v) => !v);
  }
}
