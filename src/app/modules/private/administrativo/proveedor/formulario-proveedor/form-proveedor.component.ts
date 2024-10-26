import { Component } from '@angular/core';
import { Proveedor } from '../../../../../apis/model/module/private/proveedor';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil.service';
import { ProveedorService } from '../../../../../service/modules/private/operativo/proveedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Util } from '../../../../../utils/util/util.util';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { Banco } from '../../../../../apis/model/module/private/banco';

@Component({
  selector: 'app-form-proveedor',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, PerfilService],
  templateUrl: './form-proveedor.component.html',
  styleUrl: './form-proveedor.component.scss'
})
export class FormProveedorComponent {
  proveedor: Proveedor = new Proveedor();
  public bancos: Banco[] = [];
  public proveedorForm: FormGroup;
  public idEmpresa: string = "";

  constructor(private router: Router, 
              private confirmationService: ConfirmationService, 
              private formBuilder: FormBuilder,
              private messageService: MessageService, 
              private proveedorService: ProveedorService, 
              private activatedRoute: ActivatedRoute,
              private messagesService: MessagesService,
              private saldosService: SaldosService) {

    this.proveedorForm = this.formBuilder.group({
      codigo: new FormControl(this.proveedor.codigo),
      nombre: ['', [Validators.required, Validators.maxLength(15)]],
      referencia: ['', Validators.required],
      codigoInstitucionFinanciera: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  public cargarBancos(): void {
    this.saldosService.getAllBancos(Number(this.idEmpresa)).subscribe(response => {
      this.bancos = response as Banco[];
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
              
              this.proveedor = this.proveedorForm.value;
              this.proveedor.codigoEmpresa = Number(this.idEmpresa);
              
              this.proveedorService.create(this.proveedor).subscribe({
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
          this.proveedor = response;

          this.proveedorForm.patchValue({
            codigo: this.proveedor.codigo,
            nombre: this.proveedor.nombre,
            referencia: this.proveedor.referencia,
            codigoInstitucionFinanciera: this.proveedor.codigoInstitucionFinanciera
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
