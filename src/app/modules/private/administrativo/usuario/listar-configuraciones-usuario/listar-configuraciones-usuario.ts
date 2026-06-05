import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Select} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {
  ClienteOpcion, ConfiguracionUsuario, PerfilOpcion, SistemaOpcion
} from '../../../../../apis/model/module/private/administrativo/usuario/response/configuracion-usuario-response';
import {Tooltip} from 'primeng/tooltip';
import {
  ConfiguracionUsuarioService
} from '../../../../../service/modules/private/administrativo/configuracion-usuario.service';
import {
  ConfiguracionUsuarioRequest
} from '../../../../../apis/model/module/private/administrativo/usuario/request/configuracion-request';

@Component({
  selector: 'app-listar-configuraciones-usuario',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    CommonModule,
    Select,
    TableModule,
    Toast,
    ConfirmDialog,
    Tooltip
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './listar-configuraciones-usuario.html',
  styleUrl: './listar-configuraciones-usuario.css',
})
export class ListarConfiguracionesUsuario implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() usuarioId!: number;
  @Input() usuarioNombre: string = '';

  // Diálogo de configuración
  showFormDialog: boolean = false;
  configForm: FormGroup;
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;

  // Datos para los combos
  clientes: ClienteOpcion[] = [];
  sistemas: SistemaOpcion[] = [];
  perfiles: PerfilOpcion[] = [];

  // Configuraciones existentes
  configuraciones: ConfiguracionUsuario[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly configuracionService: ConfiguracionUsuarioService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {
    this.configForm = this.fb.group({
      clienteId: [null, Validators.required],
      sistemaId: [null, Validators.required],
      perfilId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.setupFormListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      if (this.usuarioId) {
        this.cargarOpciones();
        this.cargarConfiguraciones();
      }
    }
  }

  private setupFormListeners(): void {
    // Los perfiles ya vienen precargados desde el backend con los del usuario
    // No necesitamos lógica adicional de cascada
  }

  get headerTitle(): string {
    return `Configuraciones - ${this.usuarioNombre}`;
  }

  get formDialogTitle(): string {
    return this.isEditing ? 'Editar Configuración' : 'Nueva Configuración';
  }

  private cargarOpciones(): void {
    this.isLoading = true;
    this.configuracionService.obtenerOpcionesConfiguracion(this.usuarioId).subscribe({
      next: (response) => {
        this.clientes = response.clientes;
        this.sistemas = response.sistemas;
        this.perfiles = response.perfiles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar opciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las opciones de configuración'
        });
        this.isLoading = false;
      }
    });
  }

  private cargarConfiguraciones(): void {
    this.isLoading = true;
    this.configuracionService.listarConfiguracionesPorUsuario(this.usuarioId).subscribe({
      next: (configuraciones) => {
        this.configuraciones = configuraciones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar configuraciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las configuraciones'
        });
        this.isLoading = false;
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.isEditing = false;
    this.editingId = null;
    this.configForm.reset({
      clienteId: null,
      sistemaId: null,
      perfilId: null
    });
    this.showFormDialog = true;
  }

  abrirFormularioEditar(config: ConfiguracionUsuario): void {
    this.isEditing = true;
    this.editingId = config.idConfiguracion;
    this.configForm.reset({
      clienteId: config.clienteId,
      sistemaId: config.sistemaId,
      perfilId: config.perfilId
    });
    this.showFormDialog = true;
  }

  guardarConfiguracion(): void {
    if (this.configForm.invalid) {
      Object.keys(this.configForm.controls).forEach(key => {
        this.configForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.isSaving = true;
    const formValue = this.configForm.value;

    const request: ConfiguracionUsuarioRequest = {
      usuarioId: this.usuarioId,
      clienteId: formValue.clienteId,
      sistemaId: formValue.sistemaId,
      perfilId: formValue.perfilId
    };

    if (this.isEditing && this.editingId) {
      request.idConfiguracion = this.editingId;
    }

    this.configuracionService.guardarConfiguracion(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditing ? 'Configuración actualizada correctamente' : 'Configuración guardada correctamente'
        });
        this.showFormDialog = false;
        this.cargarConfiguraciones();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo guardar la configuración'
        });
        this.isSaving = false;
      }
    });
  }

  eliminarConfiguracion(event: Event, config: ConfiguracionUsuario): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de eliminar la configuración para el cliente "${config.clienteRazonSocial}"?`,
      header: 'Eliminar Configuración',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'danger'
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'success'
      },
      accept: () => {
        this.configuracionService.eliminarConfiguracion(config.idConfiguracion).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Configuración eliminada correctamente'
            });
            this.cargarConfiguraciones();
          },
          error: (error) => {
            console.error('Error al eliminar configuración:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la configuración'
            });
          }
        });
      }
    });
  }

  cerrarModal(): void {
    this.visibleChange.emit(false);
  }

  cerrarFormulario(): void {
    this.showFormDialog = false;
    this.isEditing = false;
    this.editingId = null;
    this.configForm.reset();
  }
}
