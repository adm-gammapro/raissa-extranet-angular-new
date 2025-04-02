import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Paginator } from '../../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcesoService } from '../../../../../service/modules/private/operativo/proceso.service';
import { environment } from '../../../../../../environments/environment';
import { DetalleServicioEjecucionResponse } from '../../../../../apis/model/module/private/operativo/servicio/response/detalle-servicio-ejecucion-response';

@Component({
  selector: 'app-detalle-monitor',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './detalle-monitor.component.html',
  styleUrl: './detalle-monitor.component.scss'
})
export class DetalleMonitorComponent implements OnInit {
  detalleServicios!: DetalleServicioEjecucionResponse[];
  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng
  idEmpresa!: string;
  messages: Message[] = [];
  codigoBitacoraEjecucion!: number;

  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly procesoService: ProcesoService) {
    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let pagina = Number(params.get("pagina")) || 0;
      let cantReg = Number(params.get("cantReg")) || 5;
      let codigoBitacoraEjecucion = Number(params.get("codigoBitacoraEjecucion")) || 0;

      this.codigoBitacoraEjecucion = codigoBitacoraEjecucion;

      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;

      this.procesoService.getDetalleProcesosPage(this.paginator.numeroPagina, this.paginator.cantidadRegistros, codigoBitacoraEjecucion).subscribe(response => {
        this.detalleServicios = response.content as DetalleServicioEjecucionResponse[];

        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;
      });
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

  busqueda() {
    this.router.navigate(['/detalle-monitor',this.paginator.numeroPagina,this.paginator.cantidadRegistros,this.codigoBitacoraEjecucion]);
  }

  getEstadoProceso(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      R: 'Registrado',
      E: 'Ejecución',
      F: 'Finalizado',
      O: 'Finalizado con error'
    };
    return estadosMap[estado] || estado; // Devuelve el estado original si no está en el mapa
}
}