import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../../service/modules/private/administrativo/usuario.service';
import {PerfilService} from '../../../../../service/modules/private/administrativo/perfil.service';
import {forkJoin, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {OpcionResponse} from '../../../../../apis/model/module/private/administrativo/opcion/response/opcion-response';

@Component({
  selector: 'app-form-perfil-modulo',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService, MessageService, UsuarioService],
  templateUrl: './form-perfil-modulo.component.html',
  styleUrl: './form-perfil-modulo.component.scss'
})
export class FormPerfilModuloComponent {
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  protected opcionesNoAsignados!: OpcionResponse[];
  protected opcionesAsignados!: OpcionResponse[];
  protected idPerfilEnviado: number = 0;
  protected idEmpresa: string = "";

  constructor(private readonly cdr: ChangeDetectorRef,
              private readonly perfilService: PerfilService) {
  }

  cargarModelo(idPerfil: number) {
    this.idPerfilEnviado = idPerfil;
    this.cargarOpciones(idPerfil);
    this.cdr.markForCheck();
  }

  cargarOpciones(idPerfil: number): void {
    this.perfilService.getPerfilModulos(idPerfil).subscribe(response => {
      this.opcionesAsignados = response.opcionesVinculados;
      this.opcionesNoAsignados = response.opcionesNoVinculados;
    });
  }

  guardarListas() {
    this.perfilService.getPerfilModulos(this.idPerfilEnviado).pipe(
      switchMap(res => {
        const antesAsignados = res.opcionesVinculados ?? [];
        const antesNoAsignados = res.opcionesNoVinculados ?? [];
        const ahoraAsignados = this.opcionesAsignados ?? [];
        const ahoraNoAsignados = this.opcionesNoAsignados ?? [];

        const aVincular = ahoraAsignados
          .filter(a => !antesAsignados.some((b: { codigo: number; }) => b.codigo === a.codigo))
          .map(o => o.codigo);

        const aDesvincular = ahoraNoAsignados
          .filter(a => !antesNoAsignados.some((b: { codigo: number; }) => b.codigo === a.codigo))
          .map(o => o.codigo);

        const calls = [];
        if (aVincular.length) {
          calls.push(this.perfilService.vincularOpcion({
            codigoPerfil: [this.idPerfilEnviado],
            codigoOpcion: aVincular,
          }));
        }
        if (aDesvincular.length) {
          calls.push(this.perfilService.desvincularOpcion({
            codigoPerfil: [this.idPerfilEnviado],
            codigoOpcion: aDesvincular,
          }));
        }
        return calls.length ? forkJoin(calls) : of(null);
      })
    ).subscribe({
      next: () => {
        this.guardado.emit();
        this.cerrar();
      },
      error: err => {
        console.log(err);
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
