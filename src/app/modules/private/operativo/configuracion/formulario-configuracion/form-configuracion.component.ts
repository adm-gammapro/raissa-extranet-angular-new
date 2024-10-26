import { Component } from '@angular/core';
import { Configuracion } from '../../../../../apis/model/module/private/configuracion';
import { JobClienteProgramacion } from '../../../../../apis/model/module/private/Job-cliente-programacion';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../../../service/modules/private/operativo/configuracion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { Util } from '../../../../../utils/util/util.util';
import { ConfiguracionForm } from '../../../../../apis/model/module/private/configuracion-form';

@Component({
  selector: 'app-form-configuracion',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, ConfiguracionService],
  templateUrl: './form-configuracion.component.html',
  styleUrl: './form-configuracion.component.scss'
})
export class FormConfiguracionComponent {
  public configuracion: Configuracion = new Configuracion();
  public job: JobClienteProgramacion = new JobClienteProgramacion();
  public listJobs: JobClienteProgramacion[] = [];
  public codigoServicioCliente: number = 0;
  public configuracionForm: FormGroup;
  public configuracionFormulario: ConfiguracionForm = new ConfiguracionForm();
  public datos;

  constructor(private router: Router, 
    private confirmationService: ConfirmationService, 
    private formBuilder: FormBuilder,
    private messageService: MessageService, 
    private configuracionService: ConfiguracionService, 
    private activatedRoute: ActivatedRoute,
    private messagesService: MessagesService) {

    this.configuracionForm = this.formBuilder.group({
        codigoJobCliente: [''],
        descripcionJobCliente: ['', Validators.required],
        inputGroupLunes: [''],
        inputGroupMartes: [''],
        inputGroupMiercoles: [''],
        inputGroupJueves: [''],
        inputGroupViernes: [''],
        inputGroupSabado: [''],
        inputGroupDomingo: [''],
        codigoGroupLunes: [0],
        codigoGroupMartes: [0],
        codigoGroupMiercoles: [0],
        codigoGroupJueves: [0],
        codigoGroupViernes: [0],
        codigoGroupSabado: [0],
        codigoGroupDomingo: [0],
        nombreServicioAplicacion: ['']
    });

    this.datos = [
      { label: '00:00', value: '00:00:00' },
      { label: '01:00', value: '01:00:00' },
      { label: '02:00', value: '02:00:00' },
      { label: '03:00', value: '03:00:00' },
      { label: '04:00', value: '04:00:00' },
      { label: '05:00', value: '05:00:00' },
      { label: '06:00', value: '06:00:00' },
      { label: '07:00', value: '07:00:00' },
      { label: '08:00', value: '08:00:00' },
      { label: '09:00', value: '09:00:00' },
      { label: '10:00', value: '10:00:00' },
      { label: '11:00', value: '11:00:00' },
      { label: '12:00', value: '12:00:00' },
      { label: '13:00', value: '13:00:00' },
      { label: '14:00', value: '14:00:00' },
      { label: '15:00', value: '15:00:00' },
      { label: '16:00', value: '16:00:00' },
      { label: '17:00', value: '17:00:00' },
      { label: '18:00', value: '18:00:00' },
      { label: '19:00', value: '19:00:00' },
      { label: '20:00', value: '20:00:00' },
      { label: '21:00', value: '21:00:00' },
      { label: '22:00', value: '22:00:00' },
      { label: '23:00', value: '23:00:00' },
    ];
  
  }

  public guardar(): void {
    this.listJobs = [];

    this.configuracionFormulario = this.configuracionForm.value;

    if (this.configuracionFormulario.inputGroupLunes === "" &&
      this.configuracionFormulario.inputGroupMartes === "" &&
      this.configuracionFormulario.inputGroupMiercoles === "" &&
      this.configuracionFormulario.inputGroupJueves === "" &&
      this.configuracionFormulario.inputGroupViernes === "" &&
      this.configuracionFormulario.inputGroupSabado === "" &&
      this.configuracionFormulario.inputGroupDomingo === "") {

      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Para guardar una configuración, debe seleccionar al menos un horario',
        life: 5000
      });

      return;
    } 

    if (this.configuracionForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Hay campos no válidos en el formulario',
        life: 5000
      });

    } else {
      if (this.configuracionFormulario.inputGroupLunes != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "L";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupLunes;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupLunes;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupMartes != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "M";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupMartes;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupMartes;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupMiercoles != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "I";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupMiercoles;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupMiercoles;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupJueves != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "J";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupJueves;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupJueves;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupViernes != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "V";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupViernes;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupViernes;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupSabado != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "S";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupSabado;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupSabado;
        this.listJobs.push(this.job);
      }
      if (this.configuracionFormulario.inputGroupDomingo != "") {
        this.job = new JobClienteProgramacion();
        this.job.dia = "D";
        this.job.estadoRegistro = "S";
        this.job.hora = this.configuracionFormulario.inputGroupDomingo;
        this.job.codigoJobClienteProgramacion = this.configuracionFormulario.codigoGroupDomingo;
        this.listJobs.push(this.job);
      }
      this.configuracion.codigoServicioCliente = this.codigoServicioCliente;
      this.configuracion.descripcionJobCliente = this.configuracionFormulario.descripcionJobCliente;
      this.configuracion.listaJobClienteProgramacion = this.listJobs;


        this.confirmationService.confirm({
            message: '¿Está seguro de realizar esta acción?',
            header: 'Mensaje de validación!',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon:"Si",
            rejectIcon:"No",
            rejectButtonStyleClass:"p-button-text",
            accept: () => {
              if (this.configuracion.codigoJobCliente == null || this.configuracion.codigoJobCliente == 0) {
                this.configuracionService.create(this.configuracion).subscribe({
                  next:(response) => {
                    const messages: Message[] = [
                      { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro existosamente`, life: 5000 }
                    ];
                    this.messagesService.setMessages(messages);
                  },
                  error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un error al registrar configuración', life: 5000 });
                  },
                  complete: () => {
                    this.router.navigate(['/configuracion'])
                  }
                });
              } else {
                
              }
            },
            reject: () => {
              this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se realizó registro', life: 5000 });
            }
        });
    }
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.configuracionForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.configuracionForm);
  }

  public cargarConfiguracion(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      let codigoServicioCliente = params['codigoServicioCliente']
      if (codigoServicioCliente != 0) {
        this.codigoServicioCliente = codigoServicioCliente;
      }
      if (id != 0) {
        this.configuracionService.getConfiguracion(id).subscribe(response => {
          this.configuracion = response;
          this.configuracionFormulario.codigoJobCliente = this.configuracion.codigoJobCliente;
          this.configuracionFormulario.descripcionJobCliente = this.configuracion.descripcionJobCliente;
          this.configuracionFormulario.nombreServicioAplicacion = this.configuracion.nombreServicioAplicacion;
          this.configuracionFormulario.codigoServicioCliente = this.codigoServicioCliente;
          
          this.cargarDetalleConfiguracion();

          this.configuracionForm.patchValue({
            codigoJobCliente: this.configuracionFormulario.codigoJobCliente,
            descripcionJobCliente: this.configuracionFormulario.descripcionJobCliente,
            inputGroupLunes: this.configuracionFormulario.inputGroupLunes,
            inputGroupMartes: this.configuracionFormulario.inputGroupMartes,
            inputGroupMiercoles: this.configuracionFormulario.inputGroupMiercoles,
            inputGroupJueves: this.configuracionFormulario.inputGroupJueves,
            inputGroupViernes: this.configuracionFormulario.inputGroupViernes,
            inputGroupSabado: this.configuracionFormulario.inputGroupSabado,
            inputGroupDomingo: this.configuracionFormulario.inputGroupDomingo,
            codigoGroupLunes: this.configuracionFormulario.codigoGroupLunes,
            codigoGroupMartes: this.configuracionFormulario.codigoGroupMartes,
            codigoGroupMiercoles: this.configuracionFormulario.codigoGroupMiercoles,
            codigoGroupJueves: this.configuracionFormulario.codigoGroupJueves,
            codigoGroupViernes: this.configuracionFormulario.codigoGroupViernes,
            codigoGroupSabado: this.configuracionFormulario.codigoGroupSabado,
            codigoGroupDomingo: this.configuracionFormulario.codigoGroupDomingo,
            nombreServicioAplicacion: this.configuracionFormulario.nombreServicioAplicacion
          });
        });
      }
    })
  }

  ngOnInit() {
    this.cargarConfiguracion();
  }

  cargarDetalleConfiguracion(): void {
    let listDetalle: JobClienteProgramacion[] = this.configuracion.listaJobClienteProgramacion
    listDetalle.forEach((detalle) => {
      if (detalle.dia == "L") {
        this.configuracionFormulario.inputGroupLunes = detalle.hora;
        this.configuracionFormulario.codigoGroupLunes = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "M") {
        this.configuracionFormulario.inputGroupMartes = detalle.hora;
        this.configuracionFormulario.codigoGroupMartes = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "I") {
        this.configuracionFormulario.inputGroupMiercoles = detalle.hora;
          this.configuracionFormulario.codigoGroupMiercoles = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "J") {
        this.configuracionFormulario.inputGroupJueves = detalle.hora;
        this.configuracionFormulario.codigoGroupJueves = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "V") {
        this.configuracionFormulario.inputGroupViernes = detalle.hora;
        this.configuracionFormulario.codigoGroupViernes = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "S") {
        this.configuracionFormulario.inputGroupSabado = detalle.hora;
        this.configuracionFormulario.codigoGroupSabado = detalle.codigoJobClienteProgramacion;
      }
      if (detalle.dia == "D") {
        this.configuracionFormulario.inputGroupDomingo = detalle.hora;
        this.configuracionFormulario.codigoGroupDomingo = detalle.codigoJobClienteProgramacion;
      }
    });
  }
}
