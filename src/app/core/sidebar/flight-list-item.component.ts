import { Component, input, output } from '@angular/core';
import { Flight } from '../flight.model';

@Component({
  selector: 'app-flight-list-item',
  standalone: true,
  template: `
    <div
      (click)="select.emit()"
      class="group p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col gap-1"
      [class]="isSelected() 
        ? 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/5' 
        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/80'"
    >
      <div class="flex justify-between items-center">
        <span class="font-bold text-sm" [class.text-sky-400]="isSelected()">{{ flight().flightNumber }}</span>
        <span
          class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
          [class]="{
            'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30': flight().status === 'Active',
            'bg-amber-500/15 text-amber-400 border border-amber-500/30': flight().status === 'Delayed',
            'bg-sky-500/15 text-sky-400 border border-sky-500/30': flight().status === 'Arrived',
          }"
        >
          {{ flight().status }}
        </span>
      </div>
      
      <div class="flex justify-between items-center text-xs text-slate-400 mt-1">
        <span class="font-mono">{{ flight().callsign }}</span>
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-slate-300 font-mono">{{ flight().origin }}</span>
          <span class="opacity-50 text-[10px]">➔</span>
          <span class="font-bold text-slate-300 font-mono">{{ flight().destination }}</span>
        </div>
      </div>
    </div>
  `
})
export class FlightListItemComponent {
  readonly flight = input.required<Flight>();
  readonly isSelected = input<boolean>(false);
  readonly select = output<void>();
}

