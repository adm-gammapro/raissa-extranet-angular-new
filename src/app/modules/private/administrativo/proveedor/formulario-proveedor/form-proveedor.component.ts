import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ProveedorService } from '../../../../../service/modules/private/operativo/proveedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Util } from '../../../../../utils/util/util.util';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { ProveedorResponse } from '../../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { ProveedorRequest } from '../../../../../apis/model/module/private/operativo/proveedor/request/proveedor-request';
import { InstitucionFinancieraService } from '../../../../../service/commons/institucion-financiera.service';
import { InstitucionFinancieraResponse } from '../../../../../apis/model/module/private/commons/institucion-financiera-response';

@Component({
  selector: 'app-form-proveedor',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService],
  templateUrl: './form-proveedor.component.html',
  styleUrl: './form-proveedor.component.scss'
})
export class FormProveedorComponent {
  proveedorResponse: ProveedorResponse = new ProveedorResponse();
  proveedorRequest: ProveedorRequest = new ProveedorRequest();
  public bancos: InstitucionFinancieraResponse[] = [];
  public proveedorForm: FormGroup;
  public idEmpresa: string = "";

  constructor(private readonly router: Router, 
              private readonly confirmationService: ConfirmationService, 
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService, 
              private readonly proveedorService: ProveedorService, 
              private readonly activatedRoute: ActivatedRoute,
              private readonly messagesService: MessagesService,
              private readonly saldosService: SaldosService,
              private readonly institucionFinancieraService: InstitucionFinancieraService) {

    this.proveedorForm = this.formBuilder.group({
      codigo: [null],
      nombre: ['', [Validators.required, Validators.maxLength(15)]],
      referencia: ['', Validators.required],
      codigoInstitucionFinanciera: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  public cargarBancos(): void {
    this.institucionFinancieraService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response;
    });
  }

  guardar() {
    
      if (this.proveedorForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
              
              this.proveedorRequest = this.proveedorForm.value;
              this.proveedorRequest.codigoCliente = Number(this.idEmpresa);
              
              this.proveedorService.create(this.proveedorRequest).subscribe({
                next:(response) => {
                  const messages: Message[] = [
                    { severity: 'success', summary: 'Confirmación', detail: `Se guardó registro existosamente`, life: 5000 }
                  ];
                  this.messagesService.setMessages(messages);
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message, life: 5000 });
                },
                complete: () => {
                  this.router.navigate(['/proveedor'])
                }
             })
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
        this.proveedorForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarBancos();

    this.activatedRoute.paramMap.subscribe (params => {
      let id: string | null;

      id = params.get('id');
                      
      if(id!=null && id != ""){
        this.proveedorService.getProveedor(id).subscribe(response => {
          this.proveedorResponse = response;

          this.proveedorForm.patchValue({
            codigo: this.proveedorResponse.codigo,
            nombre: this.proveedorResponse.nombre,
            referencia: this.proveedorResponse.referencia,
            codigoInstitucionFinanciera: this.proveedorResponse.institucionFinanciera.codigo
          });
        });
      }
    })
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.proveedorForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.proveedorForm);
  }
}
