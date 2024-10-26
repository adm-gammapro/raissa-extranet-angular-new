import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Perfil } from '../../../../apis/model/module/private/perfil';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estado } from '../../../../apis/model/commons/estado';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { MenuComponent } from '../../layout/menu/menu.component';
import { FormPerfilModuloComponent } from './perfil-modulo/form-perfil-modulo.component';
import { UsuarioService } from '../../../../service/modules/private/administrativo/usuario.service';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { PerfilService } from '../../../../service/modules/private/administrativo/perfil.service';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
    MenuComponent,
    FormPerfilModuloComponent],
providers: [ConfirmationService, MessageService, UsuarioService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  @ViewChild(FormPerfilModuloComponent) formPerfilModuloComponent!: FormPerfilModuloComponent;
  public perfiles: Perfil[] = [];
  nombreSearch:string | undefined;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  mostrarHijo = false;
  public perfilSearchForm: FormGroup;
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
    private messagesService: MessagesService,
    private perfilService: PerfilService) {

      this.perfilSearchForm = this.formBuilder.group({
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

  filterAlphanumericoSinEspacio(event: Event): void {
    Util.filterAlphanumericoSinEspacio(event, this.perfilSearchForm);
  }

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.perfilSearchForm);
  }

  esBotonDeshabilitado(perfil: Perfil): boolean {
    return perfil.estadoRegistro === "INACTIVO";
  }

  eliminarFila(event: Event, perfilParam: Perfil) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
            this.perfilService.eliminar(perfilParam.codigo).subscribe(
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

  ngOnInit() {

    this.activatedRoute.paramMap.subscribe (params => {
      let pagina: number;
      let perfil: string;
      let estado: string
      let cantReg: number;

      pagina = Number(params.get('pagina'));
      perfil = String(params.get('nombreSearch'));
      estado = String(params.get('estadoSearch'));
      cantReg = Number(params.get('cantReg'));

      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if(!perfil || perfil == "null") {
        this.nombreSearch = "";
      } else {
        this.nombreSearch = perfil;
      }

      if(!estado || estado == "null" || estado == "T"){
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estado;
      }
      
      if(!cantReg){
        this.paginator.cantidadRegistros = 5;
      } else {
        this.paginator.cantidadRegistros = cantReg;
      }

      this.perfilService.getPerfiles(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.paginator.cantidadRegistros, this.idEmpresa).subscribe(response => {
        this.perfiles = response.content as Perfil[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if(!estado || estado == "T" || estado == "null"){
          this.estadoSearch = "T";
        }

        this.perfilSearchForm.patchValue({
          nombreSearch: this.nombreSearch,
          estadoSearch: this.estadoSearch
        });
      });
    });

    this.messages = this.messagesService.getMessages();
  }

  busqueda() {
    this.nombreSearch = this.perfilSearchForm.controls['nombreSearch'].value;
    this.estadoSearch = this.perfilSearchForm.controls['estadoSearch'].value;
    if (this.nombreSearch === null) {
      this.nombreSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }

    this.router.navigate(['/perfil',this.paginator.numeroPagina,this.paginator.cantidadRegistros,this.nombreSearch,this.estadoSearch]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/perfil']);
    });
  }

  mostrarModal(idPerfil: number): void {
    this.formPerfilModuloComponent.cargarModelo(idPerfil);
    this.mostrarHijo = true; // Mostrar el componente hijo (modal)
  }

  cerrarModal(): void {
    this.mostrarHijo = false; // Cerrar el componente hijo
    this.messages = this.messagesService.getMessages();
  }
}
