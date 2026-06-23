import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {PickListModule} from 'primeng/picklist';
import {
  ClienteAsignacion
} from '../../../../../apis/model/module/private/administrativo/perfil/response/cliente-asignacion-response';
import {PerfilClienteService} from '../../../../../service/modules/private/administrativo/perfil-cliente.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {
  PerfilClientesTransfer
} from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-clientes-transfer-response';
import {
  TransferirClientesPerfilRequest
} from '../../../../../apis/model/module/private/administrativo/perfil/request/transferir-clientes-request';

@Component({
  selector: 'app-vincular-perfil-clientes',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    PickListModule,
    CommonModule,
  ],
  templateUrl: './vincular-perfil-clientes.html',
  styleUrl: './vincular-perfil-clientes.css',
})
export class VincularPerfilClientes implements OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  sourceClientes: ClienteAsignacion[] = [];
  targetClientes: ClienteAsignacion[] = [];

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
    private readonly perfilClienteService: PerfilClienteService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      if (this.perfilId) {
        this.cargarClientes();
      }
    }

    if (changes['visible'] && changes['visible'].currentValue === false) {
      this.limpiarDatos();
    }
  }

  get headerTitle(): string {
    return `Gestionar Clientes - ${this.perfilNombre}`;
  }

  protected cerrar() {
    this.visibleChange.emit(false);
  }

  protected aplicarCambios(event: Event) {
    const currentSourceIds = new Set(this.sourceClientes.map(c => c.id));
    const currentTargetIds = new Set(this.targetClientes.map(c => c.id));

    const clientesIdsAsignar: number[] = [];
    currentTargetIds.forEach(id => {
      if (!this.originalTargetIds.has(id)) {
        clientesIdsAsignar.push(id);
      }
    });

    const clientesIdsDesasignar: number[] = [];
    currentSourceIds.forEach(id => {
      if (!this.originalSourceIds.has(id)) {
        clientesIdsDesasignar.push(id);
      }
    });

    if (clientesIdsAsignar.length === 0 && clientesIdsDesasignar.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se detectaron cambios en la asignación de clientes'
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de ${clientesIdsAsignar.length > 0 ? `asignar ${clientesIdsAsignar.length} cliente(s)` : ''}${clientesIdsDesasignar.length > 0 ? ` y desasignar ${clientesIdsDesasignar.length} cliente(s)` : ''}?`,
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
        this.transferirClientes(clientesIdsAsignar, clientesIdsDesasignar);
      }
    });
  }

  private cargarClientes() {
    if (!this.perfilId) return;

    this.isLoading = true;
    this.perfilClienteService.obtenerClientesParaTransferencia(this.perfilId).subscribe({
      next: (response: PerfilClientesTransfer) => {
        this.perfilNombre = response.descripcion;
        this.sourceClientes = [...response.clientesDisponibles];
        this.targetClientes = [...response.clientesAsignados];
        this.guardarEstadoOriginal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes del perfil'
        });
        this.isLoading = false;
        this.cerrar();
      }
    });
  }

  private guardarEstadoOriginal() {
    this.originalSourceIds = new Set(this.sourceClientes.map(c => c.id));
    this.originalTargetIds = new Set(this.targetClientes.map(c => c.id));
  }

  private transferirClientes(clientesIdsAsignar: number[], clientesIdsDesasignar: number[]) {
    this.isLoading = true;

    const request: TransferirClientesPerfilRequest = {
      perfilId: this.perfilId,
      clientesIdsAsignar: clientesIdsAsignar,
      clientesIdsDesasignar: clientesIdsDesasignar
    };

    this.perfilClienteService.transferirClientes(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Clientes actualizados correctamente'
        });
        this.isLoading = false;
        this.cerrar();
      },
      error: (error) => {
        console.error('Error al transferir clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los clientes'
        });
        this.isLoading = false;
      }
    });
  }

  private limpiarDatos() {
    this.sourceClientes = [];
    this.targetClientes = [];
    this.perfilNombre = '';
    this.originalSourceIds.clear();
    this.originalTargetIds.clear();
  }
}
