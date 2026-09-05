import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .nav-active { color: #fff !important; font-weight: 600; border-bottom: 2px solid #3b82f6; padding-bottom: 2px; }
  `],
  template: `
    <nav *ngIf="auth.isAuthenticated()" style="background: #1e293b; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <span style="font-weight: bold;">Enterprise Management</span>
        <a routerLink="/products" routerLinkActive="nav-active" style="color: #cbd5e1; text-decoration: none;">Productos</a>
        <a routerLink="/categories" routerLinkActive="nav-active" style="color: #cbd5e1; text-decoration: none;">Categorías</a>
        <a routerLink="/suppliers" routerLinkActive="nav-active" style="color: #cbd5e1; text-decoration: none;">Proveedores</a>
        <a routerLink="/clients" routerLinkActive="nav-active" style="color: #cbd5e1; text-decoration: none;">Clientes</a>
        <a routerLink="/invoices" routerLinkActive="nav-active" style="color: #cbd5e1; text-decoration: none;">Facturas</a>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span>{{ auth.currentUser()?.name }} (<strong>{{ auth.role() }}</strong>)</span>
        <button (click)="auth.logout()" class="btn" style="background: #ef4444; color: white;">Logout</button>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}