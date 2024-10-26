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
        codigoEmpresa: new FormControl(0, [Validators.required]),
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

  }
}
