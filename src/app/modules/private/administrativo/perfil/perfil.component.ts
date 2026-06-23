import {Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild} from '@angular/core';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Estado} from '../../../../apis/model/commons/estado';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from '../../layout/header/header.component';
import {PerfilService} from '../../../../service/modules/private/administrativo/perfil.service';
import {environment} from '../../../../../environments/environment';
import {Util} from '../../../../utils/util/util.util';
import {PerfilResponse} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import {Table, TableLazyLoadEvent, TableModule} from 'primeng/table';
import {PerfilSearch} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-search';
import {
  PerfilSearchResponse
} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-search-response';
import {BreadcrumbComponent} from '../../commons/breadcrumb/breadcrumb.component';
import {Button} from 'primeng/button';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {IftaLabel} from 'primeng/iftalabel';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {Toast} from 'primeng/toast';
import {Tooltip} from 'primeng/tooltip';
import {Card} from 'primeng/card';
import {EstadoRegistroLabelPipe} from '../../../../apis/model/pipe/estado-registro-label.pipe';
import {FormPerfilComponent} from './formulario-perfil/form-perfil.component';
import {VincularPerfilClientes} from './vincular-perfil-clientes/vincular-perfil-clientes';
import {VincularPerfilOpciones} from './vincular-perfil-opciones/vincular-perfil-opciones';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    Button,
    ConfirmDialog,
    IftaLabel,
    InputText,
    ReactiveFormsModule,
    Select,
    TableModule,
    Toast,
    Tooltip,
    Card,
    EstadoRegistroLabelPipe,
    FormPerfilComponent,
    HeaderComponent,
    VincularPerfilClientes,
    VincularPerfilOpciones,
  ],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  protected idEmpresa!: string;
  protected perfiles!: PerfilResponse[];
  protected filtroForm: FormGroup;
  protected loading: boolean = false;
  protected totalRecords: number = 0;
  protected registrosMostrados = 0;
  protected estados: Estado[] = Estado.estados;
  visibleForm: boolean = false;
  modoUso: 'editar' | 'registrar' = 'registrar';
  selectedPerfil!: PerfilResponse | null;
  @ViewChild('dt') dt!: Table;
  protected actualizacionManual: boolean = false;
  protected modalClientesVisible = false;
  protected perfilSeleccionadoId = 1;

  protected modalOpcionesVisible = false;
  protected perfilSeleccionadoOpcionId = 1;

  protected misItems: MenuItem[] = [
    { icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Perfiles' }
  ];

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService
  ) {
    const idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA);
    if (idEmpresa) {
      this.idEmpresa = idEmpresa;
    }

    this.filtroForm = this.fb.group({
      descripcion: [''],
      abreviatura: [''],
      estadoRegistro: ['S']
    });
  }

  filtrar() {
    this.actualizacionManual = true;
    this.loading = true;
    this.dt.reset();
    this.dt.rows = 5;

    setTimeout(() => {
      const fakeLazyEvent: TableLazyLoadEvent = {
        first: 0,
        rows: 5,
        sortField: 'descripcion',
        sortOrder: 1
      };
      this.actualizacionManual = false;
      this.loadLazy(fakeLazyEvent);
    }, 100);
  }

  loadLazy(event: TableLazyLoadEvent) {
    if (this.actualizacionManual) return;

    const firstValue = event.first ?? 0;
    const rowsValue = event.rows ?? 5;
    const { estadoRegistro, descripcion, abreviatura } = this.filtroForm.value;

    const request: PerfilSearch = {
      page: Math.floor(firstValue / (rowsValue || 1)),
      size: rowsValue,
      sortField: event.sortField as string,
      sortOrder: Util.mapSortOrder(event.sortOrder),
      descripcion: descripcion || undefined,
      abreviatura: abreviatura || undefined,
      estadoRegistro: estadoRegistro || undefined,
      codigoCliente: this.idEmpresa ? Number(this.idEmpresa) : undefined
    };

    this.perfilService.listarPerfilesPage(request).subscribe({
      next: (response: PerfilSearchResponse) => {
        this.perfiles = response.list;
        this.registrosMostrados = response.list.length;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      descripcion: '',
      abreviatura: '',
      estadoRegistro: 'S'
    });
    this.filtrar();
  }

  protected nuevo() {
    this.selectedPerfil = null;
    this.modoUso = 'registrar';
    this.visibleForm = true;
  }

  protected editar(codigo: number) {
    this.perfilService.obtenerPerfil(codigo).subscribe({
      next: (response: PerfilResponse) => {
        this.selectedPerfil = response;
        this.modoUso = 'editar';
        this.visibleForm = true;
      },
      error: (error) => this.handleError(error)
    });
  }

  protected guardar() {
    this.filtrar();
  }

  protected delete(event: Event, codigo: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de dar de baja este perfil?',
      header: 'Eliminar Perfil',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'success'
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger'
      },
      accept: () => {
        this.perfilService.eliminarPerfil(codigo).subscribe({
          next: (response: PerfilResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmación',
              detail: `Se dio de baja el perfil ${response.descripcion} correctamente`
            });
            this.filtrar();
          },
          error: (error) => this.handleError(error)
        });
      }
    });
  }

  protected abrirModalClientes(idPerfil: number) {
    this.perfilSeleccionadoId = idPerfil;
    this.modalClientesVisible = true;
  }

  protected abrirModalOpciones(idPerfil: number) {
    this.perfilSeleccionadoOpcionId = idPerfil;
    this.modalOpcionesVisible = true;
  }

  private handleError(error: any): void {
    if (error.status === 502) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error en el servicio'
      });
    } else if (error.status === 503) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Servicio no disponible'
      });
    }
  }
}
