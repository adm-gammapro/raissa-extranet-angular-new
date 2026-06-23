import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {PickListModule} from 'primeng/picklist';
import {CommonModule} from '@angular/common';
import {
  OpcionAsignacion
} from '../../../../../apis/model/module/private/administrativo/perfil/response/opcion-asignacion-response';
import {PerfilOpcionService} from '../../../../../service/modules/private/administrativo/perfil-opcion.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {
  PerfilOpcionesTransfer
} from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-opciones-transfer-response';
import {
  TransferirOpcionesRequest
} from '../../../../../apis/model/module/private/administrativo/perfil/request/transferir-opciones-request';

@Component({
  selector: 'app-vincular-perfil-opciones',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    PickListModule,
    CommonModule,
  ],
  templateUrl: './vincular-perfil-opciones.html',
  styleUrl: './vincular-perfil-opciones.css',
})
export class VincularPerfilOpciones implements OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  sourceOpciones: OpcionAsignacion[] = [];
  targetOpciones: OpcionAsignacion[] = [];

  protected perfilId!: number;
  protected perfilNombre: string = '';
  protected isLoading: boolean = false;

  private originalSourceIds: Set<number> = new Set();
  private originalTargetIds: Set<number> = new Set();

  @Input() set PerfilId(perfilId: number | undefined) {
    if (!perfilId) return;
    this.perfilId = perfilId;
  }

  constructor(
    private readonly perfilOpcionService: PerfilOpcionService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      if (this.perfilId) {
        this.cargarOpciones();
      }
    }

    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.limpiarDatos();
    }
  }

  get headerTitle(): string {
    return `Gestionar Opciones de Menú - ${this.perfilNombre}`;
  }

  protected cerrar() {
    this.visibleChange.emit(false);
  }

  protected aplicarCambios(event: Event) {
    const currentSourceIds = new Set(this.sourceOpciones.map(o => o.id));
    const currentTargetIds = new Set(this.targetOpciones.map(o => o.id));

    const opcionesIdsAsignar: number[] = [];
    currentTargetIds.forEach(id => {
      if (!this.originalTargetIds.has(id)) {
        opcionesIdsAsignar.push(id);
      }
    });

    const opcionesIdsDesasignar: number[] = [];
    currentSourceIds.forEach(id => {
      if (!this.originalSourceIds.has(id)) {
        opcionesIdsDesasignar.push(id);
      }
    });

    if (opcionesIdsAsignar.length === 0 && opcionesIdsDesasignar.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se detectaron cambios en la asignación de opciones'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de ${opcionesIdsAsignar.length > 0 ? `asignar ${opcionesIdsAsignar.length} opción(es)` : ''}${opcionesIdsDesasignar.length > 0 ? ` y desasignar ${opcionesIdsDesasignar.length} opción(es)` : ''}?`,
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
        this.transferirOpciones(opcionesIdsAsignar, opcionesIdsDesasignar);
      }
    });
  }

  private cargarOpciones() {
    if (!this.perfilId) return;

    this.isLoading = true;
    this.perfilOpcionService.obtenerOpcionesParaTransferencia(this.perfilId).subscribe({
      next: (response: PerfilOpcionesTransfer) => {
        this.perfilNombre = response.descripcion;
        this.sourceOpciones = [...response.opcionesDisponibles];
        this.targetOpciones = [...response.opcionesAsignadas];
        this.guardarEstadoOriginal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar opciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las opciones del perfil'
        });
        this.isLoading = false;
        this.cerrar();
      }
    });
  }

  private guardarEstadoOriginal() {
    this.originalSourceIds = new Set(this.sourceOpciones.map(o => o.id));
    this.originalTargetIds = new Set(this.targetOpciones.map(o => o.id));
  }

  private transferirOpciones(opcionesIdsAsignar: number[], opcionesIdsDesasignar: number[]) {
    this.isLoading = true;

    const request: TransferirOpcionesRequest = {
      perfilId: this.perfilId,
      opcionesIdsAsignar: opcionesIdsAsignar,
      opcionesIdsDesasignar: opcionesIdsDesasignar
    };

    this.perfilOpcionService.transferirOpciones(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Opciones actualizadas correctamente'
        });
        this.isLoading = false;
        this.cerrar();
      },
      error: (error) => {
        console.error('Error al transferir opciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar las opciones'
        });
        this.isLoading = false;
      }
    });
  }

  private limpiarDatos() {
    this.sourceOpciones = [];
    this.targetOpciones = [];
    this.perfilNombre = '';
    this.originalSourceIds.clear();
    this.originalTargetIds.clear();
  }
}
