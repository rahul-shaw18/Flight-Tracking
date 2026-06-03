import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Flight } from '../flight.model';

@Component({
  selector: 'app-flight-detail-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div
      class="bg-slate-900/80 border border-sky-500/25 p-4 rounded-xl space-y-3 shadow-lg shadow-sky-500/5 backdrop-blur-md animate-fade-in"
    >
      <div class="flex justify-between items-start">
        <div>
          <span class="text-lg font-black text-sky-400 block tracking-tight">{{ flight().flightNumber }}</span>
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Callsign: {{ flight().callsign }}</span>
        </div>
        <button
          (click)="clear.emit()"
          class="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-bold transition-colors cursor-pointer"
        >
          Clear ✕
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800/60 py-3">
        <div>
          <span class="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Aircraft Type</span>
          <span class="text-slate-200 font-semibold mt-0.5 block">{{ flight().aircraftType }}</span>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Current Status</span>
          <span
            class="font-bold mt-0.5 block"
            [class]="{
              'text-emerald-400': flight().status === 'Active',
              'text-amber-400': flight().status === 'Delayed',
              'text-sky-400': flight().status === 'Arrived',
            }"
            >{{ flight().status }}</span
          >
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Origin Port</span>
          <span class="text-slate-200 font-mono text-sm font-bold mt-0.5 block">{{ flight().origin }}</span>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Destination Port</span>
          <span class="text-slate-200 font-mono text-sm font-bold mt-0.5 block">{{ flight().destination }}</span>
        </div>
      </div>

      <div class="space-y-2 text-xs pt-1">
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Estimated Departure:</span>
          <span class="font-mono font-bold text-slate-200">{{ flight().estimatedDeparture | date: 'shortTime' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-400">Estimated Arrival:</span>
          <span class="font-mono font-bold text-slate-200">{{ flight().estimatedArrival | date: 'shortTime' }}</span>
        </div>
      </div>
    </div>
  `
})
export class FlightDetailCardComponent {
  readonly flight = input.required<Flight>();
  readonly clear = output<void>();
}

