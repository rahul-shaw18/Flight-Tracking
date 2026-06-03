import { Component, signal } from '@angular/core';
import { Sidebar } from './core/sidebar/sidebar';
import { Map } from './core/map/map';

@Component({
  selector: 'app-root',
  imports: [ Sidebar, Map],
  templateUrl: './app.html'
})
export class App {}
