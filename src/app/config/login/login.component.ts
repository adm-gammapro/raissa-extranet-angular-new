import {Component, OnInit} from '@angular/core';
import {TokenService} from '../../service/authorization/token.service';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService, ValidacionUsuario} from '../../service/authorization/auth.service';
import {EmpresaDto} from '../../apis/model/module/private/administrativo/empresa/empresa-simple';
import {CommonModule} from '@angular/common';
import {ToastModule} from 'primeng/toast';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {MessageModule} from 'primeng/message';
import {RippleModule} from 'primeng/ripple';
import {MessageService} from 'primeng/api';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Select} from 'primeng/select';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ToastModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    RippleModule,
    RouterLink,
    InputGroup,
    InputGroupAddon,
    Select
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  pasoActual: 'credenciales' | 'validado' = 'credenciales';
  tipoUsuario: 'A' | 'C' | null = null;
  credencialesForm: FormGroup;
  empresas: EmpresaDto[] = [];
  empresaSeleccionada: EmpresaDto | null = null;
  usernameCompleto: string = '';
  isLoading = false;
  errorMessage = '';
  errorType: 'credenciales' | 'servidor' | 'red' | null = null;

  // Constantes
  tiposDocumento = [
    {value: 'DNI', label: 'DOCUMENTO NACIONAL DE IDENTIDAD'},
    {value: 'CE', label: 'CARNET DE EXTRANJERIA'},
    {value: 'PAS', label: 'PASAPORTE'},
    {value: 'RUC', label: 'REGISTRO UNICO DEL CONTRIBUYENTE'},
    {value: 'PN', label: 'PARTIDA DE NACIMIENTO'}
  ];

  constructor(private readonly fb: FormBuilder,
              private readonly router: Router,
              private readonly authService: AuthService,
              private readonly tokenService: TokenService,
              private readonly messageService: MessageService) {
    this.credencialesForm = this.fb.group({
      tipoDoc: ['DNI', Validators.required],
      usuario: ['', [Validators.required, Validators.pattern('^[0-9a-zA-Z]+$')]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    if (this.tokenService.isLogged()) {
      this.router.navigateByUrl('/content');
    }
  }

  // Getter para validar si el botón "Validar" debe estar habilitado
  get puedeValidar(): boolean {
    const {usuario, password} = this.credencialesForm.value;
    return usuario?.trim() && password?.trim() && !this.isLoading;
  }

  get puedeIniciarSesion(): boolean {
    if (this.tipoUsuario === 'A') return true;
    if (this.tipoUsuario === 'C') return this.empresaSeleccionada !== null;
    return false;
  }

  onValidarUsuario(): void {
    if (this.credencialesForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.errorType = null;

    const {tipoDoc, usuario, password} = this.credencialesForm.value;
    this.usernameCompleto = this.authService.buildUsername(tipoDoc, usuario);

    this.authService.validarUsuario(tipoDoc, usuario, password).subscribe({
      next: (response: ValidacionUsuario) => {
        this.isLoading = false;

        if (response.status === 'A' || response.status === 'C') {
          this.tipoUsuario = response.status;
          this.pasoActual = 'validado';

          if (response.status === 'C' && response.empresas) {
            this.empresas = response.empresas;
          }

          this.credencialesForm.get('tipoDoc')?.disable();
          this.credencialesForm.get('usuario')?.disable();

          const detail = response.status === 'A'
            ? 'Usuario administrador verificado'
            : 'Seleccione una empresa para continuar';

          this.messageService.add({
            severity: 'success',
            summary: 'Validación Exitosa',
            detail: detail,
            life: 3000
          });
        } else {
          // Status "E" - Error controlado
          this.errorType = 'credenciales';
          this.errorMessage = response.mensaje || 'Error al validar las credenciales.';

          this.messageService.add({
            severity: 'error',
            summary: 'Error de Validación',
            detail: this.errorMessage,
            life: 5000
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        const errorInfo = this.getErrorMessage(error);
        this.errorMessage = errorInfo.message;
        this.errorType = errorInfo.type as any;

        this.messageService.add({
          severity: 'error',
          summary: this.getErrorTitle(errorInfo.type),
          detail: errorInfo.message,
          life: 8000
        });

        console.error('Error en validación:', error);
      }
    });
  }

  onIniciarSesion(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const password = this.credencialesForm.get('password')?.value;
    const empresa = this.tipoUsuario === 'C' ? this.empresaSeleccionada?.id?.toString() : undefined;

    try {
      this.authService.realizarLogin(
        this.usernameCompleto,
        password,
        empresa
      );
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Error al iniciar sesión. Intente nuevamente.';

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.errorMessage,
        life: 5000
      });

      console.error('Error en login:', error);
    }
  }

  onVolver(): void {
    this.pasoActual = 'credenciales';
    this.tipoUsuario = null;
    this.empresas = [];
    this.empresaSeleccionada = null;
    this.errorMessage = '';
    this.errorType = null;
    this.credencialesForm.get('tipoDoc')?.enable();
    this.credencialesForm.get('usuario')?.enable();
  }

  onPasswordBlur(event: any): void {
    console.log('Password field blurred');
  }

  onEmpresaChange(event: any): void {
    this.empresaSeleccionada = event.value;
  }

  /**
   * Analiza el error HTTP y devuelve un mensaje apropiado
   */
  private getErrorMessage(error: HttpErrorResponse): { message: string; type: string } {
    console.log('🔍 Analizando error:', error);

    // Mapa de errores por status code
    const errorMap: Record<number, { message: string; type: string }> = {
      0: {
        message: 'No se puede conectar con el servidor. Verifique su conexión a internet.',
        type: 'red'
      },
      401: {
        message: 'La contraseña ingresada es incorrecta. Verifique e intente nuevamente.',
        type: 'credenciales'
      },
      403: {
        message: 'El usuario no tiene empresas asociadas. Contacte al administrador.',
        type: 'credenciales'
      },
      404: {
        message: 'El número de documento ingresado no está registrado en el sistema.',
        type: 'credenciales'
      },
      429: {
        message: 'Demasiados intentos. Por favor, espere un minuto antes de intentar nuevamente.',
        type: 'servidor'
      },
      503: {
        message: 'El servicio no está disponible en este momento. Por favor, intente nuevamente más tarde.',
        type: 'servidor'
      }
    };

    // Buscar en el mapa por status code
    if (error.status !== undefined && errorMap[error.status]) {
      return errorMap[error.status];
    }

    // Error de parseo JSON (recibió HTML en lugar de JSON)
    if (error.status === 200 && error.message?.includes('is not valid JSON')) {
      return {
        message: 'Error inesperado del servidor. Por favor, intente nuevamente.',
        type: 'servidor'
      };
    }

    // Errores 5xx genéricos
    if (error.status && error.status >= 500) {
      return {
        message: 'Error interno del servidor. Por favor, intente nuevamente más tarde.',
        type: 'servidor'
      };
    }

    // Si el backend devuelve un mensaje personalizado en el body
    if (error.error?.mensaje) {
      return {
        message: error.error.mensaje,
        type: error.error.status === 'E' ? 'credenciales' : 'servidor'
      };
    }

    // Si el backend devuelve un error genérico
    if (error.error?.message) {
      return {
        message: error.error.message,
        type: 'servidor'
      };
    }

    // Si el backend devuelve un código de error específico
    if (error.error?.error) {
      const errorCode = error.error.error;
      if (errorCode === 'backend_unavailable') {
        return {
          message: 'El servicio no está disponible en este momento.',
          type: 'servidor'
        };
      }
      if (errorCode === 'rate_limit_exceeded') {
        return {
          message: 'Demasiados intentos. Espere un minuto.',
          type: 'servidor'
        };
      }
    }

    // Valor por defecto obligatorio
    return {
      message: 'Error al validar el usuario. Por favor, intente nuevamente.',
      type: 'servidor'
    };
  }

  /**
   * Obtiene el título según el tipo de error
   */
  getErrorTitle(type: string): string {
    switch (type) {
      case 'servidor':
        return 'Servidor No Disponible';
      case 'red':
        return 'Error de Conexión';
      case 'credenciales':
        return 'Error de Validación';
      default:
        return 'Error';
    }
  }
}
