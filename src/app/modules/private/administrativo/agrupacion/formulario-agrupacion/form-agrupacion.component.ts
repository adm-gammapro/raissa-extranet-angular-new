import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil.service';
import { Agrupacion } from '../../../../../apis/model/module/private/agrupacion';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { AgrupacionService } from '../../../../../service/modules/private/operativo/agrupacion.service';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-agrupacion',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, PerfilService],
  templateUrl: './form-agrupacion.component.html',
  styleUrl: './form-agrupacion.component.scss'
})
export class FormAgrupacionComponent {
  agrupacion: Agrupacion = new Agrupacion();
  public agrupacionForm: FormGroup;
  public idEmpresa: string = "";

  constructor(private readonly router: Router, 
              private readonly confirmationService: ConfirmationService, 
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService, 
              private readonly agrupacionService: AgrupacionService, 
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService) {

    this.agrupacionForm = this.formBuilder.group({
      codigo: new FormControl(this.agrupacion.codigo),
      interfazCuentaProvieneCliente: ['', [Validators.required, Validators.maxLength(15)]],
      nombreAgrupacionCliente: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  guardar() {
    
      if (this.agrupacionForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
              
              this.agrupacion = this.agrupacionForm.value;
              this.agrupacion.codigoCliente = Number(this.idEmpresa);
              if(this.agrupacion.codigo) {
                this.agrupacionService.update(this.agrupacion).subscribe({
                  next:() => {
                    const messages: Message[] = [
                      { severity: 'success', summary: 'Confirmación', detail: `Se Actualizó registro existosamente`, life: 5000 }
                    ];
                    this.messagesService.setMessages(messages);
                  },
                  error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
                  },
                  complete: () => {
                    this.router.navigate(['/agrupacion'])
                  }
                });
              } else {
                this.agrupacionService.create(this.agrupacion).subscribe({
                  next:() => {
                    const messages: Message[] = [
                      { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro existosamente`, life: 5000 }
                    ];
                    this.messagesService.setMessages(messages);
                  },
                  error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
                  },
                  complete: () => {
                    this.router.navigate(['/agrupacion'])
                  }
                });
              }
          },reject: () => {
            this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se guardó registro', life: 5000 });
        }
        });
        
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Validación',
          detail: 'Se deben ingresar los campos obligatorios y en el formato requerido.', 
          life: 5000
        });
        this.agrupacionForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe (params => {
      let id: number;

      id = Number(params.get('id'));
                      
      if(id!=null && id > 0){
        this.agrupacionService.getAgrupacion(id, Number(this.idEmpresa)).subscribe(response => {
          this.agrupacion = response;

          this.agrupacionForm.patchValue({
            codigo: this.agrupacion.codigo,
            interfazCuentaProvieneCliente: this.agrupacion.interfazCuentaProvieneCliente,
            nombreAgrupacionCliente: this.agrupacion.nombreAgrupacionCliente
          });
        });
      }
    })
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.agrupacionForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.agrupacionForm);
  }
}
