import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DetalleSaldos } from '../../../../../apis/model/module/private/detalle-saldos';
import { TipoMovimientoEnum, TipoMovimientoLabels } from '../../../../../apis/model/enums/tipo-movimiento.enum';
import { Paginator } from '../../../../../apis/model/commons/paginator';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent],
  providers: [ConfirmationService, MessageService, SaldosService],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss'
})
export class MovimientosComponent {
  public detalleSaldos: DetalleSaldos[] = [];
  public idBanco: string | null = "";
  public paginador: any;
  public numeroPagina: number = 0;
  public cantidadRegistros: number = 5;
  public idCuenta: number = 0;
  public bitacora: number = 0;
  public nombreBanco = "";
  public numeroCuenta = "";
  public monedacuenta = "";
  idEmpresa: string = "";
  messages: Message[] = [];

  tiposMovimiento: any[] = [];

  public tipoSeleccionado: any; 
  rangeDates!: Date[] | [];

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router, 
              private readonly saldosService: SaldosService) {
      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }
      this.cargarTiposMovimiento();

      this.tipoSeleccionado = TipoMovimientoEnum.TODOS;
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

  cargarTiposMovimiento() {
    this.tiposMovimiento = Object.keys(TipoMovimientoEnum).map(key => {
      const enumKey = key as keyof typeof TipoMovimientoEnum; 
      return {
        label: TipoMovimientoLabels[TipoMovimientoEnum[enumKey]], 
        value: TipoMovimientoEnum[enumKey]                        
      };
    });
  }

  busqueda() {
    let fechaInicial;
    let fechaFinal;
    let lastWeek: Date;
    let today: Date;

    if (this.tipoSeleccionado === null || this.tipoSeleccionado === TipoMovimientoEnum.TODOS) {
      this.tipoSeleccionado = TipoMovimientoEnum.TODOS;
    } 

    if (this.rangeDates.length>0) {
      lastWeek = this.rangeDates[0];
      fechaInicial = lastWeek.toISOString().split('T')[0];

      today = this.rangeDates[1];
      fechaFinal = today.toISOString().split('T')[0];
    } else {
      fechaInicial = "-";
      fechaFinal = "-";
    }
    

    this.router.navigate(['/movimientos', this.idCuenta,this.bitacora, this.idBanco, fechaInicial, fechaFinal, this.tipoSeleccionado, this.paginator.cantidadRegistros, this.paginator.numeroPagina]);
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.idCuenta = Number(params.get('idCuenta'));
      this.bitacora = Number(params.get('bitacora'));
      this.idBanco = params.get('idBanco');

      let pagina: number;
      let fechaInicial: string;
      let fechaFinal: string;
      let cantReg: number;
      let tipoMovimiento: string;
      let today!: Date;
      let lastWeek!: Date;

      pagina = Number(params.get('pagina'));
      fechaInicial = String(params.get('fechaInicial'));
      fechaFinal = String(params.get('fechaFinal'));
      cantReg = Number(params.get('cantReg'));
      tipoMovimiento = String(params.get('tipoMovimiento'));
                      
      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }
      
      if(!cantReg){
        this.paginator.cantidadRegistros = 5;
      } else {
        this.paginator.cantidadRegistros = cantReg;
      }

      if(!fechaInicial || fechaInicial === "null" || fechaInicial === "" || fechaInicial === "-") {
        lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 14);
        fechaInicial = lastWeek.toISOString().split('T')[0];
      } else {
        const [year, month, day] = fechaInicial.split('-').map(Number);
        lastWeek = new Date(year, month - 1, day); 
        fechaInicial = lastWeek.toISOString().split('T')[0];
      }

      if(!fechaFinal || fechaFinal == "null" || fechaFinal == "" || fechaFinal == "-"){
        today = new Date();
        fechaFinal = today.toISOString().split('T')[0];
      } else {
        const [year, month, day] = fechaFinal.split('-').map(Number);
        today = new Date(year, month - 1, day); 
        fechaFinal = today.toISOString().split('T')[0];
      }

      this.rangeDates = [lastWeek, today];

      if (!tipoMovimiento || tipoMovimiento == "null" || tipoMovimiento == "" || tipoMovimiento == undefined) {
        this.tipoSeleccionado = TipoMovimientoEnum.TODOS;
        tipoMovimiento =  TipoMovimientoEnum.TODOS;;
      } else {
        this.tipoSeleccionado = tipoMovimiento;
      }

      this.saldosService.getMovimientos(Number(this.idEmpresa),this.idCuenta, fechaInicial, fechaFinal, tipoMovimiento, this.paginator.cantidadRegistros, this.paginator.numeroPagina).subscribe(response => {
        this.detalleSaldos = response.movimientos.content as DetalleSaldos[];
        this.paginador = response.movimientos;
        this.nombreBanco = response.nombreBanco;
        this.numeroCuenta = response.numeroCuenta;
        this.monedacuenta = response.moneda;

        this.paginator.totalRegistros = response.movimientos.totalElements;
        this.paginator.primerRegistroVisualizado = response.movimientos.pageable.offset;
      });
    })
  }
}
