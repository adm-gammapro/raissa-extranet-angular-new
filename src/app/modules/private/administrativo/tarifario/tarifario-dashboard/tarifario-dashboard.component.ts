import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  TarifarioDashboardResponse
} from '../../../../../apis/model/module/private/administrativo/tarifario/response/tarifario-dashboard-response';
import {Subscription} from 'rxjs';
import {TarifarioService} from '../../../../../service/modules/private/administrativo/tarifario.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DatePipe, DecimalPipe, NgClass} from '@angular/common';
import {ProgressBar} from 'primeng/progressbar';
import {ProgressSpinner} from 'primeng/progressspinner';
import {AgrupacionService} from '../../../../../service/modules/private/operativo/agrupacion.service';
import {HeaderComponent} from '../../../layout/header/header.component';

@Component({
  selector: 'app-tarifario-dashboard',
  imports: [
    CommonModule,
    NgClass,
    DatePipe,
    DecimalPipe,
    ProgressBar,
    ProgressSpinner,
    HeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './tarifario-dashboard.component.html',
  styleUrl: './tarifario-dashboard.component.scss'
})
export class TarifarioDashboardComponent implements OnInit, OnDestroy {
  dashboardData: TarifarioDashboardResponse | null = null;
  loading: boolean = false;
  clienteId: number = 1; // Esto deberías obtenerlo de tu servicio de autenticación o por parámetro
  private readonly subscriptions: Subscription = new Subscription();

  // Configuración para el gráfico de progreso
  progressConfig: any;

  constructor(private readonly tarifarioService: TarifarioService,
              private readonly messageService: MessageService) {
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarDashboard(): void {
    this.loading = true;
    const subscription = this.tarifarioService.obtenerDashboard(this.clienteId).subscribe({
      next: (response) => {
        this.dashboardData = response;
        this.initializeProgressConfig();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del dashboard',
          life: 5000
        });
        this.loading = false;
      }
    });
    this.subscriptions.add(subscription);
  }

  private initializeProgressConfig(): void {
    if (this.dashboardData) {
      this.progressConfig = {
        porcentajeConsumo: this.dashboardData.porcentajeConsumo,
        usuariosUtilizados: this.dashboardData.usuariosUtilizados,
        usuariosContratados: this.dashboardData.usuariosContratados
      };
    }
  }

  getEstadoSuscripcion(): string {
    if (!this.dashboardData) return '';
    if (!this.dashboardData.suscripcionActiva) return 'danger';
    if (this.dashboardData.periodoPrueba) return 'warning';
    return 'success';
  }

  getDiasRestantesClase(): string {
    if (!this.dashboardData) return '';
    const dias = this.dashboardData.diasRestantes;
    if (dias <= 0) return 'danger';
    if (dias <= 7) return 'warning';
    return 'success';
  }

  // Método para calcular el porcentaje de usuarios utilizados
  getPorcentajeUsuarios(): number {
    if (!this.dashboardData || this.dashboardData.usuariosContratados === 0) return 0;
    return (this.dashboardData.usuariosUtilizados / this.dashboardData.usuariosContratados) * 100;
  }

  // Método para calcular el porcentaje de consumos utilizados
  getPorcentajeConsumos(): number {
    if (!this.dashboardData || this.dashboardData.consumosContratados === 0) return 0;
    return (this.dashboardData.consumosUtilizados / this.dashboardData.consumosContratados) * 100;
  }

  // Método para obtener el color de la barra de progreso de usuarios
  getColorProgresoUsuarios(): string {
    const porcentaje = this.getPorcentajeUsuarios();
    if (porcentaje >= 90) return 'p-progressbar-danger';
    if (porcentaje >= 70) return 'p-progressbar-warning';
    return '';
  }

  // Método para obtener el color de la barra de progreso de consumos
  getColorProgresoConsumos(): string {
    const porcentaje = this.getPorcentajeConsumos();
    if (porcentaje >= 90) return 'p-progressbar-danger';
    if (porcentaje >= 70) return 'p-progressbar-warning';
    return '';
  }

  // Método para obtener el color del texto del porcentaje
  getPorcentajeColor(): string {
    if (!this.dashboardData) return '';
    const porcentaje = this.dashboardData.porcentajeConsumo;
    if (porcentaje >= 90) return 'text-red-500';
    if (porcentaje >= 70) return 'text-orange-500';
    return 'text-green-500';
  }
}
