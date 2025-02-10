import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CuentasService } from '../../../../../service/modules/private/operativo/cuentas.service';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { AgrupacionService } from '../../../../../service/modules/private/operativo/agrupacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Moneda } from '../../../../../apis/model/commons/moneda';
import { Agrupacion } from '../../../../../apis/model/module/private/agrupacion';
import { Util } from '../../../../../utils/util/util.util';
import { TipoCuenta } from '../../../../../apis/model/module/private/tipo-cuenta';
import { CuentaResponse } from '../../../../../apis/model/module/private/operativo/cuenta/response/cuenta-response';
import { CuentaRequest } from '../../../../../apis/model/module/private/operativo/cuenta/request/cuenta-request';
import { FrecuenciaActualizacionResponse } from '../../../../../apis/model/module/private/commons/frecuencia-actualizacion-response';
import { InstitucionFinancieraService } from '../../../../../service/commons/institucion-financiera.service';
import { InstitucionFinancieraResponse } from '../../../../../apis/model/module/private/commons/institucion-financiera-response';

@Component({
  selector: 'app-form-cuentas',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, CuentasService, SaldosService, AgrupacionService],
  templateUrl: './form-cuentas.component.html',
  styleUrl: './form-cuentas.component.scss'
})
export class FormCuentasComponent {
  cuentaResponse!: CuentaResponse;
  cuentaRequest!: CuentaRequest;
  public cuentaForm: FormGroup;
  public idEmpresa: string = "";
  monedas: Moneda[] = Moneda.monedas;
  tipoCuentas: TipoCuenta[] = TipoCuenta.tipoCuentas;
  public agrupaciones: Agrupacion[] = [];
  public bancos: InstitucionFinancieraResponse[]=[];
  public frecuencias: FrecuenciaActualizacionResponse[] = [];

  constructor(private readonly router: Router, 
              private readonly confirmationService: ConfirmationService, 
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService, 
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly cuentasService: CuentasService,
              private readonly agrupacionService: AgrupacionService,
              private readonly institucionFinancieraService: InstitucionFinancieraService) {

    this.cuentaForm = this.formBuilder.group({
      codigo: [null],
      numeroCuenta: ['', [Validators.required, Validators.maxLength(23)]],
      codigoInstitucionFinanciera: ['', Validators.required],
      monedaCuenta: ['', Validators.required],
      codigoAgrupacion: ['', Validators.required],
      codigoFrecuenciaActualizacion: ['', Validators.required],
      tipoCuenta: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  public cargarAgrupacion(): void {
    this.agrupacionService.getAllAgrupaciones(Number(this.idEmpresa)).subscribe(response => {
      this.agrupaciones = response as Agrupacion[];
    });
  }

  public cargarFrecuencia(): void {
    this.cuentasService.getFrecuencias().subscribe(response => {
      this.frecuencias = response;
    });
  }

  public cargarBanco(): void {
    this.institucionFinancieraService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response;
    });
  }

  public cargarCuenta(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.cuentasService.getCuenta(id, Number(this.idEmpresa)).subscribe(response=> {
          this.cuentaResponse = response;

          this.cuentaForm.patchValue({
            codigo: this.cuentaResponse.codigo,
            numeroCuenta: this.cuentaResponse.numeroCuenta,
            codigoInstitucionFinanciera: this.cuentaResponse.codigoInstitucionFinanciera,
            monedaCuenta: this.cuentaResponse.monedaCuenta,
            codigoAgrupacion: this.cuentaResponse.agrupacion.codigo,
            codigoFrecuenciaActualizacion: this.cuentaResponse.frecuenciaActualizacion.codigo,
            tipoCuenta: this.cuentaResponse.tipoCuenta
          });
        });
      }
    })
  }

  guardar() {
    
      if (this.cuentaForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {

            this.cuentaRequest = this.cuentaForm.value;
            this.cuentaRequest.codigoCliente = Number(this.idEmpresa);
            this.cuentaRequest.interfazCuentaProvieneCliente = "1";//Se envia desde extranet
            if (this.cuentaRequest.codigo) {
              this.cuentasService.update(this.cuentaRequest).subscribe({
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
                  this.router.navigate(['/cuentas'])
                }
              });
            } else {
              this.cuentasService.create(this.cuentaRequest).subscribe({
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
                  this.router.navigate(['/cuentas'])
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
        this.cuentaForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarAgrupacion();
    this.cargarFrecuencia();
    this.cargarBanco();
    this.cargarCuenta();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.cuentaForm);
  }

  filterNumeric(event: Event): void {
    Util.filterNumeric(event, this.cuentaForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.cuentaForm);
  }
}
