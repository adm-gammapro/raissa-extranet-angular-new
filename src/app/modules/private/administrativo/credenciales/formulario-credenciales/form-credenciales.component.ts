import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { CredencialesService } from '../../../../../service/modules/private/operativo/credenciales.service';
import { ProveedorService } from '../../../../../service/modules/private/operativo/proveedor.service';
import { CuentasService } from '../../../../../service/modules/private/operativo/cuentas.service';
import { Credenciales } from '../../../../../apis/model/module/private/credenciales';
import { Proveedor } from '../../../../../apis/model/module/private/proveedor';
import { Frecuencia } from '../../../../../apis/model/module/private/frecuencia';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-credenciales',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, CredencialesService, ProveedorService, CuentasService],
  templateUrl: './form-credenciales.component.html',
  styleUrl: './form-credenciales.component.scss'
})
export class FormCredencialesComponent {
  credenciales: Credenciales = new Credenciales();
  public proveedores: Proveedor[] = [];
  public frecuencias: Frecuencia[] = [];
  public credencialForm: FormGroup;
  public idEmpresa: string = "";

  constructor(private router: Router, 
              private confirmationService: ConfirmationService, 
              private formBuilder: FormBuilder,
              private messageService: MessageService, 
              private proveedorService: ProveedorService, 
              private activatedRoute: ActivatedRoute,
              private messagesService: MessagesService,
              private credencialesService: CredencialesService,
              private cuentasService: CuentasService) {

    this.credencialForm = this.formBuilder.group({
      codigo: new FormControl(this.credenciales.codigo),
      usuario: ['', [Validators.required, Validators.maxLength(50)]],
      clave: ['', Validators.required],
      referencia: [''],
      codigoFrecuencia: ['', Validators.required],
      codigoProveedor: ['', Validators.required],
    });

    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
  }

  public cargarProveedor(): void {
    this.proveedorService.getAllProveedor(Number(this.idEmpresa)).subscribe(response => {
      this.proveedores = response as Proveedor[];
    });
  }

  public cargarFrecuencia(): void {
    this.cuentasService.getFrecuencias().subscribe(response => {
      this.frecuencias = response as Frecuencia[];
    });
  }

  onChangeProveedor(event: any) {
    this.proveedorService.getProveedor(event.value).subscribe(response => {
      let proveedor = response as Proveedor;

      const campoReferencia = this.credencialForm.get('referencia');
      if (proveedor.indicadorValorAdicional) {
        campoReferencia?.setValidators([Validators.required]); 
      } else {
        campoReferencia?.clearValidators();
      }
  
      campoReferencia?.updateValueAndValidity();
    });
  }

  guardar() {
    
      if (this.credencialForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
              
              this.credenciales = this.credencialForm.value;
              this.credenciales.codigoCliente = Number(this.idEmpresa);
              this.credencialesService.create(this.credenciales).subscribe({
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
                  this.router.navigate(['/credenciales'])
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
        this.credencialForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarProveedor();
    this.cargarFrecuencia();

    this.activatedRoute.paramMap.subscribe (params => {
      let id: number | null;

      id = Number(params.get('id'));
                      
      if(id!=null && id>0){
        this.credencialesService.getCredencial(id).subscribe(response => {
          this.credenciales = response;

          this.credencialForm.patchValue({
            codigo: this.credenciales.codigo,
            usuario: this.credenciales.usuario,
            clave: this.credenciales.clave,
            referencia: this.credenciales.referencia,
            codigoFrecuencia: this.credenciales.codigoFrecuencia,
            codigoProveedor: this.credenciales.codigoProveedor
          });
        });
      }
    })
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.credencialForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.credencialForm);
  }
}
