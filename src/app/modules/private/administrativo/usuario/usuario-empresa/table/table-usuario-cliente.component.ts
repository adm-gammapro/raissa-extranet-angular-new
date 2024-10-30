import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { UsuarioService } from '../../../../../../service/modules/private/administrativo/usuario.service';
import { UsuarioCliente } from '../../../../../../apis/model/module/private/usuario-cliente';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../../environments/environment';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MenuComponent } from '../../../../layout/menu/menu.component';

@Component({
  selector: 'app-table-usuario-cliente',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES, 
    HeaderComponent,
    MenuComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService, MessageService, MessagesService, UsuarioService],
  templateUrl: './table-usuario-cliente.component.html',
  styleUrl: './table-usuario-cliente.component.scss'
})
export class TableUsuarioClienteComponent implements OnInit {
  messages: Message[] = [];
  empresasVinculadas: UsuarioCliente[] = [];
  idUsuarioSession!: string;
  idUsuario!: number;

  constructor(private confirmationService: ConfirmationService, 
              private activatedRoute: ActivatedRoute,
              private router: Router, 
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private messagesService: MessagesService,
              private usuarioService: UsuarioService) { 
    if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
      this.idUsuarioSession = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION)!;
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe (params => {
      this.idUsuario = Number(params.get('id'));
                      
      this.usuarioService.getUsuariosEmpresas(this.idUsuario, Number(this.idUsuarioSession)).subscribe(response => {
        this.empresasVinculadas = response;
      });
    })
  }

  eliminarFila(event: Event, usuarioCliente: UsuarioCliente) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
              this.usuarioService.desVincularEmpresa(usuarioCliente.codigo).subscribe(
                response => {
                  const messages: Message[] = [
                    { severity: 'success', summary: 'Confirmación', detail: 'Registro dado de baja', life: 5000 }
                  ];
                  this.messagesService.setMessages(messages);
                  this.reloadPage();
                }
              )
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/usuario-cliente']);
    });
  }

  esBotonDeshabilitado(cuentas: any): boolean {
    return cuentas.estadoRegistro === "INACTIVO";
  }
}
