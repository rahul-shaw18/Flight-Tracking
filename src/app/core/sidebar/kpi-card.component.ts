import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 shadow-md">
      <span class="text-[10px] uppercase font-bold tracking-wider block opacity-70" [class]="textColorClass()">{{ title() }}</span>
      <span class="text-2xl font-black mt-1 block tracking-tight" [class]="textColorClass()">{{ value() }}</span>
    </div>
  `
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly textColorClass = input<string>('text-slate-200');
}
