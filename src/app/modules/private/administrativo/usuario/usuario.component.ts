import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../layout/header/header.component";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { MenuComponent } from '../../layout/menu/menu.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../service/modules/private/administrativo/usuario.service';
import { Usuario } from '../../../../apis/model/module/private/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { Util } from '../../../../utils/util/util.util';
import { Estado } from '../../../../apis/model/commons/estado';
import { environment } from '../../../../../environments/environment';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { FormUsuarioPerfilComponent } from './usuario-perfil/form-usuario-perfil.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule,
            ReactiveFormsModule,
            CommonModule,
            ...PRIME_NG_MODULES,
            PaginatorComponent, 
            HeaderComponent,
            MenuComponent,
            FormUsuarioPerfilComponent],
providers: [ConfirmationService, MessageService, UsuarioService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  @ViewChild(FormUsuarioPerfilComponent) formUsuarioPerfilComponent!: FormUsuarioPerfilComponent;
  usuarios!: Usuario[];
  nombreSearch:String | undefined;
  estadoSearch:String | undefined;
  messages: Message[] = [];
  mostrarHijo = false;
  public usuarioSearchForm: FormGroup;
  estados: Estado[] = Estado.estados;
  private idEmpresa: string = "";
  visibleResetPassword: boolean = false;
  public idUsuarioReset!: number;
  public passwordReset!: string;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private confirmationService: ConfirmationService, 
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private formBuilder: FormBuilder,
    private messageService: MessageService, 
    private usuarioService: UsuarioService,
    private messagesService: MessagesService) {

      this.usuarioSearchForm = this.formBuilder.group({
        nombreSearch: new FormControl(this.nombreSearch, [Validators.maxLength(50)]),
        estadoSearch: new FormControl('T'),
      });

      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }
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

  eliminarFila(event: Event, usuarioParam: Usuario) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
            this.usuarioService.eliminar(usuarioParam.id).subscribe(
              response => {
                const messages: Message[] = [
                  { severity: 'success', summary: 'Confirmación', detail: 'Registro dado de baja', life: 5000 }
                ];
                this.messagesService.setMessages(messages);
                this.reloadPage();
              }
            )
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se dió de baja al registro', life: 5000 });
      }
    });
  }

  filterAlphanumericoSinEspacio(event: Event): void {
    Util.filterAlphanumericoSinEspacio(event, this.usuarioSearchForm);
  }

  filterAlphabetsGuiones(event: Event): void {
    Util.filterAlphabetsGuiones(event, this.usuarioSearchForm);
  }

  esBotonDeshabilitado(usuario: Usuario): boolean {
    return usuario.estadoRegistro === "INACTIVO";
  }

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe (params => {
      let pagina: number;
      let usuario: string;
      let estado: string
      let cantReg: number;

      pagina = Number(params.get('pagina'));
      usuario = String(params.get('nombreSearch'));
      estado = String(params.get('estadoSearch'));
      cantReg = Number(params.get('cantReg'));

      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if(!usuario || usuario == "null") {
        this.nombreSearch = "";
      } else {
        this.nombreSearch = usuario;
      }

      if(!estado || estado == "null"){
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estado;
      }
      
      if(!cantReg){
        this.paginator.cantidadRegistros = 5;
      } else {
        this.paginator.cantidadRegistros = cantReg;
      }

      this.usuarioService.getUsuarios(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.paginator.cantidadRegistros, this.idEmpresa).subscribe(response => {
        this.usuarios = response.content as Usuario[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if(!estado || estado == "null" || estado == "T"){
          this.estadoSearch = "T"
        }

        this.usuarioSearchForm.patchValue({
          nombreSearch: this.nombreSearch,
          estadoSearch: this.estadoSearch
        });
      });
    });

    this.messages = this.messagesService.getMessages();
  }

  busqueda() {
    this.nombreSearch = this.usuarioSearchForm.controls['nombreSearch'].value;
    this.estadoSearch = this.usuarioSearchForm.controls['estadoSearch'].value;
    if (this.nombreSearch === null) {
      this.nombreSearch = "";
    }
    if (this.estadoSearch === null || this.estadoSearch === "T") {
      this.estadoSearch = "";
    } 

    this.router.navigate(['/usuario',this.paginator.numeroPagina,this.paginator.cantidadRegistros,this.nombreSearch,this.estadoSearch]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/usuario']);
    });
  }

  mostrarModal(idUsuario: number): void {
    this.formUsuarioPerfilComponent.cargarModelo(idUsuario, this.idEmpresa);
    this.mostrarHijo = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarHijo = false; // Cerrar el componente hijo
    this.messages = this.messagesService.getMessages();
  }

  showDialog(idUsuario: number) {
    this.idUsuarioReset = idUsuario;
    this.visibleResetPassword = true;
  }

  async resetPassword () {
    if (this.passwordReset) {
      this.usuarioService.cambiarPassword(this.idUsuarioReset,this.passwordReset).subscribe(response => {;

        const messages: Message[] = [
          { severity: 'success', summary: 'Confirmación', detail: 'Password actualizado', life: 5000 }
        ];
        this.messagesService.setMessages(messages);
        this.reloadPage();
      }
    )}
  }
}
