import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../../service/modules/private/administrativo/usuario.service';
import {TipoDocService} from '../../../../../service/commons/tipo-doc.service';
import {environment} from '../../../../../../environments/environment';
import {UsuarioRequest} from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import {
  UsuarioResponse
} from '../../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {ProgressSpinner} from 'primeng/progressspinner';
import {TipoDocumentoResponse} from '../../../../../apis/model/module/private/commons/tipo-documento-response';

const CLASES_USUARIO = [
  { valor: 'O', descripcion: 'Operativo' },
  { valor: 'S', descripcion: 'Supervisor' }
];

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    Button,
    InputText,
    ReactiveFormsModule,
    Select,
    ProgressSpinner,
  ],
    providers: [ConfirmationService, MessageService, UsuarioService,TipoDocService],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.scss'
})
export class FormUsuarioComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() modo: 'editar' | 'registrar' = 'registrar';
  @Output() guardarRegistro = new EventEmitter<void>();

  protected tipoDocs: TipoDocumentoResponse[] = [];

  @Input() set usuarioData(usuario: UsuarioResponse | null) {
    if (usuario) {
      this.cargarDatosEnFormulario(usuario);
    } else {
      this.limpiarFormulario();
    }
  }

  activate = signal(false);
  form!: FormGroup;
  protected idEmpresa!: string;
  protected clasesUsuario = CLASES_USUARIO;
  protected loading: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly usuarioService: UsuarioService,
    private readonly tipoDocService: TipoDocService
  ) {
    const idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA);
    if (idEmpresa) {
      this.idEmpresa = idEmpresa;
    }

    this.form = this.fb.group({
      id: [null],
      username: [''],
      nombres: ['', Validators.required],
      apePaterno: ['', Validators.required],
      apeMaterno: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      codigoTipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      tipoUsuario: [''],
      claseUsuario: ['', Validators.required],
      idEmpresa: [null]
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      idEmpresa: this.idEmpresa ? Number(this.idEmpresa) : null
    });

    this.cargarTipoDocumento()
  }

  guardar() {
    this.loading = true;
    this.depurarFormulario();
    if (this.form.valid) {
      const request: UsuarioRequest = {
        id: this.form.get('id')?.value,
        username: this.form.get('username')?.value,
        nombres: this.form.get('nombres')?.value,
        apePaterno: this.form.get('apePaterno')?.value,
        apeMaterno: this.form.get('apeMaterno')?.value,
        password: this.form.get('password')?.value,
        correo: this.form.get('correo')?.value,
        telefono: this.form.get('telefono')?.value,
        codigoTipoDocumento: this.form.get('codigoTipoDocumento')?.value,
        numeroDocumento: this.form.get('numeroDocumento')?.value,
        tipoUsuario: this.form.get('tipoUsuario')?.value,
        claseUsuario: this.form.get('claseUsuario')?.value,
        idEmpresa: Number(this.idEmpresa)
      };

      if (this.modo === 'registrar') {
        this.usuarioService.registrarUsuario(request).subscribe({
          next: (response: UsuarioResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmación',
              detail: `Se registró el usuario ${response.username} correctamente`
            });
            this.guardarRegistro.emit();
            this.loading = false;
            this.cerrar();
          },
          error: (error) => this.handleError(error)
        });
      } else {
        this.usuarioService.actualizarUsuario(request).subscribe({
          next: (response: UsuarioResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmación',
              detail: `Se actualizó el usuario ${response.username} correctamente`
            });
            this.guardarRegistro.emit();
            this.loading = false;
            this.cerrar();
          },
          error: (error) => this.handleError(error)
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.activate.set(true);
      setTimeout(() => {
        this.activate.set(false);
      }, 3500);

      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: `Formulario inválido`
      });
    }
  }

  private handleError(error: any): void {
    if (error.status === 502) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error en el servicio'
      });
    } else if (error.status === 503) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Servicio no disponible'
      });
    } else if (error.status === 400) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: error.error?.message || 'Datos inválidos'
      });
    }
  }

  protected cerrar() {
    this.form.reset();
    this.visibleChange.emit(false);
    this.limpiarFormulario();
  }

  protected cargarTipoDocumento(): void {
    this.tipoDocService.getAllTipoDocumentos()
      .subscribe(response => {
        this.tipoDocs = response;
      });
  }

  get headerTitle(): string {
    return this.modo === 'editar' ? 'Actualizar Usuario' : 'Registrar Usuario';
  }

  private cargarDatosEnFormulario(usuario: UsuarioResponse): void {
    this.form.patchValue({
      id: usuario.id,
      username: usuario.username,
      nombres: usuario.nombres,
      apePaterno: usuario.apePaterno,
      apeMaterno: usuario.apeMaterno,
      correo: usuario.correo,
      telefono: usuario.telefono,
      codigoTipoDocumento: usuario.codigoTipoDocumento,
      numeroDocumento: usuario.numeroDocumento,
      tipoUsuario: usuario.tipoUsuario,
      claseUsuario: usuario.claseUsuario,
      idEmpresa: usuario.idEmpresa ? Number(usuario.idEmpresa) : null
    });

    // No cargar la contraseña por seguridad
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  private limpiarFormulario(): void {
    this.form.reset();
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    if (this.idEmpresa) {
      this.form.patchValue({ idEmpresa: Number(this.idEmpresa) });
    }
  }

  private depurarFormulario(): void {
    console.group('🔍 DEPURACIÓN DE FORMULARIO');

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);

      if (control?.invalid) {
        if (control.errors) {
          Object.keys(control.errors).forEach(errorKey => {
            console.log(`  → ${errorKey}:`, control.errors![errorKey]);
          });
        }
        console.groupEnd();
      }
    });
    console.groupEnd();
  }
}
