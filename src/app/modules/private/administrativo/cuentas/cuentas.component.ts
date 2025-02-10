import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CuentasService } from '../../../../service/modules/private/operativo/cuentas.service';
import { Cuentas } from '../../../../apis/model/module/private/cuentas';
import { AgrupacionService } from '../../../../service/modules/private/operativo/agrupacion.service';
import { Estado } from '../../../../apis/model/commons/estado';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';
import { CuentaResponse } from '../../../../apis/model/module/private/operativo/cuenta/response/cuenta-response';
import { AgrupacionResponse } from '../../../../apis/model/module/private/operativo/agrupacion/response/agrupacion-response';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';
import { CuentaCredencialRequest } from '../../../../apis/model/module/private/operativo/cuenta/request/cuenta-credencial-request';
import { CredencialesResponse } from '../../../../apis/model/module/private/operativo/credenciales/response/credenciales-response';
import { CredencialesService } from '../../../../service/modules/private/operativo/credenciales.service';
import { InstitucionFinancieraService } from '../../../../service/commons/institucion-financiera.service';
import { InstitucionFinancieraResponse } from '../../../../apis/model/module/private/commons/institucion-financiera-response';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
    EstadoRegistroLabelPipe],
providers: [ConfirmationService, MessageService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cuentas.component.html',
  styleUrl: './cuentas.component.scss'
})
export class CuentasComponent implements OnInit {
  cuentas: CuentaResponse[] = [];
  numeroCuentaSearch:string | undefined;
  agrupacionSearch:number | null = null;
  bancoSearch:string | undefined;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  cuentasSearchForm: FormGroup;
  credencialForm: FormGroup;
  estados: Estado[] = Estado.estados;
  idEmpresa: string = "";
  agrupaciones: AgrupacionResponse[] = [];
  bancos: InstitucionFinancieraResponse[] = [];
  visibleVinculoCredenciales: boolean = false;
  idCuentaVincular!: number;
  credenciales!: CredencialesResponse[];
  cuentaCredencialRequest!: CuentaCredencialRequest;
  idBancoVincular!: string;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService, 
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router, 
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly cuentasService: CuentasService,
    private readonly agrupacionService: AgrupacionService,
    private readonly credencialesService: CredencialesService,
    private readonly institucionFinancieraService: InstitucionFinancieraService) {

      this.cuentasSearchForm = this.formBuilder.group({
        numeroCuentaSearch: [''],
        agrupacionSearch: [''],
        bancoSearch: [''],
        estadoSearch: ['T'],
      });

      this.credencialForm = this.formBuilder.group({
        codigo: [null],
        codigoCuenta: [null],
        codigoCredencial: [null]
      }); 

      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }
  }

  getAgrupaciones(): void {
    this.agrupacionService.getAllAgrupaciones(Number(this.idEmpresa)).subscribe(response => {
      this.agrupaciones = response;
    });
  }

  getBancos(): void {
    this.institucionFinancieraService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response;
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

  esBotonDeshabilitado(cuenta: CuentaResponse): boolean {
    return Util.mapEstadoRegistro(cuenta.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
  }

  showDialogCredencial(codigoCuenta: number) {
    this.idCuentaVincular = codigoCuenta;
    this.getCredencialesPorCuenta(codigoCuenta);
    this.visibleVinculoCredenciales = true;
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
        this.cuentasService.eliminar(cuentasParam.codigo, Number(this.idEmpresa)).subscribe({
          next: () => {
            const messages: Message[] = [
              { severity: 'success', summary: 'Confirmación', detail: 'Registro dado de baja', life: 5000 }
            ];
            this.messagesService.setMessages(messages);
            this.reloadPage();
          },
          error: (err) => {
            console.error('Error al vincular credencial:', Util.validaMensajeError(err));
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  ngOnInit() {
    this.getAgrupaciones();
    this.getBancos();
    this.getCredenciales();

    this.activatedRoute.paramMap.subscribe (params => {
      let pagina = Util.parseOrDefault(params.get('pagina'), 0);
      let estadoRegistro = params.get('estadoRegistro') ?? "T";
      let numeroCuenta = params.get('numeroCuenta') ?? "";
      let idBanco = params.get('idBanco') ?? "";
      let idAgrupacion = (params.get('idAgrupacion') !== null && params.get('idAgrupacion') !== "0") ? Number(params.get('idAgrupacion')) : null;
      let cantReg = Util.parseOrDefault(params.get('cantReg'),5);

      this.paginator.numeroPagina = pagina;

      this.bancoSearch = idBanco;
      this.agrupacionSearch = idAgrupacion;
      this.numeroCuentaSearch = numeroCuenta;

      if(estadoRegistro == "T"){
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estadoRegistro;
      }

      this.paginator.cantidadRegistros = cantReg;


      this.cuentasService.getCuentas(pagina,
                                    this.estadoSearch,
                                    numeroCuenta,
                                    cantReg, 
                                    Number(this.idEmpresa), 
                                    idBanco, 
                                    idAgrupacion).subscribe(response => {
        this.cuentas = response.content;
        //estos valores se usan para actualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        this.estadoSearch = estadoRegistro;

        this.cuentasSearchForm.patchValue({
          numeroCuentaSearch: this.numeroCuentaSearch,
          agrupacionSearch: this.agrupacionSearch,
          bancoSearch: this.bancoSearch,
          estadoSearch: this.estadoSearch
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
    if (this.numeroCuentaSearch === undefined) {
      this.numeroCuentaSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }
    if (this.bancoSearch === undefined) {
      this.bancoSearch = "";
    }
    if (this.agrupacionSearch === undefined || this.agrupacionSearch === null) {
      this.agrupacionSearch = 0;
    }
    this.router.navigate(['/cuentas',this.paginator.numeroPagina,this.estadoSearch,this.numeroCuentaSearch,this.paginator.cantidadRegistros,this.bancoSearch, this.agrupacionSearch]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/cuentas']);
    });
  }
   
  async vincularCredenciales() {
    this.cuentaCredencialRequest = this.credencialForm.value;
    this.cuentaCredencialRequest.codigoCuenta = this.idCuentaVincular;
    this.cuentaCredencialRequest.codigoCliente = Number(this.idEmpresa);

    this.cuentasService.registrarVinculoCuentaCredencial(this.cuentaCredencialRequest).subscribe({
      next: () => {
        const messages: Message[] = [
          { severity: 'success', summary: 'Confirmación', detail: 'Se guardó correctamente', life: 5000 }
        ];
        this.messagesService.setMessages(messages);
        this.reloadPage();
      },
      error: (err) => {
        console.error('Error en el registro:', Util.validaMensajeError(err));
      }
    });
  }

  getCredenciales(): void {
    this.credencialesService.getCredencialesPorEmpresa(Number(this.idEmpresa)).subscribe(response => {
      this.credenciales = response;
    });
  }

  getCredencialesPorCuenta(codigoCuenta: number) {
    this.cuentasService.getCredencialesCuenta(codigoCuenta, Number(this.idEmpresa)).subscribe(response => {
      let cuentaCredencial = response;

      this.credencialForm.patchValue({
        codigo: cuentaCredencial.codigo,
        codigoCuenta: cuentaCredencial.codigoCuenta,
        codigoCredencial: cuentaCredencial.codigoCredencial
      });
    });
  }
}
