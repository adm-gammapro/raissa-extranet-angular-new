import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, MenuItem, MessageService, ToastMessageOptions} from 'primeng/api';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Estado} from '../../../../apis/model/commons/estado';
import {CommonModule} from '@angular/common';
import {PRIME_NG_MODULES} from '../../../../config/primeNg/primeng-global-imports';
import {PaginatorComponent} from '../../commons/paginator/paginator.component';
import {HeaderComponent} from '../../layout/header/header.component';
import {FormPerfilModuloComponent} from './perfil-modulo/form-perfil-modulo.component';
import {Paginator} from '../../../../apis/model/commons/paginator';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PerfilService} from '../../../../service/modules/private/administrativo/perfil.service';
import {environment} from '../../../../../environments/environment';
import {Util} from '../../../../utils/util/util.util';
import {PerfilResponse} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import {EstadoRegistroEnum} from '../../../../apis/model/enums/estado-registro';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent,
    FormPerfilModuloComponent,
    RouterLink],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit, AfterViewInit {
  @ViewChild(FormPerfilModuloComponent) formPerfilModuloComponent!: FormPerfilModuloComponent;
  protected mostrarPerfilOpcion = false;
  protected perfiles: PerfilResponse[] = [];
  protected nombreSearch: string | undefined;
  protected estadoSearch: string | undefined;
  protected mostrarHijo = false;
  protected perfilSearchForm: FormGroup;
  protected estados: Estado[] = Estado.estados;
  private readonly idEmpresa: string = "";
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;
  private pendingToast: ToastMessageOptions | null = null;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly perfilService: PerfilService) {

    this.perfilSearchForm = this.formBuilder.group({
      nombreSearch: new FormControl(this.nombreSearch, [Validators.maxLength(50)]),
      estadoSearch: new FormControl('T'),
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  cambioPagina(event: any) {//este metodo se debe replicar en todas las tablas donde se quiera usar paginador
    if (event.primerRegistroVisualizado != undefined) {
      this.paginator.primerRegistroVisualizado = event.primerRegistroVisualizado;
    }
    if (event.cantidadRegistros != undefined) {
      this.paginator.cantidadRegistros = event.cantidadRegistros;
    }
    if (event.numeroPagina != undefined) {
      this.paginator.numeroPagina = event.numeroPagina;
    }

    this.busqueda();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.perfilSearchForm);
  }

  esBotonDeshabilitado(perfil: PerfilResponse): boolean {
    return Util.mapEstadoRegistro(perfil.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  eliminarFila(event: Event, perfilParam: PerfilResponse) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'danger',
        icon: 'pi pi-times',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Si',
        icon: 'pi pi-check',
        severity: 'info',
        outlined: true
      },
      accept: () => {
        this.perfilService.eliminar(perfilParam.codigo).subscribe({
          next: () => {
            this.perfiles = this.perfiles.filter(p => p.codigo !== perfilParam.codigo);

            // Ajusta total de registros
            this.paginator.totalRegistros = Math.max(0, (this.paginator.totalRegistros ?? 0) - 1);

            // Si la página quedó vacía y no es la primera, retrocede
            if (this.perfiles.length === 0 && this.paginator.numeroPagina > 0) {
              this.paginator.numeroPagina = this.paginator.numeroPagina - 1;
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Registro eliminado correctamente',
              life: 4000
            });

            this.loadPerfiles();
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
        this.messageService.add({
          severity: 'error',
          summary: 'Rechazado',
          detail: 'No se dió de baja al registro',
          life: 5000
        });
      }
    });
  }

  ngOnInit() {
    const toast = history.state?.toast as ToastMessageOptions | undefined;
    if (toast?.detail) {
      this.pendingToast = toast;
      this.router.navigate([], { replaceUrl: true });
    }

    this.activatedRoute.paramMap.subscribe(params => {
      const pagina = Util.parseOrDefault(params.get('pagina'), 0);
      const cantReg = Util.parseOrDefault(params.get('cantReg'), 5);
      const estado = Util.getEstado(params.get('estadoSearch'));
      const perfil = params.get('nombreSearch') ?? "";

      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.nombreSearch = perfil;

      this.loadPerfiles();

      this.estadoSearch = this.estadoSearch ? this.estadoSearch : "T";

      this.perfilSearchForm.patchValue({
        nombreSearch: this.nombreSearch,
        estadoSearch: this.estadoSearch
      });

      this.initializeBreadcrumbs();
    });
  }

  ngAfterViewInit() {
    if (this.pendingToast) {
      this.messageService.add(this.pendingToast);
      this.pendingToast = null;
      this.router.navigate([], { replaceUrl: true });
    }
  }

  busqueda() {
    this.nombreSearch = this.perfilSearchForm.controls['nombreSearch'].value;
    this.estadoSearch = this.perfilSearchForm.controls['estadoSearch'].value;
    if (this.nombreSearch === null) {
      this.nombreSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }

    this.router.navigate(['/perfil', this.paginator.numeroPagina, this.paginator.cantidadRegistros, this.nombreSearch, this.estadoSearch]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', {skipLocationChange: true}).then(() => {
      this.router.navigate(['/perfil']);
    });
  }

  mostrarModal(idPerfil: number): void {
    this.formPerfilModuloComponent.cargarModelo(idPerfil);
    this.mostrarHijo = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarHijo = false; // Cerrar el componente hijo
  }

  onGuardado() {
    this.mostrarPerfilOpcion = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Registro guardado satisfactoriamente.',
      life: 4000
    });
  }

  private loadPerfiles(): void {
    this.perfilService
      .getPerfilesPage(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.paginator.cantidadRegistros, Number(this.idEmpresa))
      .subscribe(response => {
        this.perfiles = response.content as PerfilResponse[];
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;
      });
  }

  private initializeBreadcrumbs(): void {
    this.items = [{ label: 'Perfiles' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
