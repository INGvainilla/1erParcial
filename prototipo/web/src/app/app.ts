import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ToastComponent } from './shared/toast/toast.component';
import { CarritoSidebarComponent } from './shared/components/carrito-sidebar/carrito-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent, CarritoSidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'FashionStore';
}
