import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly status = input<'total' | 'active' | 'delayed' | 'arrived'>('total');

  // Compute container border and background classes
  readonly borderClass = computed(() => {
    switch (this.status()) {
      case 'active':
        return 'border-emerald/30 dark:border-emerald/30 text-emerald bg-emerald/[0.04] dark:bg-emerald/[0.05] shadow-[0_0_12px_rgba(39,166,68,0.05)]';
      case 'delayed':
        return 'border-crimson/30 dark:border-crimson/30 text-crimson bg-crimson/[0.04] dark:bg-crimson/[0.05] shadow-[0_0_12px_rgba(235,87,87,0.05)]';
      case 'arrived':
        return 'border-cyan/30 dark:border-cyan/30 text-cyan bg-cyan/[0.04] dark:bg-cyan/[0.05] shadow-[0_0_12px_rgba(2,184,204,0.05)]';
      case 'total':
      default:
        return 'border-graphite/40 dark:border-graphite text-snow dark:text-snow bg-obsidian/[0.45]';
    }
  });

  // Compute label text classes
  readonly labelClass = computed(() => {
    switch (this.status()) {
      case 'active':
        return 'text-emerald/80 dark:text-emerald/75';
      case 'delayed':
        return 'text-crimson/80 dark:text-crimson/75';
      case 'arrived':
        return 'text-cyan/80 dark:text-cyan/75';
      case 'total':
      default:
        return 'text-slate dark:text-fog';
    }
  });
}
