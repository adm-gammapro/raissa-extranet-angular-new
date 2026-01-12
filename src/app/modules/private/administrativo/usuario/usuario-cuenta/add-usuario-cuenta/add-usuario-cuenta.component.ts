import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {PRIME_NG_MODULES} from '../../../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../../../service/modules/private/administrativo/usuario.service';
import {
  UsuarioCuentaDisponibleResponse
} from '../../../../../../apis/model/module/private/administrativo/usuario/response/usuario-cuenta-disponible-response';
import {CuentaResponse} from '../../../../../../apis/model/module/private/operativo/cuenta/response/cuenta-response';

interface CuentaItem {
  id: number;
  numeroCuenta: string;
  moneda: string;
  banco: string;
  raw: CuentaResponse;
}

interface Grupo {
  grupoId: number;
  grupoNombre: string | number;
  items: CuentaItem[];
}

@Component({
  selector: 'app-add-usuario-cuenta',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  providers: [ConfirmationService, MessageService],
  templateUrl: './add-usuario-cuenta.component.html',
  styleUrl: './add-usuario-cuenta.component.scss'
})
export class AddUsuarioCuentaComponent {
  protected idUsuarioEnviado: number = 0;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();
  protected idEmpresa: string = "";
  protected cuentasDisponibles: UsuarioCuentaDisponibleResponse[] = [];

  protected expandedRows: { [key: string]: boolean } = {};
  protected selection: CuentaItem[] = [];
  protected selectedIds: number[] = [];

  protected mostrarTodas = false;
  protected visibleCuentas = new Set<number>();

  grupos: Grupo[] = [];

  cols = [
    { field: 'numeroCuenta', header: 'Número de cuenta' },
    { field: 'moneda', header: 'Moneda' },
    { field: 'banco', header: 'Institución financiera' }
  ];

  constructor(private readonly usuarioService: UsuarioService,
              private readonly messageService: MessageService) { }

  public cargarModelo(idUsuario: number, idEmpresa: string) {
    this.idUsuarioEnviado = idUsuario;
    this.idEmpresa = idEmpresa;
    this.cargarCuentas(idUsuario, idEmpresa);
  }

  protected cargarCuentas(idUsuario: number, idEmpresa: string): void {
    this.usuarioService
      .getUsuarioCuentasDisponibles(idUsuario, Number(idEmpresa))
      .subscribe(response => {
        this.cuentasDisponibles = response ?? [];
        this.grupos = this.buildGrupos(this.cuentasDisponibles);
        this.collapseAll();
        this.selection = [];
        this.selectedIds = [];
        this.mostrarTodas = false;
        this.visibleCuentas.clear();
      });
  }

  protected esVisible(row: CuentaItem): boolean {
    return this.mostrarTodas || this.visibleCuentas.has(row.id);
  }

  protected ocultarValor(valor: string): string {
    if (!valor) return '';
    if (valor.length <= 4) return valor;
    const visibles = valor.slice(-4);
    const ocultos = '*'.repeat(valor.length - 4);
    return ocultos + visibles;
  }

  protected toggleVisibilidad(row: CuentaItem): void {
    if (this.visibleCuentas.has(row.id)) {
      this.visibleCuentas.delete(row.id);
    } else {
      this.visibleCuentas.add(row.id);
    }
  }

  protected toggleTodasVisibles(): void {
    this.mostrarTodas = !this.mostrarTodas;
    if (this.mostrarTodas) {
      this.visibleCuentas = new Set(this.allItems().map(c => c.id)); // todas las de los grupos cargados
    } else {
      this.visibleCuentas.clear();
    }
  }

  protected onSelectionChange(sel: CuentaItem[]) {
    this.selection = sel;
    this.selectedIds = sel.map(i => i.id);
  }

  protected rowsByGroup(grupoId: number) {
    const g = this.grupos.find(x => x.grupoId === grupoId);
    return g ? g.items : [];
  }

  protected isGroupAllSelected(grupoId: number): boolean {
    const rows = this.rowsByGroup(grupoId);
    return rows.length > 0 && rows.every(r => this.selection.some(s => s.id === r.id));
  }

  protected isGroupPartialSelected(grupoId: number): boolean {
    const rows = this.rowsByGroup(grupoId);
    const selectedCount = rows.filter(r => this.selection.some(s => s.id === r.id)).length;
    return selectedCount > 0 && selectedCount < rows.length;
  }

  protected toggleGroupSelection(grupoId: number) {
    const rows = this.rowsByGroup(grupoId);
    if (this.isGroupAllSelected(grupoId)) {
      this.selection = this.selection.filter(s => !rows.some(r => r.id === s.id));
    } else {
      const currentIds = new Set(this.selection.map(s => s.id));
      const toAdd = rows.filter(r => !currentIds.has(r.id));
      this.selection = [...this.selection, ...toAdd];
    }
    this.onSelectionChange(this.selection);
  }

  protected expandAll() {
    this.expandedRows = this.grupos.reduce((acc, g) => ({ ...acc, [g.grupoNombre]: true }), {});
  }

  protected collapseAll() {
    this.expandedRows = {};
  }

  protected guardarListas() {
    if (!this.selectedIds.length) {
      this.messageService.add({ severity: 'warn', summary: 'Sin selección', detail: 'Seleccione al menos una cuenta.' });
      return;
    }
    this.usuarioService.registrarVinculoUsuariocuenta(
        Number(this.idEmpresa),
        this.idUsuarioEnviado,
        this.selectedIds
      )
      .subscribe({
        next: (rechazados) => {
          if (rechazados?.length) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Algunas cuentas no se vincularon',
              detail: `Rechazadas: ${rechazados.length}`
            });
          }
          this.guardado.emit();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
        }
      });
  }

  protected cerrar(): void {
    this.cerrarModal.emit();
  }

  private buildGrupos(data: UsuarioCuentaDisponibleResponse[]): Grupo[] {
    const map = new Map<number, Grupo>();
    for (const d of data) {
      const gid = d.idAgrupacion;
      const gname = d.nombreAgrupacion;
      if (!map.has(gid)) {
        map.set(gid, { grupoId: gid, grupoNombre: gname, items: [] });
      }
      map.get(gid)!.items.push({
        id: d.cuenta.codigo,
        numeroCuenta: d.cuenta.numeroCuenta,
        moneda: d.cuenta.descripcionMonedaCuenta || d.cuenta.monedaCuenta,
        banco: d.cuenta.nombreInstitucionFinanciera,
        raw: d.cuenta
      });
    }
    return Array.from(map.values());
  }

  private allItems(): CuentaItem[] {
    return this.grupos.flatMap(g => g.items);
  }
}
