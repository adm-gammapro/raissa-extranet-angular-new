import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SaldosService } from '../../../../service/modules/private/operativo/saldos.service';
import { Resumen } from '../../../../apis/model/module/private/resumen';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [FormsModule,
            ReactiveFormsModule,
            CommonModule,
            ...PRIME_NG_MODULES,
            HeaderComponent,
            RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit {
  dataSoles: any;
  optionsSoles: any;
  dataDolares: any;
  optionsDolares: any;
  resumen: Resumen = new Resumen();
  idEmpresa: string = "";
  descarga: boolean = false;

  platformId = inject(PLATFORM_ID);

  constructor(private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly saldosService: SaldosService,
    private readonly cd: ChangeDetectorRef) {

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }

  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.saldosService.getSaldos(Number(this.idEmpresa)).subscribe(response => {
        this.resumen = response;

        this.initChart();
      });
    })
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      this.initDoughnutCharts(documentStyle, textColor);

      this.cd.markForCheck();
    }
  }

  private initDoughnutCharts(documentStyle: CSSStyleDeclaration, textColor: string) {
    const toNumber = (value: number | null | undefined) =>
    typeof value === 'number' ? value : 0;

    const bancosSoles = this.resumen.saldosBanco.filter(b => toNumber(b.saldoDisponibleSoles) > 0);
    const totalSoles = bancosSoles.reduce((sum, b) => sum + toNumber(b.saldoDisponibleSoles), 0);

    const bancosDolares = this.resumen.saldosBanco.filter(b => toNumber(b.saldoDisponibleDolares) > 0);
    const totalDolares = bancosDolares.reduce((sum, b) => sum + toNumber(b.saldoDisponibleDolares), 0);

    const defaultColorVar = '--surface-500';
    const defaultHoverVar = '--surface-400';

    this.dataSoles = {
      labels: bancosSoles.map(b => {
        const porcentaje = totalSoles > 0
          ? ((toNumber(b.saldoDisponibleSoles) / totalSoles) * 100).toFixed(2)
          : '0.00';
        return `${b.abreviaturaBanco} (${porcentaje}%)`;
      }),
      datasets: [
        {
          data: bancosSoles.map(b => toNumber(b.saldoDisponibleSoles)),
          backgroundColor: bancosSoles.map(b => {
            const colorVar = typeof b.color === 'string' ? b.color : defaultColorVar;
            const value = documentStyle.getPropertyValue(colorVar);
            return value || documentStyle.getPropertyValue(defaultColorVar);
          }),
          hoverBackgroundColor: bancosSoles.map(b => {
            const baseColorVar = typeof b.color === 'string' ? b.color : defaultHoverVar;
            const hoverVar = baseColorVar.includes('500')
              ? baseColorVar.replace('500', '400')
              : baseColorVar;
            const value = documentStyle.getPropertyValue(hoverVar);
            return value || documentStyle.getPropertyValue(defaultHoverVar);
          }),
        },
      ],
    };

    this.dataDolares = {
      labels: bancosDolares.map(b => {
        const porcentaje = totalDolares > 0
          ? ((toNumber(b.saldoDisponibleDolares) / totalDolares) * 100).toFixed(2)
          : '0.00';
        return `${b.abreviaturaBanco} (${porcentaje}%)`;
      }),
      datasets: [
        {
          data: bancosDolares.map(b => toNumber(b.saldoDisponibleDolares)),
          backgroundColor: bancosDolares.map(b => {
            const colorVar = typeof b.color === 'string' ? b.color : defaultColorVar;
            const value = documentStyle.getPropertyValue(colorVar);
            return value || documentStyle.getPropertyValue(defaultColorVar);
          }),
          hoverBackgroundColor: bancosDolares.map(b => {
            const baseColorVar = typeof b.color === 'string' ? b.color : defaultHoverVar;
            const hoverVar = baseColorVar.includes('500')
              ? baseColorVar.replace('500', '400')
              : baseColorVar;
            const value = documentStyle.getPropertyValue(hoverVar);
            return value || documentStyle.getPropertyValue(defaultHoverVar);
          }),
        },
      ],
    };

    this.optionsSoles = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: textColor,
            padding: 20,
            font: { size: 14 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: S/ ${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
      cutout: '30%',
      responsive: true,
      maintainAspectRatio: false,
    };

    this.optionsDolares = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: textColor,
            padding: 20,
            font: { size: 14 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $ ${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 11,
          },
          formatter: (value: number, context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          display: (context: any) => {
            const value = context.dataset.data[context.dataIndex];
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = (value / total) * 100;
            return percentage > 5;
          },
        },
      },
      cutout: '30%',
      responsive: true,
      maintainAspectRatio: false,
    };
  }
}
