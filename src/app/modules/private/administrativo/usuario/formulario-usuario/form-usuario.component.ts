import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HeaderComponent} from '../../../layout/header/header.component';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../../service/modules/private/administrativo/usuario.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MessagesService} from '../../../../../service/commons/messages.service';
import {Util} from '../../../../../utils/util/util.util';
import {TipoDocService} from '../../../../../service/commons/tipo-doc.service';
import {TipoDocumento} from '../../../../../apis/model/commons/tipo-documento';
import {environment} from '../../../../../../environments/environment';
import {UsuarioRequest} from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import {
  UsuarioResponse
} from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {ValidationUtil} from '../../../../../service/commons/validation-util';

interface Expiracion {
  name: string;
  code: string;
}

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    RouterLink,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, UsuarioService,TipoDocService],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.scss'
})
export class FormUsuarioComponent implements OnInit {
  protected usuarioRequest: UsuarioRequest = new UsuarioRequest();
  protected usuarioResponse: UsuarioResponse = new UsuarioResponse();
  protected usuarioForm: FormGroup;
  protected tipoDocs: TipoDocumento[] = [];
  private readonly idEmpresa: string = "";
  protected expiracion: Expiracion[] | undefined;
  protected submitted = false;
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;

  tipoUsuarioOpts = [
    { label: 'Administrador',      value: 'A' },
    { label: 'Estándar',           value: 'U' },
  ];

  claseUsuarioOpts = [
    { label: 'Supervisor', value: 'S' },
    { label: 'Operativo',  value: 'O' },
  ];

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly usuarioService: UsuarioService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly tipoDocService: TipoDocService) {

    this.usuarioForm = this.formBuilder.group({
      id: [null],
      username: [''],
      password: [null],
      nombres: ['', [Validators.required, Validators.maxLength(70)]],
      correo: ['', [Validators.required, Validators.maxLength(250), Validators.email]],
      telefono: ['', [Validators.required, Validators.maxLength(20), Util.phoneValidator()]],
      codigoTipoDocumento: ['', [Validators.required]],
      apePaterno: ['', [Validators.required, Validators.maxLength(50)]],
      apeMaterno: ['', [Validators.required, Validators.maxLength(50)]],
      indicadorExpiracion: ['', [Validators.required]],
      fechaCambioClave: [null],
      numeroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
      fechaExpiracionClave: [null],
      tipoUsuario: ['', [Validators.required]],
      claseUsuario: ['', [Validators.required]]
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  guardar() {
      if (this.usuarioForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si',
          rejectLabel: 'No',
          accept: () => {

              this.usuarioRequest = this.usuarioForm.value;
              this.convertirFecha();

              this.usuarioService.registrar(this.usuarioRequest, Number(this.idEmpresa)).subscribe({
                next:(response) => {
                  this.messagesService.setMessages(`Se guardó registro ${response.numeroDocumento} existosamente.`);
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
                },
                complete: () => {
                  this.router.navigate(['/usuario'])
                }
             })
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
        this.usuarioForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarTipoDocumento();
    this.cargarIndicadorExpiracion();

    this.activatedRoute.paramMap.subscribe (params => {
      let id: number;

      id = Number(params.get('id'));

      if(id!=null && id > 0){
        this.usuarioService.getUsuario(id).subscribe(response => {

          this.usuarioResponse = response;

          this.usuarioForm.patchValue({
            id: this.usuarioResponse.id,
            username: this.usuarioResponse.username,
            password: this.usuarioResponse.password,
            nombres: this.usuarioResponse.nombres,
            correo: this.usuarioResponse.correo,
            telefono: this.usuarioResponse.telefono,
            codigoTipoDocumento: this.usuarioResponse.codigoTipoDocumento,
            apePaterno: this.usuarioResponse.apePaterno,
            apeMaterno: this.usuarioResponse.apeMaterno,
            indicadorExpiracion: this.usuarioResponse.indicadorExpiracion,

            fechaCambioClave: this.usuarioResponse.fechaCambioClave,
            numeroDocumento: this.usuarioResponse.numeroDocumento,
            fechaExpiracionClave: this.usuarioResponse.fechaExpiracionClave,
            tipoUsuario: this.usuarioResponse.tipoUsuario,
          });

          this.aplicarReglasTipoUsuario();

          this.usuarioForm.patchValue({
            claseUsuario: this.usuarioResponse.claseUsuario
          });

          if (this.usuarioResponse.fechaCambioClave != "") {
            this.usuarioForm.patchValue({
              fechaCambioClave: Util.stringToDate(this.usuarioResponse.fechaCambioClave, 'dd/mm/yyyy', '/')
            });
          }

          if (this.usuarioResponse.fechaExpiracionClave != "") {
            this.usuarioForm.patchValue({
              fechaExpiracionClave: Util.stringToDate(this.usuarioResponse.fechaExpiracionClave, 'dd/mm/yyyy', '/')
            });
          }
        });
      }
    });

    this.initializeBreadcrumbs();

    this.suscribirseTipoUsuario();
  }

  public cargarTipoDocumento(): void {
    this.tipoDocService.getAllTipoDocumentos()
        .subscribe(response => {
            this.tipoDocs = response;
        });
  }

  public cargarIndicadorExpiracion(): void {
    this.expiracion = [
      { name: 'Activo', code: 'S' },
      { name: 'Inactivo', code: 'N' }
    ];
  }

  protected filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.usuarioForm);
  }

  protected filterSpecialCharacters(event: Event): void {
    Util.filterSpecialCharacters(event, this.usuarioForm);
  }

  protected filterNumeric(event: Event): void {
    Util.filterNumeric(event, this.usuarioForm);
  }

  protected isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.usuarioForm);
  }

  protected convertirFecha(): void {
    if (this.usuarioRequest.fechaCambioClave != null && this.usuarioRequest.fechaCambioClave != "") {
      this.usuarioRequest.fechaCambioClave = Util.formatDate(new Date(this.usuarioRequest.fechaCambioClave));
    }
    if (this.usuarioRequest.fechaExpiracionClave != null && this.usuarioRequest.fechaExpiracionClave != "") {
      this.usuarioRequest.fechaExpiracionClave = Util.formatDate(new Date(this.usuarioRequest.fechaExpiracionClave));
    }
  }

  protected errorMessages: Record<string, Record<string, string>> = {
    codigoTipoDocumento: { required: 'El campo es requerido' },
    numeroDocumento: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido' },
    nombres: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido' },
    apePaterno: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido' },
    apeMaterno: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido' },
    telefono: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido', phoneLength: 'El teléfono debe tener como minimo 7 dígitos.' },
    correo: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido', email : 'El formato del correo no es válido.' },
    indicadorExpiracion: { required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido' }
  };

  protected isInvalid(ctrl: string) {
    return ValidationUtil.isInvalid(this.usuarioForm, ctrl, this.submitted);
  }

  protected errors(ctrl: string) {
    return ValidationUtil.errors(this.usuarioForm, ctrl, this.errorMessages[ctrl] || {}, this.submitted);
  }

  private initializeBreadcrumbs(): void {
    this.items = [
      { label: 'Usuarios', routerLink: '/usuario' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }

  private suscribirseTipoUsuario() {
    const tipoCtrl = this.usuarioForm.get('tipoUsuario');
    const claseCtrl = this.usuarioForm.get('claseUsuario');

    tipoCtrl?.valueChanges.subscribe(val => {
      if (val === 'A') {
        claseCtrl?.setValue('S', { emitEvent: false });
        claseCtrl?.disable({ emitEvent: false });
      } else {
        claseCtrl?.enable({ emitEvent: false });
        if (val === 'U') {
          claseCtrl?.reset('', { emitEvent: false });
        }
      }
    });
  }

  aplicarReglasTipoUsuario() {
    const tipo = this.usuarioForm.get('tipoUsuario')?.value;
    this.usuarioForm.get('tipoUsuario')?.setValue(tipo); // dispara la suscripción
  }
}
