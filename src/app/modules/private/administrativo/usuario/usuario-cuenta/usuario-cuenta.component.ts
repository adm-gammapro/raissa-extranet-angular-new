import {Component, OnInit, ViewChild} from '@angular/core';
import {EstadoRegistroLabelPipe} from '../../../../../apis/model/pipe/estado-registro-label.pipe';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../layout/header/header.component';
import {CommonModule} from '@angular/common';
import {PaginatorComponent} from '../../../commons/paginator/paginator.component';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {Estado} from '../../../../../apis/model/commons/estado';
import {Paginator} from '../../../../../apis/model/commons/paginator';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {UsuarioService} from '../../../../../service/modules/private/administrativo/usuario.service';
import {environment} from '../../../../../../environments/environment';
import {Usuario} from '../../../../../apis/model/module/private/usuario';
import {AddUsuarioCuentaComponent} from './add-usuario-cuenta/add-usuario-cuenta.component';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {
  UsuarioCuentaResponse
} from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-cuenta-response';
import {
  AgrupacionResponse
} from '../../../../../apis/model/module/private/operativo/agrupacion/response/agrupacion-response';
import {
  InstitucionFinancieraResponse
} from '../../../../../apis/model/module/private/commons/institucion-financiera-response';
import {AgrupacionService} from '../../../../../service/modules/private/operativo/agrupacion.service';
import {InstitucionFinancieraService} from '../../../../../service/commons/institucion-financiera.service';
import {Moneda} from '../../../../../apis/model/commons/moneda';

@Component({
  selector: 'app-usuario-cuenta',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent,
    EstadoRegistroLabelPipe, AddUsuarioCuentaComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuario-cuenta.component.html',
  styleUrl: './usuario-cuenta.component.scss'
})
export class UsuarioCuentaComponent implements OnInit {
  @ViewChild(AddUsuarioCuentaComponent) addCuentasform!: AddUsuarioCuentaComponent;
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;
  protected usuarioCuentas!: UsuarioCuentaResponse[];
  protected numeroCuentaSearch:string | undefined;
  protected agrupacionSearch:string | undefined;
  protected bancoSearch:string | undefined;
  protected monedaSearch:string | undefined;
  protected estadoSearch:string | undefined;
  protected mostrarHijo = false;
  public usuarioSearchForm: FormGroup;
  protected estados: Estado[] = Estado.estadosSimple;
  protected idEmpresa: string = "";
  protected idUsuario: string = "";
  protected visibleCuentas = new Set<number>();
  protected mostrarTodas = false;
  protected agrupaciones: AgrupacionResponse[] = [];
  protected bancos: InstitucionFinancieraResponse[] = [];
  protected monedas: Moneda[] = Moneda.monedas;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly usuarioService: UsuarioService,
              private readonly agrupacionService: AgrupacionService,
              private readonly institucionFinancieraService: InstitucionFinancieraService) {

    this.usuarioSearchForm = this.formBuilder.group({
      agrupacionSearch: [''],
      bancoSearch: [''],
      monedaSearch: [''],
      estadoSearch: new FormControl('T'),
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  cambioPagina(event: any) {//este metodo se debe replicar en todas las tablas donde se quiera usar paginador
    if (event.primerRegistroVisualizado!=undefined) {
      this.paginator.primerRegistroVisualizado = event.primerRegistroVisualizado;
    }
    if (event.cantidadRegistros!=undefined) {
      this.paginator.cantidadRegistros = event.cantidadRegistros;
    }
    if (event.numeroPagina!=undefined) {
      this.paginator.numeroPagina = event.numeroPagina;
    }

    this.busqueda();
  }

  eliminarFila(event: Event, param: UsuarioCuentaResponse) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        this.usuarioService.eliminarUsuarioCuenta(param.id).subscribe({
          next: () => {
            this.usuarioCuentas = this.usuarioCuentas.filter(p => p.id !== param.id);

            // Ajusta total de registros
            this.paginator.totalRegistros = Math.max(0, (this.paginator.totalRegistros ?? 0) - 1);

            // Si la página quedó vacía y no es la primera, retrocede
            if (this.usuarioCuentas.length === 0 && this.paginator.numeroPagina > 0) {
              this.paginator.numeroPagina = this.paginator.numeroPagina - 1;
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Registro eliminado correctamente',
              life: 4000
            });

            this.loadUsuarioCuentas();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
              life: 5000
            });
          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  esBotonDeshabilitado(usuario: Usuario): boolean {
    return usuario.estadoRegistro === "INACTIVO";
  }

  ngOnInit() {
    this.getAgrupaciones();
    this.getBancos();

    this.activatedRoute.paramMap.subscribe(params => {
      this.idUsuario = params.get('idUsuario') ?? "";

      this.estadoSearch = "S";
      this.loadUsuarioCuentas();

      this.usuarioSearchForm.patchValue({
        agrupacionSearch: this.agrupacionSearch,
        bancoSearch: this.bancoSearch,
        monedaSearch: this.monedaSearch,
        estadoSearch: this.estadoSearch
      });

      this.initializeBreadcrumbs();
    });
  }

  busqueda() {
    this.agrupacionSearch = this.usuarioSearchForm.controls['agrupacionSearch'].value;
    this.estadoSearch = this.usuarioSearchForm.controls['estadoSearch'].value;
    this.bancoSearch = this.usuarioSearchForm.controls['bancoSearch'].value;
    this.monedaSearch = this.usuarioSearchForm.controls['monedaSearch'].value;

    this.loadUsuarioCuentas();
  }

  reloadPage() {
    this.usuarioSearchForm.patchValue({
      agrupacionSearch: "",
      bancoSearch: "",
      monedaSearch: "",
      estadoSearch: "S"
    });

    this.busqueda();
  }

  mostrarModal(): void {
    this.addCuentasform.cargarModelo(Number(this.idUsuario), this.idEmpresa);
    this.mostrarHijo = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarHijo = false; // Cerrar el componente hijo
  }

  onGuardado() {
    this.mostrarHijo = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Registro guardado satisfactoriamente.',
      life: 4000
    });

    this.loadUsuarioCuentas();
  }

  esVisible(cuenta: any): boolean {
    return this.mostrarTodas || this.visibleCuentas.has(cuenta.id);
  }

  ocultarValor(valor: string): string {
    if (!valor) return '';
    if (valor.length <= 4) return valor;
    const visibles = valor.slice(-4);
    const ocultos = '*'.repeat(valor.length - 4);
    return ocultos + visibles;
  }

  toggleVisibilidad(cuenta: any): void {
    if (this.visibleCuentas.has(cuenta.id)) {
      this.visibleCuentas.delete(cuenta.id);
    } else {
      this.visibleCuentas.add(cuenta.id);
    }
  }

  toggleTodasVisibles(): void {
    this.mostrarTodas = !this.mostrarTodas;
    if (this.mostrarTodas) {
      this.visibleCuentas = new Set(this.usuarioCuentas.map(c => c.id)); // o cuentas de la página
    } else {
      this.visibleCuentas.clear();
    }
  }

  getAgrupaciones(): void {
    this.agrupacionService.getAllAgrupaciones(Number(this.idEmpresa)).subscribe(response => {
      this.agrupaciones = response;
    });
  }

  getBancos(): void {
    this.institucionFinancieraService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response;
    });
  }

  private loadUsuarioCuentas(): void {
    this.usuarioService
      .getUsuariosCuentaPage(this.paginator.numeroPagina,
                             this.estadoSearch,
                             this.agrupacionSearch,
                             this.bancoSearch,
                             this.monedaSearch,
                             Number(this.idEmpresa),
                             Number(this.idUsuario),
                             this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.usuarioCuentas = response.content as UsuarioCuentaResponse[];
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;
      });
  }

  private initializeBreadcrumbs(): void {
    this.items = [
      { label: 'Usuario', routerLink: '/usuario' },
      { label: 'usuario-cuenta' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
