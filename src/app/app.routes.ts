import { Routes } from '@angular/router';
import { ContentComponent } from './modules/private/layout/content/content.component';
import { ContentWebComponent } from './modules/public/content-web/content-web.component';
import { AuthorizedComponent } from './config/authorized/authorized.component';
import { LogoutComponent } from './modules/private/layout/logout/logout.component';
import { SeleccionComponent } from './modules/private/administrativo/seleccion/seleccion.component';
import { UsuarioComponent } from './modules/private/administrativo/usuario/usuario.component';
import { FormUsuarioComponent } from './modules/private/administrativo/usuario/formulario-usuario/form-usuario.component';
import { PerfilComponent } from './modules/private/administrativo/perfil/perfil.component';
import { FormPerfilComponent } from './modules/private/administrativo/perfil/formulario-perfil/form-perfil.component';
import { AgrupacionComponent } from './modules/private/administrativo/agrupacion/agrupacion.component';
import { FormAgrupacionComponent } from './modules/private/administrativo/agrupacion/formulario-agrupacion/form-agrupacion.component';
import { ProveedorComponent } from './modules/private/administrativo/proveedor/proveedor.component';
import { FormProveedorComponent } from './modules/private/administrativo/proveedor/formulario-proveedor/form-proveedor.component';
import { CredencialesComponent } from './modules/private/administrativo/credenciales/credenciales.component';
import { FormCredencialesComponent } from './modules/private/administrativo/credenciales/formulario-credenciales/form-credenciales.component';
import { CuentasComponent } from './modules/private/administrativo/cuentas/cuentas.component';
import { FormCuentasComponent } from './modules/private/administrativo/cuentas/formulario-cuentas/form-cuentas.component';
import { ConfiguracionComponent } from './modules/private/operativo/configuracion/configuracion.component';
import { FormConfiguracionComponent } from './modules/private/operativo/configuracion/formulario-configuracion/form-configuracion.component';
import { SaldosComponent } from './modules/private/operativo/saldos/saldos.component';
import { SaldosBancoComponent } from './modules/private/operativo/saldos/saldos-banco/saldos-banco.component';
import { MovimientosComponent } from './modules/private/operativo/saldos/movimientos/movimientos.component';
import { TableUsuarioClienteComponent } from './modules/private/administrativo/usuario/usuario-empresa/table/table-usuario-cliente.component';
import { FormUsuarioClienteComponent } from './modules/private/administrativo/usuario/usuario-empresa/form/form-usuario-cliente.component';
import { MonitorComponent } from './modules/private/operativo/monitor/monitor.component';

export const routes: Routes = [
    /*{
        path: '**',
        redirectTo: 'content-web'
    },*/
    { path: '', component: ContentWebComponent },
    { path: 'content-web', component: ContentWebComponent },
    { path: 'content', component: ContentComponent },
    { path: 'authorized', component: AuthorizedComponent },
    { path: 'logout', component: LogoutComponent},
    { path: 'seleccion-empresa', component: SeleccionComponent},
    
    { path: 'usuario', component: UsuarioComponent },
    { path: 'form-usuario/:id', component: FormUsuarioComponent},
    { path: 'usuario/:pagina/:cantReg/:nombreSearch/:estadoSearch', component: UsuarioComponent },
    { path: 'usuario-empresa/:id', component: TableUsuarioClienteComponent },
    { path: 'form-usuario-cliente/:id', component: FormUsuarioClienteComponent },
    
    { path: 'perfil', component: PerfilComponent },
    { path: 'perfil/:pagina/:cantReg/:nombreSearch/:estadoSearch', component: PerfilComponent },
    { path: 'form-perfil/:id', component: FormPerfilComponent },

    { path: 'agrupacion', component: AgrupacionComponent },
    { path: 'agrupacion/:pagina/:cantReg/:estadoSearch/:nombreSearch', component: AgrupacionComponent },
    { path: 'form-agrupacion/:id', component: FormAgrupacionComponent },

    { path: 'proveedor', component: ProveedorComponent},
    { path: 'proveedor/:pagina/:estadoSearch/:nombreSearch/:cantReg', component: ProveedorComponent},
    { path: 'form-proveedor/:id', component: FormProveedorComponent},
    
    { path: 'credenciales', component: CredencialesComponent},
    { path: 'credenciales/:pagina/:estadoSearch/:nombreSearch/:proveedorSearch/:cantReg', component: CredencialesComponent},
    { path: 'form-credenciales/:id', component: FormCredencialesComponent},
    
    { path: 'cuentas', component: CuentasComponent},
    { path: 'cuentas/:pagina/:estadoRegistro/:numeroCuenta/:cantReg/:idBanco/:idAgrupacion', component: CuentasComponent},
    { path: 'form-cuentas/:id', component: FormCuentasComponent},
    
    { path: 'configuracion', component: ConfiguracionComponent},
    { path: 'form-configuracion/:id/:codigoServicioCliente', component: FormConfiguracionComponent},

    { path: 'saldos', component: SaldosComponent},
    { path: 'saldos-banco/:idBanco', component: SaldosBancoComponent},
    { path: 'movimientos/:idCuenta/:bitacora/:idBanco/:fechaInicial/:fechaFinal/:tipoMovimiento/:cantReg/:pagina', component: MovimientosComponent},

    { path: 'monitor', component: MonitorComponent},
];
