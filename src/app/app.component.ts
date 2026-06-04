import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MapComponent } from './components/map/map.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MapComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}

