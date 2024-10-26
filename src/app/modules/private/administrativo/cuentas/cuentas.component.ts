import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { MenuComponent } from '../../layout/menu/menu.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CuentasService } from '../../../../service/modules/private/operativo/cuentas.service';
import { SaldosService } from '../../../../service/modules/private/operativo/saldos.service';
import { Cuentas } from '../../../../apis/model/module/private/cuentas';
import { AgrupacionService } from '../../../../service/modules/private/operativo/agrupacion.service';
import { Estado } from '../../../../apis/model/commons/estado';
import { Banco } from '../../../../apis/model/module/private/banco';
import { Agrupacion } from '../../../../apis/model/module/private/agrupacion';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';
import { CredencialesService } from '../../../../service/modules/private/operativo/credenciales.service';
import { Credenciales } from '../../../../apis/model/module/private/credenciales';
import { CredencialesCuentas } from '../../../../apis/model/module/private/credenciales-cuentas';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
    MenuComponent],
providers: [ConfirmationService, MessageService, CuentasService, SaldosService, AgrupacionService, CredencialesService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cuentas.component.html',
  styleUrl: './cuentas.component.scss'
})
export class CuentasComponent implements OnInit {
  public cuentas: Cuentas[] = [];
  numeroCuentaSearch:string | undefined;
  agrupacionSearch!:number | null;
  bancoSearch!:string;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  public cuentasSearchForm: FormGroup;
  estados: Estado[] = Estado.estados;
  idEmpresa: string = "";
  public agrupaciones: Agrupacion[] = [];
  public bancos: Banco[] = [];
  public credenciales: Credenciales[] = [];
  form: FormGroup;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private confirmationService: ConfirmationService, 
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private messagesService: MessagesService,
    private cuentasService: CuentasService,
    private saldosService: SaldosService,
    private agrupacionService: AgrupacionService,
    private credencialesService: CredencialesService) {

      this.cuentasSearchForm = this.formBuilder.group({
        numeroCuentaSearch: new FormControl(this.numeroCuentaSearch, [Validators.maxLength(50)]),
        agrupacionSearch: new FormControl(this.agrupacionSearch ),
        bancoSearch: new FormControl(this.bancoSearch ),
        estadoSearch: new FormControl('T'),
      });

      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }

      this.form = this.formBuilder.group({
        cuentas: this.formBuilder.array(this.cuentas.map(cuenta => this.formBuilder.group({
          numeroCuenta: [cuenta.numeroCuenta],
          nombreInstitucionFinanciera: [cuenta.nombreInstitucionFinanciera],
          monedaCuenta: [cuenta.monedaCuenta],
          descripcionAgrupacion: [cuenta.descripcionAgrupacion],
          descripcionFrecuenciaActualizacion: [cuenta.descripcionFrecuenciaActualizacion],
          estadoRegistro: [cuenta.estadoRegistro],
          codigoCredencial: [cuenta.codigoCredencial, Validators.required]
        })))
      });
  }

  get cuentasFormArray(): FormArray {
    return this.form.get('cuentas') as FormArray;
  }

  getAgrupaciones(): void {
    this.agrupacionService.getAllAgrupaciones(Number(this.idEmpresa)).subscribe(response => {
      this.agrupaciones = response as Agrupacion[];
    });
  }

  getBancos(): void {
    this.saldosService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response as Banco[];
    });
  }

  cambioPagina(event: any) {//este metodo se debe replicar en todas las tablas donde se quiera usar paginador
    if (event.primerRegistroVisualizado!=undefined) {
      this.paginator.primerRegistroVisualizado = event.primerRegistroVisualizado;
    }
    if (event.cantidadRegistros!=undefined) {
      this.paginator.cantidadRegistros = event.cantidadRegistros;
    }
    if (event.numeroPagina!=undefined) {
      this.paginator.numeroPagina = event.numeroPagina;
    }

    this.busqueda();
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.cuentasSearchForm);
  }

  esBotonDeshabilitado(cuentas: any): boolean {
    return cuentas.estadoRegistro === "INACTIVO";
  }

  eliminarFila(event: Event, cuentasParam: Cuentas) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
            this.cuentasService.eliminar(cuentasParam.codigo).subscribe(
              response => {
                const messages: Message[] = [
                  { severity: 'success', summary: 'Confirmación', detail: 'Registro dado de baja', life: 5000 }
                ];
                this.messagesService.setMessages(messages);
                this.reloadPage();
              }
            )
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  ngOnInit() {
    this.getAgrupaciones();
    this.getBancos();

    this.activatedRoute.paramMap.subscribe (params => {
      let pagina: number;
      let estadoRegistro: string;
      let numeroCuenta: string
      let cantReg: number;
      let idBanco: string
      let idAgrupacion: number;

      pagina = Number(params.get('pagina'));
      estadoRegistro = String(params.get('estadoRegistro'));
      numeroCuenta = String(params.get('numeroCuenta'));
      idBanco = String(params.get('idBanco'));
      idAgrupacion = Number(params.get('idAgrupacion'));
      cantReg = Number(params.get('cantReg'));

      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if(!numeroCuenta || numeroCuenta == "null"){
        this.numeroCuentaSearch = "";
      } else {
        this.numeroCuentaSearch = numeroCuenta;
      }

      if(!idBanco || idBanco == "null"){
        this.bancoSearch = "";
      } else {
        this.bancoSearch = idBanco;
      }

      if(!idAgrupacion){
        this.agrupacionSearch = 0;
      } else {
        this.agrupacionSearch = idAgrupacion;
      }

      if(!estadoRegistro || estadoRegistro == "null" || estadoRegistro == "T"){
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estadoRegistro;
      }
      
      if(!cantReg){
        this.paginator.cantidadRegistros = 5;
      } else {
        this.paginator.cantidadRegistros = cantReg;
      }

      this.cuentasService.getCuentas(this.paginator.numeroPagina,
                                    this.estadoSearch,
                                    this.numeroCuentaSearch,
                                    this.paginator.cantidadRegistros, 
                                    this.idEmpresa, 
                                    this.bancoSearch, 
                                    this.agrupacionSearch).subscribe(response => {
        this.cuentas = response.content as Cuentas[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if(!estadoRegistro || estadoRegistro == "T" || estadoRegistro == "null"){
          this.estadoSearch = "T";
        }

        if(!this.agrupacionSearch || this.agrupacionSearch == 0){
          this.agrupacionSearch = null;
        }

        this.credencialesService.getCredencialesPorEmpresa(Number(this.idEmpresa)).subscribe(response => {
          this.credenciales = response as Credenciales[];
        });

        this.cuentasSearchForm.patchValue({
          numeroCuentaSearch: this.numeroCuentaSearch,
          agrupacionSearch: this.agrupacionSearch,
          bancoSearch: this.bancoSearch,
          estadoSearch: this.estadoSearch
        });

        this.form = this.formBuilder.group({
          cuentas: this.formBuilder.array(this.cuentas.map(cuenta => this.formBuilder.group({
            numeroCuenta: [cuenta.numeroCuenta],
            nombreInstitucionFinanciera: [cuenta.nombreInstitucionFinanciera],
            monedaCuenta: [cuenta.monedaCuenta],
            descripcionAgrupacion: [cuenta.descripcionAgrupacion],
            descripcionFrecuenciaActualizacion: [cuenta.descripcionFrecuenciaActualizacion],
            estadoRegistro: [cuenta.estadoRegistro],
            codigoCredencial: [cuenta.codigoCredencial, Validators.required]
          })))
        });
        
      });
    });

    this.messages = this.messagesService.getMessages();

  }

  busqueda() {
    this.numeroCuentaSearch = this.cuentasSearchForm.controls['numeroCuentaSearch'].value;
    this.estadoSearch = this.cuentasSearchForm.controls['estadoSearch'].value;
    this.bancoSearch = this.cuentasSearchForm.controls['bancoSearch'].value;
    this.agrupacionSearch = this.cuentasSearchForm.controls['agrupacionSearch'].value;
    if (this.numeroCuentaSearch === null) {
      this.numeroCuentaSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }
    if (this.bancoSearch === null) {
      this.bancoSearch = "";
    }
    if (this.agrupacionSearch === null) {
      this.agrupacionSearch = 0;
    }
    this.router.navigate(['/cuentas',this.paginator.numeroPagina,this.estadoSearch,this.numeroCuentaSearch,this.paginator.cantidadRegistros,this.bancoSearch, this.agrupacionSearch]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cuentas']);
    });
  }

  onCredencialChange(event: any, codigoCuenta: number) {
    const codigoCredencialSeleccionado = event.value;

    let cuentaCredencial: CredencialesCuentas = new CredencialesCuentas();
    cuentaCredencial.codigoCredencial = codigoCredencialSeleccionado;
    cuentaCredencial.codigoCuenta = codigoCuenta;
    // Llama al servicio o método para registrar la relación
    this.vincularCredencial(cuentaCredencial);
  }

  public vincularCredencial(credencial: CredencialesCuentas) {
    
    this.cuentasService.vincularCredencial(credencial).subscribe({
      next:() => {
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Se vinculó credencial correctamente', life: 5000 });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
      }
    });
  }
    
}
