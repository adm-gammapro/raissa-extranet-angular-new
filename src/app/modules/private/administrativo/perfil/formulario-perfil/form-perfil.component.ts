import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../layout/header/header.component';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { PerfilService } from '../../../../../service/modules/private/administrativo/perfil.service';
import { Perfil } from '../../../../../apis/model/module/private/perfil';
import { Aplicacion } from '../../../../../apis/model/module/private/aplicacion';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { environment } from '../../../../../../environments/environment';
import { Util } from '../../../../../utils/util/util.util';

@Component({
  selector: 'app-form-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    ...PRIME_NG_MODULES],
    providers: [ConfirmationService, MessageService, PerfilService],
  templateUrl: './form-perfil.component.html',
  styleUrl: './form-perfil.component.scss'
})
export class FormPerfilComponent {
  perfil: Perfil = new Perfil();
  public perfilForm: FormGroup;
  public aplicaciones: Aplicacion[] = [];
  public idUsuarioSession: string = "";

  constructor(private router: Router, 
              private confirmationService: ConfirmationService, 
              private formBuilder: FormBuilder,
              private messageService: MessageService, 
              private perfilService: PerfilService, 
              private activatedRoute: ActivatedRoute,
              private messagesService: MessagesService) {

    this.perfilForm = this.formBuilder.group({
      codigo: new FormControl(this.perfil.codigo),
      descripcion: new FormControl(this.perfil.descripcion, [Validators.required, Validators.maxLength(70)]),
      abreviatura: new FormControl(this.perfil.abreviatura, [Validators.required, Validators.maxLength(20)]),
      nombreComercial: new FormControl(this.perfil.nombreComercial, [Validators.required, Validators.maxLength(50)]),
      codigoAplicacion: new FormControl(this.perfil.codigoAplicacion, [Validators.required]),
      fechaCaducidad: new FormControl(this.perfil.fechaCaducidad),
    });

    if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
      this.idUsuarioSession = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION)!;
    }
  }

  public cargarAplicaciones(): void {
    this.perfilService.getAplicaciones().subscribe(response => {
      this.aplicaciones = response as Aplicacion[];
    });
    
  }

  guardar() {
    
      if (this.perfilForm.valid) {
        this.confirmationService.confirm({
          message: '¿Está seguro de guardar este registro?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Si', // Etiqueta del botón 'Aceptar'
          rejectLabel: 'No',
          accept: () => {
              
              this.perfil = this.perfilForm.value;
              this.perfil.idUsuario = this.idUsuarioSession;
              this.convertirFecha();
              
              this.perfilService.create(this.perfil).subscribe({
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
                  this.router.navigate(['/perfil'])
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
        this.perfilForm.markAllAsTouched();
      }
  }

  ngOnInit() {
    this.cargarAplicaciones();

    this.activatedRoute.paramMap.subscribe (params => {
      let id: number;

      id = Number(params.get('id'));
                      
      if(id!=null && id > 0){
        this.perfilService.getPerfil(id).subscribe(response => {

          this.perfil = response as Perfil;

          this.perfilForm.patchValue({
            codigo: this.perfil.codigo,
            descripcion: this.perfil.descripcion,
            abreviatura: this.perfil.abreviatura,
            nombreComercial: this.perfil.nombreComercial,
            fechaCaducidad: this.perfil.fechaCaducidad,
            codigoAplicacion: this.perfil.codigoAplicacion
          });

          if (this.perfil.fechaCaducidad != "") {
            this.perfilForm.patchValue({
              fechaCaducidad: Util.stringToDate(this.perfil.fechaCaducidad, 'dd/mm/yyyy', '/')
            });
          }
        });
      }
    })
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.perfilForm);
  }

  isFieldRequired(controlName: string): boolean {
    return Util.isFieldRequired(controlName, this.perfilForm);
  }

  convertirFecha(): void {
    if (this.perfil.fechaCaducidad != null && this.perfil.fechaCaducidad != "") {      
      this.perfil.fechaCaducidad = Util.formatDate(new Date(this.perfil.fechaCaducidad));
    }
  }
}
