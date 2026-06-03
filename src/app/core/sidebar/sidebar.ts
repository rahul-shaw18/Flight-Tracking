import { Component, inject, OnInit } from '@angular/core';
import { FlightService } from '../services/flight-service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './sidebar.html'
})
export class Sidebar implements OnInit {
  flightService = inject(FlightService);
  kpis = this.flightService.kpis()
  fb = inject(FormBuilder);
  filterForm = this.fb.group({
    searchTerm: [''],
    statusFilter: ['All'],
  });

  handleReset(){
    this.filterForm.reset()
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe((formValues) => {
      this.flightService.searchTerm.set(formValues.searchTerm || '');

      this.flightService.statusFilter.set(formValues.statusFilter || 'All');
    });
  }
}
