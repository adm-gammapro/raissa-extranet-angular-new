import {Routes} from '@angular/router';
import {ContentComponent} from './modules/private/layout/content/content.component';
import {ContentWebComponent} from './modules/public/content-web/content-web.component';
import {AuthorizedComponent} from './config/authorized/authorized.component';
import {LogoutComponent} from './modules/private/layout/logout/logout.component';
import {UsuarioComponent} from './modules/private/administrativo/usuario/usuario.component';
import {FormUsuarioComponent} from './modules/private/administrativo/usuario/formulario-usuario/form-usuario.component';
import {PerfilComponent} from './modules/private/administrativo/perfil/perfil.component';
import {FormPerfilComponent} from './modules/private/administrativo/perfil/formulario-perfil/form-perfil.component';
import {AgrupacionComponent} from './modules/private/administrativo/agrupacion/agrupacion.component';
import {
  FormAgrupacionComponent
} from './modules/private/administrativo/agrupacion/formulario-agrupacion/form-agrupacion.component';
import {ProveedorComponent} from './modules/private/administrativo/proveedor/proveedor.component';
import {
  FormProveedorComponent
} from './modules/private/administrativo/proveedor/formulario-proveedor/form-proveedor.component';
import {CredencialesComponent} from './modules/private/administrativo/credenciales/credenciales.component';
import {
  FormCredencialesComponent
} from './modules/private/administrativo/credenciales/formulario-credenciales/form-credenciales.component';
import {CuentasComponent} from './modules/private/administrativo/cuentas/cuentas.component';
import {FormCuentasComponent} from './modules/private/administrativo/cuentas/formulario-cuentas/form-cuentas.component';
import {ConfiguracionComponent} from './modules/private/operativo/configuracion/configuracion.component';
import {
  FormConfiguracionComponent
} from './modules/private/operativo/configuracion/formulario-configuracion/form-configuracion.component';
import {SaldosComponent} from './modules/private/operativo/saldos/saldos.component';
import {SaldosBancoComponent} from './modules/private/operativo/saldos/saldos-banco/saldos-banco.component';
import {MovimientosComponent} from './modules/private/operativo/saldos/movimientos/movimientos.component';
import {MonitorComponent} from './modules/private/operativo/monitor/monitor.component';
import {DetalleMonitorComponent} from './modules/private/operativo/monitor/detalle-monitor/detalle-monitor.component';
import {UsuarioCuentaComponent} from './modules/private/administrativo/usuario/usuario-cuenta/usuario-cuenta.component';
import {LoginComponent} from './config/login/login.component';
import {AuthGuard} from './config/guard/auth.guard';
import {
  TarifarioDashboardComponent
} from './modules/private/administrativo/tarifario/tarifario-dashboard/tarifario-dashboard.component';

export const routes: Routes = [
  {path: '', redirectTo: 'content', pathMatch: 'full'},
  {path: 'content-web', component: ContentWebComponent, canActivate: [AuthGuard]},
  {path: 'content', component: ContentComponent, canActivate: [AuthGuard]},
  {path: 'authorized', component: AuthorizedComponent},
  {path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},

  {path: 'usuario', component: UsuarioComponent, canActivate: [AuthGuard]},
  {path: 'form-usuario/:id', component: FormUsuarioComponent, canActivate: [AuthGuard]},
  {path: 'usuario/:pagina/:cantReg/:nombreSearch/:estadoSearch', component: UsuarioComponent, canActivate: [AuthGuard]},
  {path: 'usuario-cuenta/:idUsuario', component: UsuarioCuentaComponent, canActivate: [AuthGuard]},

  {path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard]},
  {path: 'perfil/:pagina/:cantReg/:nombreSearch/:estadoSearch', component: PerfilComponent, canActivate: [AuthGuard]},
  {path: 'form-perfil/:id', component: FormPerfilComponent, canActivate: [AuthGuard]},

  {path: 'agrupacion', component: AgrupacionComponent, canActivate: [AuthGuard]},
  {
    path: 'agrupacion/:pagina/:cantReg/:estadoSearch/:nombreSearch',
    component: AgrupacionComponent,
    canActivate: [AuthGuard]
  },
  {path: 'form-agrupacion/:id', component: FormAgrupacionComponent, canActivate: [AuthGuard]},

  {path: 'proveedor', component: ProveedorComponent, canActivate: [AuthGuard]},
  {
    path: 'proveedor/:pagina/:estadoSearch/:nombreSearch/:cantReg',
    component: ProveedorComponent,
    canActivate: [AuthGuard]
  },
  {path: 'form-proveedor/:id', component: FormProveedorComponent, canActivate: [AuthGuard]},

  {path: 'credenciales', component: CredencialesComponent, canActivate: [AuthGuard]},
  {
    path: 'credenciales/:pagina/:estadoSearch/:nombreSearch/:proveedorSearch/:cantReg',
    component: CredencialesComponent,
    canActivate: [AuthGuard]
  },
  {path: 'form-credenciales/:id', component: FormCredencialesComponent, canActivate: [AuthGuard]},

  {path: 'cuentas', component: CuentasComponent, canActivate: [AuthGuard]},
  {
    path: 'cuentas/:pagina/:estadoRegistro/:numeroCuenta/:cantReg/:idBanco/:idAgrupacion',
    component: CuentasComponent,
    canActivate: [AuthGuard]
  },
  {path: 'form-cuentas/:id', component: FormCuentasComponent, canActivate: [AuthGuard]},

  {path: 'configuracion', component: ConfiguracionComponent},
  {
    path: 'form-configuracion/:id/:codigoServicioCliente',
    component: FormConfiguracionComponent,
    canActivate: [AuthGuard]
  },

  {path: 'saldos', component: SaldosComponent, canActivate: [AuthGuard]},
  {path: 'saldos-banco/:idBanco', component: SaldosBancoComponent, canActivate: [AuthGuard]},
  {
    path: 'movimientos/:idCuenta/:bitacora/:idBanco/:fechaInicial/:fechaFinal/:tipoMovimiento/:cantReg/:pagina',
    component: MovimientosComponent,
    canActivate: [AuthGuard]
  },

  {path: 'monitor', component: MonitorComponent, canActivate: [AuthGuard]},
  {path: 'monitor/:fechaInicio/:fechaFinal/:cantReg/:pagina', component: MonitorComponent, canActivate: [AuthGuard]},

  {path: 'detalle-monitor/:codigoBitacoraEjecucion', component: DetalleMonitorComponent, canActivate: [AuthGuard]},
  {
    path: 'detalle-monitor/:cantReg/:pagina/:codigoBitacoraEjecucion',
    component: DetalleMonitorComponent,
    canActivate: [AuthGuard]
  },

  {path: 'tarifario', component: TarifarioDashboardComponent, canActivate: [AuthGuard]},
];
