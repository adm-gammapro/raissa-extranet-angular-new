import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {PRIME_NG_MODULES} from '../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {TokenService} from '../../../../service/authorization/token.service';
import {environment} from '../../../../../environments/environment';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MenuComponent} from '../menu/menu.component';
import {RouterLink} from '@angular/router';
import {Util} from '../../../../utils/util/util.util';
import {ValidationUtil} from '../../../../service/commons/validation-util';
import {UsuarioService} from '../../../../service/modules/private/administrativo/usuario.service';
import {UsuarioRequest} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';

const STRONG_PWD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    MenuComponent,
    RouterLink],
  providers: [ConfirmationService, MessageService, TokenService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  sidebarVisible: boolean = false;
  usuario!: string | null;
  nombreEmpresa!: string | null;
  items: MenuItem[] | undefined;

  protected idUsuarioSesion!: string | null;
  protected idEmpresa!: string | null;
  protected nombreUsuarioSesion!: string | null;

  protected visible: boolean = false;
  protected perfilForm!: FormGroup;
  protected passwordForm!: FormGroup;
  protected submitted = false;

  protected passwordMeters: { label: string; color: string; value: number }[] = [];
  protected passwordProgress = 0;

  constructor(private readonly tokenService: TokenService,
              private readonly fb: FormBuilder,
              private readonly msg: MessageService,
              private readonly usuarioService: UsuarioService) {
    if (sessionStorage.getItem(environment.session.NOMBRE_EMPRESA) != undefined) {
      this.nombreEmpresa = sessionStorage.getItem(environment.session.NOMBRE_EMPRESA);
    }

    if (sessionStorage.getItem(environment.session.NOMBRES_USUARIO) != undefined) {
      this.nombreUsuarioSesion = sessionStorage.getItem(environment.session.NOMBRES_USUARIO);
    }

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA);
    }

    if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
      this.idUsuarioSesion = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION);
    }
  }

  ngOnInit() {
    const pwdValidators = environment.production
      ? [Validators.required, Validators.pattern(STRONG_PWD_REGEX)]
      : [Validators.required];

    this.passwordForm = this.fb.group({
        id: [null],
        passwordNueva: ['', pwdValidators],
        passwordConfirmar: ['', [Validators.required]]
      },
      {
        validators: [this.matchPasswordsValidator()]
      });

    this.passwordForm.get('passwordNueva')?.valueChanges.subscribe(pwd => {
      this.updatePasswordMeters(pwd || '', this.passwordForm.get('passwordConfirmar')?.value || '');
    });

    this.passwordForm.get('passwordConfirmar')?.valueChanges.subscribe(conf => {
      this.updatePasswordMeters(this.passwordForm.get('passwordNueva')?.value || '', conf || '');
    });

    this.updatePasswordMeters('', '');

    this.buildForms();
    this.cargarPerfilDeSesion();

    this.items = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => {
          this.mostrarPerfil();
        }
      },
      {separator: true},
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-power-off',
        command: () => {
          this.onLogout();
        }
      }
    ];
  }

  onLogout(): void {
    this.tokenService.clear();
    location.href = environment.security.logout_url;
  }

  mostrarPerfil(): void {
    this.visible = true;
  }


  guardarDatos() {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      this.msg.add({
        severity: 'error',
        summary: 'Guardado',
        detail: 'Debe completar los datos del perfil obligatorios del formulario.'
      });
      return;
    }

    const f = this.perfilForm.value;

    const payload: UsuarioRequest = {
      id: Number(f.id ?? 0),
      username: '',
      nombres: f.nombres,
      apePaterno: f.apellidoPaterno,
      apeMaterno: f.apellidoMaterno,
      password: '',
      fechaCambioClave: '',
      indicadorExpiracion: '',
      fechaExpiracionClave: '',
      correo: f.correo,
      telefono: f.telefono,
      estadoRegistro: 'S',
      codigoTipoDocumento: '',
      descripcionTipoDocumento: '',
      numeroDocumento: '',
      tipoUsuario: '',
      claseUsuario: '',
      idEmpresa: Number(this.idEmpresa ?? 0)
    };

    this.usuarioService.actualizarPerfil(payload).subscribe({
      next: () => {
        sessionStorage.setItem(environment.session.NOMBRES_USUARIO, f.nombres);
        sessionStorage.setItem(environment.session.APELLIDO_PATERNO_USUARIO_SESSION, f.apellidoPaterno);
        sessionStorage.setItem(environment.session.APELLIDO_MATERNO_USUARIO_SESSION, f.apellidoMaterno);
        sessionStorage.setItem(environment.session.CORREO_USUARIO_SESSION, f.correo);
        sessionStorage.setItem(environment.session.TELEFONO_USUARIO_SESSION, f.telefono);

        this.msg.add({severity: 'success', summary: 'Guardado', detail: 'Datos personales actualizados.'});
      },
      error: () => this.msg.add({severity: 'error', summary: 'Error', detail: 'No se pudo guardar.'})
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.msg.add({
        severity: 'error',
        summary: 'Guardado',
        detail: 'Debe completar los datos de contraseñas obligatorios.'
      });
      return;
    }
    const {passwordNueva, passwordConfirmar} = this.passwordForm.value;
    if (passwordNueva !== passwordConfirmar) {
      this.msg.add({severity: 'warn', summary: 'Validación', detail: 'Las contraseñas no coinciden.'});
      return;
    }

    this.usuarioService.cambiarPassword(Number(this.idUsuarioSesion), passwordNueva).subscribe({
      next: () => {
        this.msg.add({severity: 'success', summary: 'Guardado', detail: 'Contraseña actualizada.'});
        this.passwordForm.reset();
      },
      error: () => this.msg.add({severity: 'error', summary: 'Error', detail: 'No se pudo actualizar password.'})
    });
  }

  protected isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.perfilForm);
  }

  protected isFieldRequiredPassword(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.passwordForm);
  }

  protected isInvalid(ctrl: string) {
    return ValidationUtil.isInvalid(this.perfilForm, ctrl, this.submitted);
  }

  protected isInvalidPassword(ctrl: string) {
    const c = this.passwordForm.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private buildForms() {
    this.perfilForm = this.fb.group({
      id: [null],
      nombres: ['', [Validators.required]],
      apellidoPaterno: ['', [Validators.required]],
      apellidoMaterno: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]]
    });
  }

  private cargarPerfilDeSesion() {
    const idUsuarioSesion = this.idUsuarioSesion;
    const nombres = this.getSessionItem(environment.session.NOMBRES_USUARIO);
    const apePat = this.getSessionItem(environment.session.APELLIDO_PATERNO_USUARIO_SESSION);
    const apeMat = this.getSessionItem(environment.session.APELLIDO_MATERNO_USUARIO_SESSION);
    const correo = this.getSessionItem(environment.session.CORREO_USUARIO_SESSION);
    const telefono = this.getSessionItem(environment.session.TELEFONO_USUARIO_SESSION);

    this.perfilForm.patchValue({
      id: idUsuarioSesion || null,
      nombres: nombres,
      apellidoPaterno: apePat,
      apellidoMaterno: apeMat,
      correo: correo,
      telefono: telefono
    });
  }

  private getSessionItem(key: string): string {
    return sessionStorage.getItem(key) ?? '';
  }

  private matchPasswordsValidator() {
    return (group: AbstractControl) => {
      const p1 = group.get('passwordNueva')?.value;
      const p2 = group.get('passwordConfirmar')?.value;
      return p1 && p2 && p1 !== p2 ? {passwordsMismatch: true} : null;
    };
  }

  private updatePasswordMeters(pwd: string, conf: string) {
    const rules = [
      { label: 'Min 8', ok: pwd.length >= 8 },
      { label: 'Mayúscula', ok: /[A-Z]/.test(pwd) },
      { label: 'Minúscula', ok: /[a-z]/.test(pwd) },
      { label: 'Número', ok: /\d/.test(pwd) },
      { label: 'Especial', ok: /[^\w\s]/.test(pwd) },
      { label: 'Coincide', ok: !!pwd && pwd === conf }
    ];

    const colors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#10b981', '#eab308'];
    const offColor = '#e5e7eb';
    const step = Math.floor(100 / rules.length);
    const lastVal = 100 - step * (rules.length - 1);

    this.passwordMeters = rules.map((r, i) => ({
      label: r.label,
      value: r.ok ? (i === rules.length - 1 ? lastVal : step) : 0,
      color: r.ok ? colors[i] : offColor
    }));

    this.passwordProgress = rules
      .map((r, i) => (r.ok ? (i === rules.length - 1 ? lastVal : step) : 0))
      .reduce((a, b) => a + b, 0);
  }
}
