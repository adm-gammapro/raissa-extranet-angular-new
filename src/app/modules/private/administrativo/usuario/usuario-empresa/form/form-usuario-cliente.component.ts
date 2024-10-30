import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { MessagesService } from '../../../../../../service/commons/messages.service';
import { UsuarioService } from '../../../../../../service/modules/private/administrativo/usuario.service';
import { UsuarioCliente } from '../../../../../../apis/model/module/private/usuario-cliente';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../../environments/environment';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MenuComponent } from '../../../../layout/menu/menu.component';
import { EmpresaService } from '../../../../../../service/modules/private/administrativo/empresa.service';
import { PerfilService } from '../../../../../../service/modules/private/administrativo/perfil.service';
import { Empresa } from '../../../../../../apis/model/module/private/empresa';
import { Perfil } from '../../../../../../apis/model/module/private/perfil';
import { Util } from '../../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-usuario-cliente',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES, 
    HeaderComponent,
    MenuComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ConfirmationService, MessageService, MessagesService, UsuarioService, PerfilService, EmpresaService],
  templateUrl: './form-usuario-cliente.component.html',
  styleUrl: './form-usuario-cliente.component.scss'
})
export class FormUsuarioClienteComponent implements OnInit {
  public empresas: Empresa[] = [];
  public perfiles: Perfil[] = [];
  messages: Message[] = [];
  public usuarioClienteForm: FormGroup;
  idUsuarioSession: string = "";
  idUsuario!: number;
  usuarioCliente!: UsuarioCliente;

  constructor(private confirmationService: ConfirmationService, 
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private messagesService: MessagesService,
    private perfilService: PerfilService,
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService) {

      this.usuarioClienteForm = this.formBuilder.group({
        codigoCliente: new FormControl(0, [Validators.required]),
        codigoPerfil: new FormControl(0, [Validators.required]),
        codigo: new FormControl(0)
      });

      if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
        this.idUsuarioSession = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION)!;
      }
  }

  getPerfiles(idEmpresa: number): void {
    this.perfilService.getPerfilesEmpresa(Number(idEmpresa)).subscribe(response => {
      this.perfiles = response;
    });
  }

  getEmpresas(): void {
    this.empresaService.getempresasXUsuario(Number(this.idUsuarioSession)).subscribe(response => {
      this.empresas = response;
    });
  }

  ngOnInit() {
    this.getEmpresas();
    this.activatedRoute.paramMap.subscribe (params => {
      this.idUsuario = Number(params.get('id'));

      this.usuarioClienteForm.patchValue({
        codigo: null,
        codigoCliente: null,
        codigoPerfil: null
      });
    })
  }

  onPerfilesChange(event: any) {
    const codigoEmpresaSeleccionado = event.value;

    this.getPerfiles(Number(codigoEmpresaSeleccionado));
  }    

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.usuarioClienteForm);
  }

  guardar() {
    if (this.usuarioClienteForm.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de guardar este registro?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
        rejectLabel: 'No',
        accept: () => {

        this.usuarioCliente = this.usuarioClienteForm.value;
        this.usuarioCliente.codigoUsuario = this.idUsuario;

        this.usuarioService.vincularEmpresaPerfil(this.usuarioCliente).subscribe({
          next:(response) => {
            const messages: Message[] = [
              { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro existosamente`, life: 5000 }
            ];
            this.messagesService.setMessages(messages);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
          },
          complete: () => {
            this.router.navigate(['/usuario-empresa',this.idUsuario])
          }
        });  
      },reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se guardó registro', life: 5000 });
      }
    });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Se deben ingresar los campos obligatorios y en el formato requerido.', 
        life: 5000
      });
      this.usuarioClienteForm.markAllAsTouched();
    } 
  }
}
