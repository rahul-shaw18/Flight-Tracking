import { Component } from '@angular/core';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { MapComponent } from './core/map/map.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MapComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}

