import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { SaldosService } from '../../../../service/modules/private/operativo/saldos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Resumen } from '../../../../apis/model/module/private/resumen';
import { ResumenGeneralModalComponent } from "./resumen-general/resumen-general-modal.component";
import { Util } from '../../../../utils/util/util.util';
import { InstitucionFinancieraService } from '../../../../service/commons/institucion-financiera.service';
import { InstitucionFinancieraResponse } from '../../../../apis/model/module/private/commons/institucion-financiera-response';
import { Moneda } from '../../../../apis/model/commons/moneda';
import { SaldosCuentaSearch } from '../../../../apis/model/module/private/operativo/reportes/request/saldos-cuenta-search';
import { ReportesService } from '../../../../service/modules/private/operativo/reportes.service';
import { TipoMovimientoEnum, TipoMovimientoLabels } from '../../../../apis/model/enums/tipo-movimiento.enum';

@Component({
  selector: 'app-saldos',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    HeaderComponent, 
    ResumenGeneralModalComponent],
  providers: [ConfirmationService, MessageService, SaldosService],
  templateUrl: './saldos.component.html',
  styleUrl: './saldos.component.scss'
})
export class SaldosComponent {
  descargaForm: FormGroup;
  loading: boolean = false;
  resumenSaldos: boolean = false;
  resumen: Resumen = new Resumen();
  idEmpresa: string = "";
  messages: Message[] = [];
  descarga: boolean = false;
  public bancos: InstitucionFinancieraResponse[]=[];
  monedas: Moneda[] = Moneda.monedas;
  saldosCuentaRequest!: SaldosCuentaSearch;
  tiposMovimiento: any[] = [];

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly formBuilder: FormBuilder,
              private readonly router: Router, 
              private readonly saldosService: SaldosService,
              private readonly institucionFinancieraService: InstitucionFinancieraService,
              private readonly reportesService: ReportesService) {
      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }

    this.descargaForm = this.formBuilder.group({
      rangeDates:[[]],
      numeroCuenta: [''],
      codigoInstitucionFinanciera: [''],
      monedaCuenta: [''],
      tipoMovimiento: [''],
      concepto: ['']
    });
  }

  actualizarSaldosMovimientos() {
    this.loading = true;

    this.saldosService.actualizarSaldosMovimientosGeneral(Number(this.idEmpresa)).subscribe({
      next: () => {
        this.loading = false;  // Ocultar el spinner
        this.reloadPage();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/saldos']);
    });
  }

  mostrarResumen() {
    this.resumenSaldos = true;
  }

  mostrarReporte() {
    this.descarga = true;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe (params => {        
      this.saldosService.getSaldos(Number(this.idEmpresa)).subscribe(response => {
        this.resumen = response;
        
        this.cargarBanco();
        this.cargarTiposMovimiento();
      });
    })
  }

  transform(value: string, formato: string) {
    let datePipe = new DatePipe("en-US");
    return datePipe.transform(value, formato);
  }

  cerrarModal(): void {
    this.resumenSaldos = false;
  }

  filterNumeric(event: Event): void {
      Util.filterNumeric(event, this.descargaForm);
  }

  public cargarBanco(): void {
    this.institucionFinancieraService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response;
    });
  }

  generarReporte() {
    let fechaInicial;
    let fechaFinal;
    let lastWeek: Date;
    let today: Date;

    this.saldosCuentaRequest = this.descargaForm.value;

    let rangeDates: any[] = this.descargaForm.get('rangeDates')?.value || [];

    if (rangeDates.length>0) {
      lastWeek = rangeDates[0];
      fechaInicial = lastWeek.toISOString().split('T')[0];

      today = rangeDates[1];
      fechaFinal = today.toISOString().split('T')[0];
    } else {
      fechaInicial = "";
      fechaFinal = "";
    }

    this.saldosCuentaRequest.fechaInicio = fechaInicial;
    this.saldosCuentaRequest.fechaFin = fechaFinal;

    this.saldosCuentaRequest.codigoCliente = Number(this.idEmpresa)

    this.reportesService.descargarReporteSaldosMovimientos(this.saldosCuentaRequest).subscribe(response => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'reporte.xlsx';
      link.click();
    });
    
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
}
