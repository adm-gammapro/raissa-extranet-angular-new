import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CuentasService } from '../../../../../service/modules/private/operativo/cuentas.service';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { AgrupacionService } from '../../../../../service/modules/private/operativo/agrupacion.service';
import { Cuentas } from '../../../../../apis/model/module/private/cuentas';
import { Frecuencia } from '../../../../../apis/model/module/private/frecuencia';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Moneda } from '../../../../../apis/model/commons/moneda';
import { Agrupacion } from '../../../../../apis/model/module/private/agrupacion';
import { Banco } from '../../../../../apis/model/module/private/banco';
import { Util } from '../../../../../utils/util/util.util';
import { TipoCuenta } from '../../../../../apis/model/module/private/tipo-cuenta';

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
  cuenta: Cuentas = new Cuentas();
  public cuentaForm: FormGroup;
  public idEmpresa: string = "";
  monedas: Moneda[] = Moneda.monedas;
  tipoCuentas: TipoCuenta[] = TipoCuenta.tipoCuentas;
  public agrupaciones: Agrupacion[] = [];
  public bancos: Banco[]=[];
  public frecuencias: Frecuencia[] = [];

  constructor(private router: Router, 
              private confirmationService: ConfirmationService, 
              private formBuilder: FormBuilder,
              private messageService: MessageService, 
              private activatedRoute: ActivatedRoute,
              private messagesService: MessagesService,
              private saldosService: SaldosService,
              private cuentasService: CuentasService,
              private agrupacionService: AgrupacionService) {

    this.cuentaForm = this.formBuilder.group({
      codigo: new FormControl(this.cuenta.codigo),
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
      this.frecuencias = response as Frecuencia[];
    });
  }

  public cargarBanco(): void {
    this.saldosService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response as Banco[];
    });
  }

  public cargarCuenta(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.cuentasService.getCuenta(id).subscribe(response=> {
          this.cuenta = response;

          this.cuentaForm.patchValue({
            codigo: this.cuenta.codigo,
            numeroCuenta: this.cuenta.numeroCuenta,
            codigoInstitucionFinanciera: this.cuenta.codigoInstitucionFinanciera,
            monedaCuenta: this.cuenta.monedaCuenta,
            codigoAgrupacion: this.cuenta.codigoAgrupacion,
            codigoFrecuenciaActualizacion: this.cuenta.codigoFrecuenciaActualizacion,
            tipoCuenta: this.cuenta.tipoCuenta
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
              
              this.cuenta = this.cuentaForm.value;
              this.cuentasService.create(this.cuenta).subscribe({
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
                  this.router.navigate(['/cuentas'])
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
