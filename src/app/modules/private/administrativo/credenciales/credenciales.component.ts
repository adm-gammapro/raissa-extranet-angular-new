import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Credenciales } from '../../../../apis/model/module/private/credenciales';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Estado } from '../../../../apis/model/commons/estado';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../service/commons/messages.service';
import { CredencialesService } from '../../../../service/modules/private/operativo/credenciales.service';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';
import { Proveedor } from '../../../../apis/model/module/private/proveedor';
import { ProveedorService } from '../../../../service/modules/private/operativo/proveedor.service';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { MenuComponent } from '../../layout/menu/menu.component';

@Component({
  selector: 'app-credenciales',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
    MenuComponent],
providers: [ConfirmationService, MessageService, CredencialesService, ProveedorService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './credenciales.component.html',
  styleUrl: './credenciales.component.scss'
})
export class CredencialesComponent implements OnInit {
  public credenciales: Credenciales[] = [];
  nombreSearch:string | undefined;
  proveedorSearch!:string;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  public credencialesSearchForm: FormGroup;
  estados: Estado[] = Estado.estados;
  idEmpresa: string = "";
  public proveedores: Proveedor[] = [];

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private confirmationService: ConfirmationService, 
    private activatedRoute: ActivatedRoute,
    private router: Router, 
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private messagesService: MessagesService,
    private credencialesService: CredencialesService,
    private proveedorService: ProveedorService) {

      this.credencialesSearchForm = this.formBuilder.group({
        nombreSearch: new FormControl(this.nombreSearch, [Validators.maxLength(50)]),
        proveedorSearch: new FormControl(this.proveedorSearch, [Validators.maxLength(50)]),
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

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.credencialesSearchForm);
  }

  esBotonDeshabilitado(credenciales: Credenciales): boolean {
    return credenciales.estadoRegistro === "INACTIVO";
  }

  eliminarFila(event: Event, credencialesParam: Credenciales) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
            this.credencialesService.eliminar(credencialesParam.codigo).subscribe(
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
    this.getProveedores();
    this.activatedRoute.paramMap.subscribe (params => {
      let pagina: number;
      let proveedor: string;
      let referencia: string;
      let estado: string
      let cantReg: number;

      pagina = Number(params.get('pagina'));
      referencia = String(params.get('nombreSearch'));
      estado = String(params.get('estadoSearch'));
      proveedor = String(params.get('proveedorSearch'));
      cantReg = Number(params.get('cantReg'));

      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if(!referencia || referencia == "null") {
        this.nombreSearch = "";
      } else {
        this.nombreSearch = referencia;
      }

      if(!proveedor || proveedor == "null") {
        this.proveedorSearch = "";
      } else {
        this.proveedorSearch = proveedor;
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

      this.credencialesService.getCredenciales(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.proveedorSearch, this.paginator.cantidadRegistros, this.idEmpresa).subscribe(response => {
        this.credenciales = response.content as Credenciales[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if(!estado || estado == "T" || estado == "null"){
          this.estadoSearch = "T";
        }

        this.credencialesSearchForm.patchValue({
          nombreSearch: this.nombreSearch,
          estadoSearch: this.estadoSearch,
          proveedorSearch: this.proveedorSearch
        });
      });
    });

    this.messages = this.messagesService.getMessages();
  }

  busqueda() {
    this.nombreSearch = this.credencialesSearchForm.controls['nombreSearch'].value;
    this.estadoSearch = this.credencialesSearchForm.controls['estadoSearch'].value;
    this.proveedorSearch = this.credencialesSearchForm.controls['proveedorSearch'].value;
    if (this.nombreSearch === null) {
      this.nombreSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }
    if (this.proveedorSearch === null) {
      this.proveedorSearch = "";
    }

    this.router.navigate(['/credenciales',this.paginator.numeroPagina,this.estadoSearch,this.nombreSearch,this.proveedorSearch,this.paginator.cantidadRegistros]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/credenciales']);
    });
  }

  getProveedores(): void {
    this.proveedorService.getAllProveedor(Number(this.idEmpresa)).subscribe(response => {
      this.proveedores = response as Proveedor[];
    });
  }
}
