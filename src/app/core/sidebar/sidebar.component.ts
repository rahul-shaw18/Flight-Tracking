import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { FlightService } from '../flight.service';
import { KpiCardComponent } from './kpi-card.component';
import { FlightListItemComponent } from './flight-list-item.component';
import { FlightDetailCardComponent } from './flight-detail-card.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    ReactiveFormsModule,
    KpiCardComponent,
    FlightListItemComponent,
    FlightDetailCardComponent,
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

  // Modern, memory-leak-safe reactive signal representing form state
  private readonly filterValues = toSignal(
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(200),
      distinctUntilChanged()
    )
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
  }

  protected resetFilters(): void {
    this.filterForm.patchValue({
      searchTerm: '',
      statusFilter: 'All',
      originFilter: 'All',
      destinationFilter: 'All',
    });
  }
}


