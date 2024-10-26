import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario.service';
import { Perfil } from '../../../../../apis/model/module/private/perfil';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { PerfilRequest } from '../../../../../apis/model/module/private/request/perfil-request';

@Component({
  selector: 'app-form-usuario-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService, MessageService, UsuarioService],
  templateUrl: './form-usuario-perfil.component.html',
  styleUrl: './form-usuario-perfil.component.scss'
})
export class FormUsuarioPerfilComponent implements OnInit {
  perfilesAsignados: Perfil[] = [];
  perfilesNoAsignados: Perfil[] = [];
  perfilesAsignadosActual: Perfil[] = [];
  perfilesNoAsignadosActual: Perfil[] = [];
  idUsuarioEnviado: number = 0;
  vincularPerfiles: PerfilRequest = new PerfilRequest();
  desvincularPerfiles: PerfilRequest = new PerfilRequest();
  @Output() cerrarModal = new EventEmitter<void>();
  public idEmpresa: string = "";

  constructor(private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private messagesService: MessagesService) { }

  ngOnInit() {
  }

  cargarModelo(idUsuario: number, idEmpresa: string) {
    this.idUsuarioEnviado = idUsuario;
    this.idEmpresa = idEmpresa;
    this.cargarPerfiles(idUsuario, idEmpresa);
    this.cdr.markForCheck();
  }

  cargarPerfiles(idUsuario: number, idEmpresa: string): void {
    this.usuarioService.getUsuarioPerfiles(idUsuario, idEmpresa).subscribe(response => {
      this.perfilesAsignados = response.perfilesxusuario as Perfil[];
      this.perfilesNoAsignados = response.perfiles as Perfil[];
    });
  }

  guardarListas() {
    let diferentesA;
    let diferentesB;

    this.usuarioService.getUsuarioPerfiles(this.idUsuarioEnviado, this.idEmpresa).subscribe(response => {
      this.perfilesAsignadosActual = response.perfilesxusuario as Perfil[];
      diferentesA = this.perfilesAsignados.filter(itemA => !this.perfilesAsignadosActual.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: number[] = diferentesA.map(perfil => perfil.codigo);

        this.vincularPerfiles.codigoPerfiles = idsAsignados;
        this.vincularPerfiles.codigoUsuarios = [this.idUsuarioEnviado];

        this.usuarioService.vincularPerfil(this.vincularPerfiles).subscribe();
      }

      this.perfilesNoAsignadosActual = response.perfiles as Perfil[];
      diferentesB = this.perfilesNoAsignados.filter(itemA => !this.perfilesNoAsignadosActual.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: number[] = diferentesB.map(perfil => perfil.codigo);

        this.desvincularPerfiles.codigoPerfiles = idsNoAsignados;
        this.desvincularPerfiles.codigoUsuarios = [this.idUsuarioEnviado];

        this.usuarioService.desVincularPerfil(this.desvincularPerfiles).subscribe();
      }
    });

    const messages: Message[] = [
      { severity: 'success', summary: 'Confirmación', detail: `Se guardó existosamente`, life: 5000 }
    ];

    this.messagesService.setMessages(messages);

    this.cerrar();
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
