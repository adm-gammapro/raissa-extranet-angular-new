import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from "../../layout/header/header.component";
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../service/modules/private/administrativo/usuario.service';
import {Paginator} from '../../../../apis/model/commons/paginator';
import {Util} from '../../../../utils/util/util.util';
import {Estado} from '../../../../apis/model/commons/estado';
import {environment} from '../../../../../environments/environment';
import {FormUsuarioPerfilComponent} from './usuario-perfil/form-usuario-perfil.component';
import {UsuarioResponse} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {EstadoRegistroLabelPipe} from '../../../../apis/model/pipe/estado-registro-label.pipe';
import {
  VincularUsuarioClienteComponent
} from './usuario-empresa/vincular-usuario-cliente/vincular-usuario-cliente.component';
import {
  VincularUsuarioPerfilComponent
} from './usuario-perfil/vincular-usuario-perfil/vincular-usuario-perfil.component';
import {FormUsuarioComponent} from './formulario-usuario/form-usuario.component';
import {Button} from 'primeng/button';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {IftaLabel} from 'primeng/iftalabel';
import {BreadcrumbComponent} from '../../commons/breadcrumb/breadcrumb.component';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {Table, TableLazyLoadEvent, TableModule} from 'primeng/table';
import {Toast} from 'primeng/toast';
import {Tooltip} from 'primeng/tooltip';
import {Card} from 'primeng/card';
import {TipoUsuarioLabelPipe} from '../../../../utils/pipes/tipo-usuario-label.pipe';
import {ClaseUsuarioLabelPipe} from '../../../../utils/pipes/clase-usuario-label.pipe';
import {
  UsuarioSearchResponse
} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-search-response';
import {UsuarioSearch} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-search';
import {
  VincularUsuarioSistemasComponent
} from './usuario-sistema/vincular-usuario-sistemas/vincular-usuario-sistemas.component';
import {RouterLink} from '@angular/router';
import {ListarConfiguracionesUsuario} from './listar-configuraciones-usuario/listar-configuraciones-usuario';

@Component({
  selector: 'app-usuario',
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
    TipoUsuarioLabelPipe,
    ClaseUsuarioLabelPipe,
    VincularUsuarioClienteComponent, VincularUsuarioPerfilComponent, FormUsuarioComponent, HeaderComponent, VincularUsuarioSistemasComponent, RouterLink, ListarConfiguracionesUsuario
  ],
providers: [ConfirmationService, MessageService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  protected actualizacionManual: boolean = false;
  protected loading: boolean = false;
  protected totalRecords: number = 0;
  protected registrosMostrados = 0;
  @ViewChild(FormUsuarioPerfilComponent) formUsuarioPerfilComponent!: FormUsuarioPerfilComponent;
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;
  protected usuarios!: UsuarioResponse[];
  protected estadoSearch:string | undefined;
  protected filtroForm: FormGroup;
  protected estados: Estado[] = Estado.estados;
  protected idEmpresa: string = "";
  public passwordReset!: string;

  protected modalSistemasVisible = false;
  protected usuarioSeleccionadoId = 1;

  protected modalClientesVisible = false;
  protected usuarioSeleccionadoClienteId = 1;

  protected modalPerfilesVisible = false;
  protected usuarioSeleccionadoPerfilId = 1;
  modoUso: 'editar' | 'registrar' = 'registrar';

  visibleForm: boolean = false;
  selectedUsuario!: UsuarioResponse | null;

  protected modalConfiguracionesVisible = false;
  protected usuarioSeleccionadoConfigId = 1;
  protected usuarioSeleccionadoConfigNombre = '';

  protected misItems: MenuItem[] = [
    { icon: 'pi pi-home', route: '/content' },
    { label: 'Usuarios' }
  ];

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService
  ) {
    const idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA);
    if (idEmpresa) {
      this.idEmpresa = idEmpresa;
    }

    this.filtroForm = this.fb.group({
      nombreUsuario: [''],
      estadoRegistro: ['S'],
      idEmpresa: [this.idEmpresa ? Number(this.idEmpresa) : null]
    });
  }

  ngOnInit(): void {
    this.filtrar();
  }

  filtrar() {
    this.actualizacionManual = true;
    this.loading = true;
    if (this.dt) {
      this.dt.reset();
      this.dt.rows = 5;
    }

    setTimeout(() => {
      const fakeLazyEvent: TableLazyLoadEvent = {
        first: 0,
        rows: 5,
        sortField: 'apePaterno',
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
    const { estadoRegistro, nombreUsuario, idEmpresa } = this.filtroForm.value;

    const request: UsuarioSearch = {
      page: Math.floor(firstValue / (rowsValue || 1)),
      size: rowsValue,
      sortField: event.sortField as string,
      sortOrder: Util.mapSortOrder(event.sortOrder),
      estadoRegistro: estadoRegistro || undefined,
      nombreUsuario: nombreUsuario || undefined,
      idEmpresa: idEmpresa || undefined
    };

    // Usando el método con el mismo patrón que listarReglaPage
    this.usuarioService.listarUsuariosPage(request).subscribe({
      next: (response: UsuarioSearchResponse) => {
        this.usuarios = response.list;
        this.registrosMostrados = response.list.length;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
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
    });
  }

  protected guardar() {
    this.filtrar();
  }

  protected editar(codigo: number) {
    // Usando el método con el mismo patrón que getRegla
    this.usuarioService.obtenerUsuario(codigo).subscribe({
      next: (response: UsuarioResponse) => {
        this.selectedUsuario = response;
        this.modoUso = 'editar';
        this.visibleForm = true;
      },
      error: (error) => {
        if (error.status === 502) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error en el servicio de usuarios'
          });
        } else if (error.status === 503) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Servicio de usuarios no disponible'
          });
        }
      }
    });
  }

  protected delete(event: Event, codigo: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de dar de baja este usuario?',
      header: 'Eliminar Usuario',
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
        this.usuarioService.eliminarUsuario(codigo).subscribe({
          next: (response: UsuarioResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmación',
              detail: `Se dio de baja el usuario ${response.username} correctamente`
            });
            this.filtrar();
          },
          error: (error) => {
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
        });
      }
    });
  }

  esBotonDeshabilitado(usuario: UsuarioResponse): boolean {
    return false;
    //return usuario.estadoRegistro === "INACTIVO";
  }

  protected nuevo() {
    this.selectedUsuario = null;
    this.modoUso = 'registrar';
    this.visibleForm = true;
  }

  /*async resetPassword () {
    if (this.passwordReset) {
      this.usuarioService.cambiarPassword(this.idUsuarioReset,this.passwordReset).subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Password actualizado', life: 5000 });
        this.reloadPage();
      }
    )}
  }*/

  limpiarFiltros() {
    this.filtroForm.reset({
      nombreUsuario: '',
      estadoRegistro: 'S',
      idEmpresa: this.idEmpresa ? Number(this.idEmpresa) : null
    });
    this.filtrar();
  }

  protected abrirModalSistemas(idUsuario: number) {
    this.usuarioSeleccionadoId = idUsuario;
    this.modalSistemasVisible = true;
  }

  protected abrirModalClientes(idUsuario: number) {
    this.usuarioSeleccionadoClienteId = idUsuario;
    this.modalClientesVisible = true;
  }

  protected abrirModalPerfiles(idUsuario: number) {
    this.usuarioSeleccionadoPerfilId = idUsuario;
    this.modalPerfilesVisible = true;
  }

  protected abrirModalConfiguraciones(idUsuario: number, nombreUsuario: string) {
    this.usuarioSeleccionadoConfigId = idUsuario;
    this.usuarioSeleccionadoConfigNombre = nombreUsuario;
    this.modalConfiguracionesVisible = true;
  }
}
