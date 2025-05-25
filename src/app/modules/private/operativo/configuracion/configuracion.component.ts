import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../../service/modules/private/operativo/configuracion.service';
import { AplicacionEntorno } from '../../../../apis/model/module/private/aplicacion-entorno';
import { ServicioCliente } from '../../../../apis/model/module/private/servicio-cliente';
import { JobCliente } from '../../../../apis/model/module/private/job-cliente';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { MessagesService } from '../../../../service/commons/messages.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES, 
    HeaderComponent,
    RouterLink],
providers: [ConfirmationService, MessageService, ConfiguracionService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent {
  private idEmpresa: string = "";
  private aplicacionEntorno!: AplicacionEntorno;
  private servicioCliente!: ServicioCliente;
  public listarJobCliente: JobCliente[] = [];
  public codigoServicioCliente: number = 0;

  constructor(private readonly router: Router,
              private readonly configuracionService: ConfiguracionService,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly confirmationService: ConfirmationService) {
    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  eliminarFila(event: Event, jobCliente: JobCliente) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: '¿Está seguro de dar de baja este registro?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"Si",
        rejectIcon:"No",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.configuracionService.delete(jobCliente.codigoJobCliente).subscribe(
                response => {
                  this.messagesService.setMessages('Registro dado de baja.');
                  this.reloadPage();
                }
              )
        },
        reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
        }
      });
  }

  esBotonDeshabilitado(jobCliente: JobCliente): boolean {
    return jobCliente.estadoRegistro === "INACTIVO";
  }

  ngOnInit() {
    this.configuracionService.getAplicacionEntorno(this.idEmpresa).subscribe(response => {
      this.aplicacionEntorno = response;

      this.configuracionService.getServicioCliente(Number(this.idEmpresa), this.aplicacionEntorno.codigoAplicacionEntorno).subscribe(response => {
        this.servicioCliente = response;

        this.codigoServicioCliente = this.servicioCliente.codigoServicioCliente;
        this.configuracionService.getJobs(this.codigoServicioCliente).subscribe(response => {
          this.listarJobCliente = response;
        });
      });
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/configuracion']);
    });
  }
}
