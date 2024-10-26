import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario.service';
import { Perfil } from '../../../../../apis/model/module/private/perfil';
import { Modulo } from '../../../../../apis/model/module/private/modulo';
import { ModuloRequest } from '../../../../../apis/model/module/private/request/modulo-request';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil.service';
import { Menu } from '../../../../../apis/model/module/private/menu';

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
export class FormPerfilModuloComponent implements OnInit {
  modulosAsignados: Menu[] = [];
  modulosNoAsignados: Menu[] = [];
  modulosAsignadosActual: Menu[] = [];
  modulosNoAsignadosActual: Menu[] = [];
  idPerfilEnviado: number = 0;
  vincularmodulos: ModuloRequest = new ModuloRequest();
  desvincularmodulos: ModuloRequest = new ModuloRequest();
  @Output() cerrarModal = new EventEmitter<void>();
  public idEmpresa: string = "";

  constructor(private cdr: ChangeDetectorRef,
    private perfilService: PerfilService,
    private messagesService: MessagesService) { }

  ngOnInit() {
  }

  cargarModelo(idPerfil: number) {
    this.idPerfilEnviado = idPerfil;
    this.cargarPerfiles(idPerfil);
    this.cdr.markForCheck();
  }

  cargarPerfiles(idPerfil: number): void {
    this.perfilService.getPerfilModulos(idPerfil).subscribe(response => {
      this.modulosAsignados = response.modulosxperfil as Menu[];
      this.modulosNoAsignados = response.modulos as Menu[];
    });
  }

  guardarListas() {
    let diferentesA;
    let diferentesB;

    this.perfilService.getPerfilModulos(this.idPerfilEnviado).subscribe(response => {
      this.modulosAsignadosActual = response.modulosxperfil as Menu[];
      diferentesA = this.modulosAsignados.filter(itemA => !this.modulosAsignadosActual.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: number[] = diferentesA.map(modulo => modulo.codigo);

        this.vincularmodulos.codigoPerfiles = [this.idPerfilEnviado];
        this.vincularmodulos.codigoModulos = idsAsignados;

        this.perfilService.vincularOpcion(this.vincularmodulos).subscribe();
      }

      this.modulosNoAsignadosActual = response.modulos as Menu[];
      diferentesB = this.modulosNoAsignados.filter(itemA => !this.modulosNoAsignadosActual.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: number[] = diferentesB.map(modulo => modulo.codigo);

        this.desvincularmodulos.codigoPerfiles = [this.idPerfilEnviado];

        this.desvincularmodulos.codigoModulos = idsNoAsignados;

        this.perfilService.desvincularOpcion(this.desvincularmodulos).subscribe();
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
