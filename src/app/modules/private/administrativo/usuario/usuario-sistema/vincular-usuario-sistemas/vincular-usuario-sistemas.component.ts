import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {PickListModule} from 'primeng/picklist';
import {CommonModule} from '@angular/common';
import {
  SistemaAsignacion
} from '../../../../../../apis/model/module/private/administrativo/usuario/response/sistema-asignacion-response';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuarioSistemaService} from '../../../../../../service/modules/private/administrativo/usuario-sistema.service';
import {
  UsuarioSistemasTransfer
} from '../../../../../../apis/model/module/private/administrativo/usuario/response/usuario-sistemas-transfer-response';
import {
  TransferirSistemasRequest
} from '../../../../../../apis/model/module/private/administrativo/usuario/request/transferir-sistemas-request';

@Component({
  selector: 'app-vincular-usuario-sistemas',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    PickListModule,
    CommonModule,
  ],
  templateUrl: './vincular-usuario-sistemas.component.html',
  styleUrl: './vincular-usuario-sistemas.component.scss'
})
export class VincularUsuarioSistemasComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // Datos para el picklist
  sourceSistemas: SistemaAsignacion[] = [];   // Sistemas disponibles (izquierda)
  targetSistemas: SistemaAsignacion[] = [];   // Sistemas asignados (derecha)

  // Estado del usuario seleccionado
  protected usuarioId!: number;
  protected usuarioNombre: string = '';

  // Loading states
  protected isLoading: boolean = false;

  // Sistemas originales para detectar cambios
  private originalSourceIds: Set<string> = new Set();
  private originalTargetIds: Set<string> = new Set();

  @Input() set UsuarioId(usuarioId: number | undefined) {
    if (!usuarioId) return;
    this.usuarioId = usuarioId;
    this.cargarSistemas();
  }

  constructor(
    private readonly usuarioSistemaService: UsuarioSistemaService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  get headerTitle(): string {
    return `Gestionar Sistemas - ${this.usuarioNombre}`;
  }

  protected cerrar() {
    this.visibleChange.emit(false);
    this.limpiarDatos();
  }

  protected aplicarCambios(event: Event) {
    // Obtener IDs actuales
    const currentSourceIds = new Set(this.sourceSistemas.map(s => s.id));
    const currentTargetIds = new Set(this.targetSistemas.map(s => s.id));

    // Sistemas a asignar: están en target ahora pero no estaban antes
    const sistemasIdsAsignar: string[] = [];
    currentTargetIds.forEach(id => {
      if (!this.originalTargetIds.has(id)) {
        sistemasIdsAsignar.push(id);
      }
    });

    // Sistemas a desasignar: están en source ahora pero no estaban antes
    const sistemasIdsDesasignar: string[] = [];
    currentSourceIds.forEach(id => {
      if (!this.originalSourceIds.has(id)) {
        sistemasIdsDesasignar.push(id);
      }
    });

    // Si no hay cambios, no hacer nada
    if (sistemasIdsAsignar.length === 0 && sistemasIdsDesasignar.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se detectaron cambios en la asignación de sistemas'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de ${sistemasIdsAsignar.length > 0 ? `asignar ${sistemasIdsAsignar.length} sistema(s)` : ''}${sistemasIdsDesasignar.length > 0 ? ` y desasignar ${sistemasIdsDesasignar.length} sistema(s)` : ''}?`,
      header: 'Confirmar cambios',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'danger'
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'success'
      },
      accept: () => {
        this.transferirSistemas(sistemasIdsAsignar, sistemasIdsDesasignar);
      }
    });
  }

  private cargarSistemas() {
    if (!this.usuarioId) return;

    this.isLoading = true;
    this.usuarioSistemaService.obtenerSistemasParaTransferencia(this.usuarioId).subscribe({
      next: (response: UsuarioSistemasTransfer) => {
        this.usuarioNombre = response.nombreCompleto;

        // Separar disponibles y asignados
        this.sourceSistemas = response.sistemasDisponibles;
        this.targetSistemas = response.sistemasAsignados;

        // Guardar estado original para comparar
        this.guardarEstadoOriginal();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar sistemas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los sistemas del usuario'
        });
        this.isLoading = false;
        this.cerrar();
      }
    });
  }

  private guardarEstadoOriginal() {
    this.originalSourceIds = new Set(this.sourceSistemas.map(s => s.id));
    this.originalTargetIds = new Set(this.targetSistemas.map(s => s.id));
  }

  private transferirSistemas(sistemasIdsAsignar: string[], sistemasIdsDesasignar: string[]) {
    this.isLoading = true;

    const request: TransferirSistemasRequest = {
      usuarioId: this.usuarioId,
      sistemasIdsAsignar: sistemasIdsAsignar,
      sistemasIdsDesasignar: sistemasIdsDesasignar
    };

    this.usuarioSistemaService.transferirSistemas(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sistemas actualizados correctamente'
        });
        this.isLoading = false;
        // Recargar datos para actualizar estado original
        this.cargarSistemas();
      },
      error: (error) => {
        console.error('Error al transferir sistemas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los sistemas'
        });
        this.isLoading = false;
      }
    });
  }

  private limpiarDatos() {
    this.sourceSistemas = [];
    this.targetSistemas = [];
    this.usuarioId = 0;
    this.usuarioNombre = '';
    this.originalSourceIds.clear();
    this.originalTargetIds.clear();
  }
}
