import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
})
export class ToggleSwitchComponent {
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly checked = input<boolean>(false);
  readonly checkedChange = output<boolean>();

  protected toggle(): void {
    this.checkedChange.emit(!this.checked());
  }
}
