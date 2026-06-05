import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {PickListModule} from 'primeng/picklist';
import {CommonModule} from '@angular/common';
import {
  PerfilAsignacion
} from '../../../../../../apis/model/module/private/administrativo/usuario/response/perfil-asignacion-response';
import {ConfirmationService, MessageService} from 'primeng/api';
import {
  UsuarioPerfilesTransfer
} from '../../../../../../apis/model/module/private/administrativo/usuario/response/usuario-perfiles-transfer-response';
import {
  TransferirPerfilesRequest
} from '../../../../../../apis/model/module/private/administrativo/usuario/request/transferir-perfiles-request';
import {UsuarioPerfilService} from '../../../../../../service/modules/private/administrativo/usuario-perfil.service';

@Component({
  selector: 'app-vincular-usuario-perfil',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    PickListModule,
    CommonModule,
  ],
  templateUrl: './vincular-usuario-perfil.component.html',
  styleUrl: './vincular-usuario-perfil.component.scss'
})
export class VincularUsuarioPerfilComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  sourcePerfiles: PerfilAsignacion[] = [];
  targetPerfiles: PerfilAsignacion[] = [];

  protected usuarioId!: number;
  protected usuarioNombre: string = '';
  protected isLoading: boolean = false;

  private originalSourceIds: Set<number> = new Set();
  private originalTargetIds: Set<number> = new Set();

  @Input() set UsuarioId(usuarioId: number | undefined) {
    if (!usuarioId) return;
    this.usuarioId = usuarioId;
  }

  constructor(
    private readonly usuarioPerfilService: UsuarioPerfilService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      if (this.usuarioId) {
        this.cargarPerfiles();
      }
    }

    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.limpiarDatos();
    }
  }

  get headerTitle(): string {
    return `Gestionar Perfiles - ${this.usuarioNombre}`;
  }

  protected cerrar() {
    this.visibleChange.emit(false);
  }

  protected aplicarCambios(event: Event) {
    const currentSourceIds = new Set(this.sourcePerfiles.map(p => p.id));
    const currentTargetIds = new Set(this.targetPerfiles.map(p => p.id));

    const perfilesIdsAsignar: number[] = [];
    currentTargetIds.forEach(id => {
      if (!this.originalTargetIds.has(id)) {
        perfilesIdsAsignar.push(id);
      }
    });

    const perfilesIdsDesasignar: number[] = [];
    currentSourceIds.forEach(id => {
      if (!this.originalSourceIds.has(id)) {
        perfilesIdsDesasignar.push(id);
      }
    });

    if (perfilesIdsAsignar.length === 0 && perfilesIdsDesasignar.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se detectaron cambios en la asignación de perfiles'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de ${perfilesIdsAsignar.length > 0 ? `asignar ${perfilesIdsAsignar.length} perfil(es)` : ''}${perfilesIdsDesasignar.length > 0 ? ` y desasignar ${perfilesIdsDesasignar.length} perfil(es)` : ''}?`,
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
        this.transferirPerfiles(perfilesIdsAsignar, perfilesIdsDesasignar);
      }
    });
  }

  private cargarPerfiles() {
    if (!this.usuarioId) return;

    this.isLoading = true;
    this.usuarioPerfilService.obtenerPerfilesParaTransferencia(this.usuarioId).subscribe({
      next: (response: UsuarioPerfilesTransfer) => {
        this.usuarioNombre = response.nombreCompleto;
        this.sourcePerfiles = [...response.perfilesDisponibles];
        this.targetPerfiles = [...response.perfilesAsignados];
        this.guardarEstadoOriginal();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar perfiles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los perfiles del usuario'
        });
        this.isLoading = false;
        this.cerrar();
      }
    });
  }

  private guardarEstadoOriginal() {
    this.originalSourceIds = new Set(this.sourcePerfiles.map(p => p.id));
    this.originalTargetIds = new Set(this.targetPerfiles.map(p => p.id));
  }

  private transferirPerfiles(perfilesIdsAsignar: number[], perfilesIdsDesasignar: number[]) {
    this.isLoading = true;

    const request: TransferirPerfilesRequest = {
      usuarioId: this.usuarioId,
      perfilesIdsAsignar: perfilesIdsAsignar,
      perfilesIdsDesasignar: perfilesIdsDesasignar
    };

    this.usuarioPerfilService.transferirPerfiles(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Perfiles actualizados correctamente'
        });
        this.isLoading = false;
        this.cerrar();
      },
      error: (error: any) => {
        console.error('Error al transferir perfiles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los perfiles'
        });
        this.isLoading = false;
      }
    });
  }

  private limpiarDatos() {
    this.sourcePerfiles = [];
    this.targetPerfiles = [];
    this.usuarioNombre = '';
    this.originalSourceIds.clear();
    this.originalTargetIds.clear();
  }
}
