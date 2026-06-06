import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly status = input.required<'Active' | 'Delayed' | 'Arrived'>();
}
