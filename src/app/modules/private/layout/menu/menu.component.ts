import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import {MenuItem, MessageService} from 'primeng/api';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { MenuService } from '../../../../service/modules/private/administrativo/menu.service';
import { MenuUsuario } from '../../../../apis/model/module/private/menu-usuario';
import { environment } from '../../../../../environments/environment';
import { Modulo } from '../../../../apis/model/module/private/modulo';
import { Menu } from '../../../../apis/model/module/private/menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    ...PRIME_NG_MODULES,
    RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MenuService],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  items: MenuItem[] = [];
  public nombreEmpresa?: string;
  listaModulos: Modulo[]= [];
  listaPadres: Menu[] = []
  listaOpciones: Menu[] = [];

  constructor(private readonly menuService: MenuService,
              private readonly messageService: MessageService,
              private readonly activatedRoute: ActivatedRoute) {
    if (sessionStorage.getItem(environment.session.NOMBRE_EMPRESA) != undefined) {
      this.nombreEmpresa = sessionStorage.getItem(environment.session.NOMBRE_EMPRESA)!;
    } else {
      this.nombreEmpresa = "Administrador";
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let user: string | null = sessionStorage.getItem(environment.session.USERNAME);
      let idEmpresa: string | null = sessionStorage.getItem(environment.session.ID_EMPRESA);

      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        if (sessionStorage.getItem(environment.session.MENU_ITEMS)) {
          const menuItemsString = sessionStorage.getItem(environment.session.MENU_ITEMS);
          if (menuItemsString) {
            this.items = JSON.parse(menuItemsString) as MenuItem[];
          }
        } else {
          this.menuService.getMenuUsuarios(user, idEmpresa).subscribe({
            next: resp => {
              this.items = this.cargarMenu(resp);
              sessionStorage.setItem(environment.session.MENU_ITEMS, JSON.stringify(this.items));
            },
            error: err => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.error?.message || 'No se pudo cargar el menú.'
              });
            }
          });
        }
      }
    });
  }

  cargarMenu(menuUsuario: MenuUsuario): MenuItem[] {
    this.listaModulos = menuUsuario.listModulo;
    this.listaPadres = menuUsuario.listOpcionPadres;
    this.listaOpciones = menuUsuario.listOpcionBase;

    return this.convertirModulosAMenuItems(this.listaModulos);

  }

  convertirModulosAMenuItems(modulos: Modulo[]): MenuItem[] {

    let menuItems = modulos.map(modulo => {
        return {
            key: modulo.codigo.toString(), // Asignar codigo a key como string
            label: modulo.nombreModulo,    // Asignar nombreModulo a label
            icon: modulo.icono,            // Asignar icono a icon
            items: this.convertirOpcionesPadreAMenuItems(this.listaPadres, modulo.codigo)
        };
    });

    return menuItems;
  }

  convertirOpcionesPadreAMenuItems(opcionesPadre: Menu[], codigoModulo: number): MenuItem[] {
    let menuItems = opcionesPadre
                      .filter(menu => menu.codigoModulo === codigoModulo)
                      .map(menu => {
                          return {
                              key: menu.codigo.toString(), // Asignar codigo a key como string
                              label: menu.descripcionOpcion,    // Asignar nombreModulo a label
                              icon: menu.icono,            // Asignar icono a icon
                              items: this.convertirOpcionesAMenuItems(this.listaOpciones, menu.codigo)
                          };
                        }
                      );

    return menuItems;
  }

  convertirOpcionesAMenuItems(opciones: Menu[], codigoPadre: number): MenuItem[] {
    let menuItems = opciones
                      .filter(menu => menu.opcionPadre === codigoPadre)
                      .map(menu => {
                          return {
                              key: menu.codigo.toString(), // Asignar codigo a key como string
                              label: menu.descripcionOpcion,    // Asignar nombreModulo a label
                              icon: menu.icono,            // Asignar icono a icon
                              route: menu.rutaOpcion
                          };
                        }
                      );

    return menuItems;
  }
}
