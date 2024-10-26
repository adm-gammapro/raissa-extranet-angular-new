import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TokenService } from '../../../../service/authorization/token.service';
import { environment } from '../../../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule,
            ReactiveFormsModule,
            CommonModule,
            ...PRIME_NG_MODULES, 
            MenuComponent],
  providers: [ConfirmationService, MessageService, TokenService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  sidebarVisible: boolean = false;
  usuario: String|null = "";
  items: MenuItem[] | undefined;

  constructor(private tokenService: TokenService) {
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      this.usuario = sessionStorage.getItem(environment.session.NOMBRES_USUARIO);
    }
  }

  ngOnInit() {
    this.items = [
        {
          label: 'Perfil',
          icon: 'pi pi-user'
        },
        {
          label: 'Seleccionar empresa',
          icon: 'pi pi-sync',
          routerLink: ['/seleccion-empresa']
        },
        { separator: true },
        {
          label: 'Cerrar sesión',
          icon: 'pi pi-power-off',
          command: () => {
            this.onLogout();
          }
        }
    ];
  }

  onLogout(): void {
    this.tokenService.clear();
    location.href = environment.security.logout_url;
  }
}
