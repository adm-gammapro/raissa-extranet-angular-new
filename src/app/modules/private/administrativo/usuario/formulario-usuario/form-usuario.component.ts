import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario.service';
import { Usuario } from '../../../../../apis/model/module/private/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';
import { TipoDocService } from '../../../../../service/commons/tipo-doc.service';
import { TipoDocumento } from '../../../../../apis/model/commons/tipo-documento';
import { environment } from '../../../../../../environments/environment';

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
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, UsuarioService,TipoDocService],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.scss'
})
export class FormUsuarioComponent {
  mostrarHijo = false;
  usuario: Usuario = new Usuario();
  public usuarioForm: FormGroup;
  public isDisabled: boolean = false;
  public tipoDocs: TipoDocumento[] = [];
  private idEmpresa: string = "";
  expiracion: Expiracion[] | undefined;

  constructor(private router: Router, 
              private confirmationService: ConfirmationService, 
              private formBuilder: FormBuilder,
              private messageService: MessageService, 
              private usuarioService: UsuarioService, 
              private activatedRoute: ActivatedRoute,
              private messagesService: MessagesService,
              private tipoDocService: TipoDocService) {

    this.usuarioForm = this.formBuilder.group({
      id: new FormControl(this.usuario.id),
      username: new FormControl(this.usuario.username),
      password: new FormControl(this.usuario.password),
      nombres: new FormControl(this.usuario.nombres, [Validators.required, Validators.maxLength(70)]),
      correo: new FormControl(this.usuario.correo, [Validators.maxLength(50), Validators.email]),
      telefono: new FormControl(this.usuario.telefono, [Validators.maxLength(20), Util.phoneValidator()]),
      codigoTipoDocumento: new FormControl(this.usuario.codigoTipoDocumento, [Validators.required]),
      apePaterno: new FormControl(this.usuario.apePaterno, [Validators.required, Validators.maxLength(50)]),
      apeMaterno: new FormControl(this.usuario.apeMaterno, [Validators.required, Validators.maxLength(50)]),
      indicadorExpiracion: new FormControl(this.usuario.indicadorExpiracion, [Validators.required]),
      fechaCambioClave: new FormControl(this.usuario.fechaCambioClave),
      numeroDocumento: new FormControl(this.usuario.numeroDocumento, [Validators.required, Validators.maxLength(30)]),
      fechaExpiracionClave: new FormControl(this.usuario.fechaExpiracionClave),
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
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
              
              this.usuario = this.usuarioForm.value;
              this.usuario.username = this.usuario.codigoTipoDocumento + "_" + this.usuario.numeroDocumento;
              this.convertirFecha();
              
              this.usuarioService.create(this.usuario, this.idEmpresa).subscribe({
                next:(response) => {
                  const messages: Message[] = [
                    { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro ${response.numeroDocumento} existosamente`, life: 5000 }
                  ];
                  this.messagesService.setMessages(messages);
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

          this.usuario = response as Usuario;

          this.usuarioForm.patchValue({
            id: this.usuario.id,
            username: this.usuario.username,
            password: this.usuario.password,
            nombres: this.usuario.nombres,
            correo: this.usuario.correo,
            telefono: this.usuario.telefono,
            codigoTipoDocumento: this.usuario.codigoTipoDocumento,
            apePaterno: this.usuario.apePaterno,
            apeMaterno: this.usuario.apeMaterno,
            indicadorExpiracion: this.usuario.indicadorExpiracion,

            fechaCambioClave: this.usuario.fechaCambioClave,
            numeroDocumento: this.usuario.numeroDocumento,
            fechaExpiracionClave: this.usuario.fechaExpiracionClave
          });

          if (this.usuario.fechaCambioClave != "") {
            this.usuarioForm.patchValue({
              fechaCambioClave: Util.stringToDate(this.usuario.fechaCambioClave, 'dd/mm/yyyy', '/')
            });
          }

          if (this.usuario.fechaExpiracionClave != "") {
            this.usuarioForm.patchValue({
              fechaExpiracionClave: Util.stringToDate(this.usuario.fechaExpiracionClave, 'dd/mm/yyyy', '/')
            });
          }
        });
      }
    })
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

  filterAlphabetsGuiones(event: Event): void {
    Util.filterAlphabetsGuiones(event, this.usuarioForm);
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.usuarioForm);
  }

  filterAlphanumericoSinEspacio(event: Event): void {
    Util.filterAlphanumericoSinEspacio(event, this.usuarioForm);
  }

  filterSpecialCharacters(event: Event): void {
    Util.filterSpecialCharacters(event, this.usuarioForm);
  }

  filterNumeric(event: Event): void {
    Util.filterNumeric(event, this.usuarioForm);
  }

  filterAlphabets(event: Event): void {
    Util.filterAlphabets(event, this.usuarioForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.usuarioForm);
  }

  transformToUppercase(event: Event): void {
    Util.transformToUppercase(event, this.usuarioForm);
  }

  convertirFecha(): void {
    if (this.usuario.fechaCambioClave != null && this.usuario.fechaCambioClave != "") {      
      this.usuario.fechaCambioClave = Util.formatDate(new Date(this.usuario.fechaCambioClave));
    }
    if (this.usuario.fechaExpiracionClave != null && this.usuario.fechaExpiracionClave != "") {      
      this.usuario.fechaExpiracionClave = Util.formatDate(new Date(this.usuario.fechaExpiracionClave));
    }
  }
}
