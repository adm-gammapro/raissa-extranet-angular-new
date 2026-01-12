import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../../service/modules/private/administrativo/usuario.service';
import {PerfilResponse} from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import {forkJoin, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {
  UsuarioPerfilRequest
} from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-perfil-request';

@Component({
  selector: 'app-form-usuario-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService, MessageService],
  templateUrl: './form-usuario-perfil.component.html',
  styleUrl: './form-usuario-perfil.component.scss'
})
export class FormUsuarioPerfilComponent {
  protected perfilesAsignados: PerfilResponse[] = [];
  protected perfilesNoAsignados: PerfilResponse[] = [];
  protected idUsuarioEnviado: number = 0;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();
  protected idEmpresa: string = "";

  constructor(private readonly cdr: ChangeDetectorRef,
    private readonly usuarioService: UsuarioService) { }

  cargarModelo(idUsuario: number, idEmpresa: string) {
    this.idUsuarioEnviado = idUsuario;
    this.idEmpresa = idEmpresa;
    this.cargarPerfiles(idUsuario, idEmpresa);
    this.cdr.markForCheck();
  }

  cargarPerfiles(idUsuario: number, idEmpresa: string): void {
    this.usuarioService.getUsuarioPerfiles(idUsuario, idEmpresa).subscribe(response => {
      this.perfilesAsignados = response.perfilesAsignados;
      this.perfilesNoAsignados = response.perfilesNoAsignados;
    });
  }

  guardarListas() {
    let usuarioPerfilVincular: UsuarioPerfilRequest = new UsuarioPerfilRequest();
    let usuarioPerfilDesvincular: UsuarioPerfilRequest = new UsuarioPerfilRequest();

    let diferentesA;
    let diferentesB;

    let perfilesNoAsignados!: PerfilResponse[];
    let perfilesAsignados!: PerfilResponse[];

    this.usuarioService.getUsuarioPerfiles(this.idUsuarioEnviado, this.idEmpresa).subscribe(response => {
      perfilesAsignados = response.perfilesAsignados;
      diferentesA = this.perfilesAsignados.filter(itemA => !perfilesAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        usuarioPerfilVincular.codigoPerfil = diferentesA.map(perfil => perfil.codigo);
        usuarioPerfilVincular.codigoUsuario = [this.idUsuarioEnviado];

        this.usuarioService.vincularPerfil(usuarioPerfilVincular).subscribe();
      }

      perfilesNoAsignados = response.perfilesNoAsignados;
      diferentesB = this.perfilesNoAsignados.filter(itemA => !perfilesNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        usuarioPerfilDesvincular.codigoPerfil = diferentesB.map(perfil => perfil.codigo);
        usuarioPerfilDesvincular.codigoUsuario = [this.idUsuarioEnviado];

        this.usuarioService.desVincularPerfil(usuarioPerfilDesvincular).subscribe();
      }
    });

    this.guardado.emit();
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
