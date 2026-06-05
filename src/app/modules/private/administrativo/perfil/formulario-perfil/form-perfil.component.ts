import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HeaderComponent} from '../../../layout/header/header.component';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {PerfilService} from '../../../../../service/modules/private/administrativo/perfil.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {filter, map, switchMap} from 'rxjs';
import {environment} from '../../../../../../environments/environment';
import {Util} from '../../../../../utils/util/util.util';
import {ValidationUtil} from '../../../../../service/commons/validation-util';
import {PerfilRequest} from '../../../../../apis/model/module/private/administrativo/perfil/request/perfil-request';
import {PerfilResponse} from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';

@Component({
  selector: 'app-form-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    RouterLink,
    ...PRIME_NG_MODULES],
  providers: [ConfirmationService, MessageService],
  templateUrl: './form-perfil.component.html',
  styleUrl: './form-perfil.component.scss'
})
export class FormPerfilComponent implements OnInit {
  protected perfilRequest: PerfilRequest = new PerfilRequest();
  protected perfilResponse: PerfilResponse = new PerfilResponse();
  protected perfilForm: FormGroup;
  protected idUsuarioSession: string = "";
  protected submitted = false;
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;

  constructor(private readonly router: Router,
              private readonly confirmationService: ConfirmationService,
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly perfilService: PerfilService,
              private readonly activatedRoute: ActivatedRoute) {

    this.perfilForm = this.formBuilder.group({
      codigo: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      abreviatura: ['', [Validators.required, Validators.maxLength(20)]],
      nombreComercial: ['', [Validators.required, Validators.maxLength(100)]],
      fechaCaducidad: ['']
    });

    if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
      this.idUsuarioSession = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION)!;
    }
  }

  guardar() {
    if (this.perfilForm.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de guardar este registro?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'No',
          severity: 'danger',
          icon: 'pi pi-times',
          outlined: true
        },
        acceptButtonProps: {
          label: 'Si',
          icon: 'pi pi-check',
          severity: 'info',
          outlined: true
        },
        accept: () => {

          this.perfilRequest = this.perfilForm.value;
          this.perfilRequest.idUsuario = this.idUsuarioSession;
          this.convertirFecha();

          this.perfilService.registrar(this.perfilRequest).subscribe({
            next: (response) => {
              const toast = {
                severity: 'success',
                summary: 'Éxito',
                detail: `Perfil ${response.descripcion} se guardó exitosamente.`,
                life: 4000
              };
              this.router.navigate(['/perfil'], { state: { toast } });
            },
            error: (err) => {
              console.log(err);
              this.messageService.add({severity: 'error', summary: 'Error', detail: err.error.message, life: 5000});
            }
          })
        }, reject: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Rechazado',
            detail: 'No se guardó registro',
            life: 5000
          });
        }
      });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Se deben ingresar los campos obligatorios y en el formato requerido.',
        life: 5000
      });
      this.perfilForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.initializeBreadcrumbs();
    this.loadModuloIfExists();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.perfilForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.perfilForm);
  }

  protected convertirFecha(): void {
    if (this.perfilRequest.fechaCaducidad != null && this.perfilRequest.fechaCaducidad != "") {
      this.perfilRequest.fechaCaducidad = Util.formatDate(new Date(this.perfilRequest.fechaCaducidad));
    }
  }

  protected errorMessages: Record<string, Record<string, string>> = {
    descripcion: {required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido'},
    abreviatura: {required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido'},
    nombreComercial: {required: 'El campo es requerido', maxlength: 'Máximo de caracteres excedido'}
  };

  protected isInvalid(ctrl: string) {
    return ValidationUtil.isInvalid(this.perfilForm, ctrl, this.submitted);
  }

  protected errors(ctrl: string) {
    return ValidationUtil.errors(this.perfilForm, ctrl, this.errorMessages[ctrl] || {}, this.submitted);
  }

  private loadModuloIfExists(): void {
    this.activatedRoute.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !!id),
        switchMap(id => this.perfilService.getPerfil(id))
      )
      .subscribe({
        next: response => this.populateForm(response),
        error: err => this.messageService.add({
          severity: 'error',
          summary: 'Error de Validación',
          detail: 'Error al cargar Perfil: ' + err,
          life: 5000
        })
      });
  }

  private populateForm(response: any): void {
    this.perfilResponse = response;

    this.perfilForm.patchValue({
      codigo: response.codigo,
      descripcion: response.descripcion,
      abreviatura: response.abreviatura,
      nombreComercial: response.nombreComercial,
      fechaCaducidad: response.fechaCaducidad,
    });
  }

  private initializeBreadcrumbs(): void {
    this.items = [
      { label: 'Perfiles', routerLink: '/perfil' },
      { label: 'Formulario' }
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
