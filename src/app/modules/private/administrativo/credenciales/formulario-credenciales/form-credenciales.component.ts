import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CredencialesService } from '../../../../../service/modules/private/operativo/credenciales.service';
import { ProveedorService } from '../../../../../service/modules/private/operativo/proveedor.service';
import { CuentasService } from '../../../../../service/modules/private/operativo/cuentas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Util } from '../../../../../utils/util/util.util';
import { FrecuenciaActualizacionResponse } from '../../../../../apis/model/module/private/commons/frecuencia-actualizacion-response';
import { ProveedorResponse } from '../../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { CredencialesResponse } from '../../../../../apis/model/module/private/operativo/credenciales/response/credenciales-response';
import { CredencialesRequest } from '../../../../../apis/model/module/private/operativo/credenciales/request/credenciales-request';

@Component({
  selector: 'app-form-credenciales',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService],
  templateUrl: './form-credenciales.component.html',
  styleUrl: './form-credenciales.component.scss'
})
export class FormCredencialesComponent {
  credencialesResponse: CredencialesResponse = new CredencialesResponse();
  credencialesRequest: CredencialesRequest = new CredencialesRequest();
  public proveedores: ProveedorResponse[] = [];
  public frecuencias: FrecuenciaActualizacionResponse[] = [];
  public credencialForm: FormGroup;
  public idEmpresa: string = "";

  constructor(private readonly router: Router, 
              private readonly confirmationService: ConfirmationService, 
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService, 
              private readonly proveedorService: ProveedorService, 
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly credencialesService: CredencialesService,
              private readonly cuentasService: CuentasService) {

    this.credencialForm = this.formBuilder.group({
      codigo: [null],
      nombreReferencial: ['', [Validators.required, Validators.maxLength(50)]],
      usuario: ['', [Validators.required, Validators.maxLength(50)]],
      clave: ['', Validators.required],
      referencia: [''],
      codigoFrecuenciaActualizacion: ['', Validators.required],
      codigoProveedor: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  public cargarProveedor(): void {
    this.proveedorService.getAllProveedor(Number(this.idEmpresa)).subscribe(response => {
      this.proveedores = response;
    });
  }

  public cargarFrecuencia(): void {
    this.cuentasService.getFrecuencias().subscribe(response => {
      this.frecuencias = response;
    });
  }

  onChangeProveedor(event: any) {
    this.proveedorService.getProveedor(event.value).subscribe(response => {
      let proveedor = response;

      const campoReferencia = this.credencialForm.get('referencia');
      if (proveedor.indicadorValorAdicional) {
        campoReferencia?.setValidators([Validators.required]); 
      } else {
        campoReferencia?.clearValidators();
      }
  
      campoReferencia?.updateValueAndValidity();
    });
  }

  guardar() {
    
      if (this.credencialForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
            this.credencialesRequest = this.credencialForm.value;
            this.credencialesRequest.codigoCliente = Number(this.idEmpresa);
            if (this.credencialesRequest.codigo) {
              this.credencialesService.update(this.credencialesRequest).subscribe({
                next: () => {
                  const messages: Message[] = [
                    { severity: 'success', summary: 'Confirmación', detail: `Se Actualizó registro existosamente`, life: 5000 }
                  ];
                  this.messagesService.setMessages(messages);
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: Util.validaMensajeError(err), life: 5000 });
                },
                complete: () => {
                  this.router.navigate(['/credenciales'])
                }
              });
            } else {
              this.credencialesService.create(this.credencialesRequest).subscribe({
                next: () => {
                  const messages: Message[] = [
                    { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro existosamente`, life: 5000 }
                  ];
                  this.messagesService.setMessages(messages);
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
                },
                complete: () => {
                  this.router.navigate(['/credenciales'])
                }
              });
            }
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
        this.credencialForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarProveedor();
    this.cargarFrecuencia();

    this.activatedRoute.paramMap.subscribe (params => {
      let id: number | null;

      id = Number(params.get('id'));
                      
      if(id!=null && id>0){
        this.credencialesService.getCredencial(id, Number(this.idEmpresa)).subscribe(response => {
          this.credencialesResponse = response;

          this.credencialForm.patchValue({
            codigo: this.credencialesResponse.codigo,
            nombreReferencial: this.credencialesResponse.nombreReferencial,
            usuario: this.credencialesResponse.usuario,
            clave: this.credencialesResponse.clave,
            referencia: this.credencialesResponse.referencia,
            codigoFrecuenciaActualizacion: this.credencialesResponse.frecuenciaActualizacion.codigo,
            codigoProveedor: this.credencialesResponse.proveedor.codigo
          });
        });
      }
    })
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.credencialForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.credencialForm);
  }
}
