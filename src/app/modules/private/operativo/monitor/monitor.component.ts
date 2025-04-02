import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ServicioEjecucionResponse } from '../../../../apis/model/module/private/operativo/servicio/response/servicio-ejecucion-response';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcesoService } from '../../../../service/modules/private/operativo/proceso.service';
import { interval, Subscription, switchMap } from 'rxjs';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';


@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      ...PRIME_NG_MODULES,
      PaginatorComponent,
      HeaderComponent],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss'
})
export class MonitorComponent implements OnInit, OnDestroy {
    value: number = 0;
    messages: Message[] = [];
    interval: any;
    procesos!: ServicioEjecucionResponse[];
    rangeDates!: Date[] | [];
    paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng
    actualizacionSub!: Subscription;
    idEmpresa!: string;

    constructor(private readonly router: Router,
                private readonly activatedRoute: ActivatedRoute,
                private readonly procesoService: ProcesoService) {
        if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
            this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
        }
    }

    cambioPagina(event: any) {//este metodo se debe replicar en todas las tablas donde se quiera usar paginador
        if (event.primerRegistroVisualizado != undefined) {
            this.paginator.primerRegistroVisualizado = event.primerRegistroVisualizado;
        }
        if (event.cantidadRegistros != undefined) {
            this.paginator.cantidadRegistros = event.cantidadRegistros;
        }
        if (event.numeroPagina != undefined) {
            this.paginator.numeroPagina = event.numeroPagina;
        }

        this.busqueda();
    }

    busqueda() {
        let fechaInicial;
        let fechaFinal;
        let lastWeek: Date;
        let today: Date;

        if (this.rangeDates.length > 0) {
            lastWeek = this.rangeDates[0];
            fechaInicial = lastWeek.toISOString().split('T')[0];

            today = this.rangeDates[1];
            fechaFinal = today.toISOString().split('T')[0];
        } else {
            fechaInicial = "-";
            fechaFinal = "-";
        }


        this.router.navigate(['/monitor', fechaInicial, fechaFinal, this.paginator.cantidadRegistros, this.paginator.numeroPagina]);
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {        
            let pagina = Number(params.get("pagina")) || 0;
            let cantReg = Number(params.get("cantReg")) || 5;
            let fechaInicial = params.get("fechaInicio");
            let fechaFinal = params.get("fechaFinal");
      
            this.paginator.numeroPagina = pagina;
            this.paginator.cantidadRegistros = cantReg;
      
            const today = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 14);
      
            fechaInicial = fechaInicial && fechaInicial !== "null" && fechaInicial !== "-" ? fechaInicial : lastWeek.toISOString().split("T")[0];
            fechaFinal = fechaFinal && fechaFinal !== "null" && fechaFinal !== "-" ? fechaFinal : today.toISOString().split("T")[0];
      
            this.rangeDates = [this.parseFechaLocal(fechaInicial), this.parseFechaLocal(fechaFinal)];

            this.cargarProcesos(fechaInicial, fechaFinal);

            this.actualizacionSub = interval(10000)
            .pipe(switchMap(() => this.procesoService.getProcesosPage(this.paginator.numeroPagina, fechaInicial, fechaFinal, this.paginator.cantidadRegistros, Number(this.idEmpresa))))
            .subscribe(response => {
              this.procesos = response.content as any[];
              this.actualizarProgreso();
            });
        });
    }

    cargarProcesos(fechaInicial: string, fechaFinal: string) {
        this.procesoService.getProcesosPage(this.paginator.numeroPagina, fechaInicial, fechaFinal, this.paginator.cantidadRegistros, Number(this.idEmpresa))
            .subscribe(response => {
                this.procesos = response.content as any[];
                this.paginator.totalRegistros = response.totalElements;
                this.paginator.primerRegistroVisualizado = response.pageable.offset;

                this.actualizarProgreso();
            });
    }

    actualizarProgreso() {
        this.procesos.forEach(proceso => {
            proceso.valuesProgreso = [
                { label: "Procesadas", color: "#34d399", value: (proceso.registrosProcesados / proceso.registrosTotales) * 100 },
                { label: "Erroneas", color: "#f44336", value: (proceso.registrosErrados / proceso.registrosTotales) * 100 },
                { label: "Pendientes", color: "#fbbf24", value: (proceso.registrosPendientes / proceso.registrosTotales) * 100 }
            ];
        });
    }

    ngOnDestroy() {
        if (this.actualizacionSub) {
            this.actualizacionSub.unsubscribe();
        }
    }

    esBotonDeshabilitado(proceso: ServicioEjecucionResponse): boolean {
        return Util.mapEstadoRegistro(proceso.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
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

    parseFechaLocal(fechaString: string): Date {
        const [year, month, day] = fechaString.split('-').map(Number);
        return new Date(year, month - 1, day); // Restamos 1 al mes porque en JS los meses van de 0 a 11
    }
}
