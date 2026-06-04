import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly textColorClass = input<string>('text-snow');
}
