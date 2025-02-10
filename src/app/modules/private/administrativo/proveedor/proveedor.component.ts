import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { AgrupacionService } from '../../../../service/modules/private/operativo/agrupacion.service';
import { Proveedor } from '../../../../apis/model/module/private/proveedor';
import { Estado } from '../../../../apis/model/commons/estado';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { MessagesService } from '../../../../service/commons/messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Util } from '../../../../utils/util/util.util';
import { ProveedorService } from '../../../../service/modules/private/operativo/proveedor.service';
import { ProveedorResponse } from '../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
        EstadoRegistroLabelPipe],
providers: [ConfirmationService, MessageService, AgrupacionService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.scss'
})
export class ProveedorComponent implements OnInit {
  public proveedores: ProveedorResponse[] = [];
  nombreSearch:string | undefined;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  public proveedorSearchForm: FormGroup;
  estados: Estado[] = Estado.estados;
  idEmpresa: string = "";

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService, 
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router, 
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly messagesService: MessagesService,
    private readonly proveedorService: ProveedorService) {

      this.proveedorSearchForm = this.formBuilder.group({
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

  filterAlphanumeric(event: Event): void {
    Util.filterAlphanumeric(event, this.proveedorSearchForm);
  }

  esBotonDeshabilitado(proveedor: Proveedor): boolean {
    return proveedor.estadoRegistro === "INACTIVO";
  }

  eliminarFila(event: Event, proveedorParam: Proveedor) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro de dar de baja este registro?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"Si",
      rejectIcon:"No",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
            this.proveedorService.eliminar(proveedorParam.codigo).subscribe(
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
      let proveedor: string;
      let estado: string
      let cantReg: number;

      pagina = Number(params.get('pagina'));
      proveedor = String(params.get('nombreSearch'));
      estado = String(params.get('estadoSearch'));
      cantReg = Number(params.get('cantReg'));

      if(!pagina){
        this.paginator.numeroPagina = 0;
      } else {
        this.paginator.numeroPagina = pagina;
      }

      if(!proveedor || proveedor == "null") {
        this.nombreSearch = "";
      } else {
        this.nombreSearch = proveedor;
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

      this.proveedorService.getProveedores(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.paginator.cantidadRegistros, Number(this.idEmpresa)).subscribe(response => {
        this.proveedores = response.content as ProveedorResponse[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        if(!estado || estado == "T" || estado == "null"){
          this.estadoSearch = "T";
        }

        this.proveedorSearchForm.patchValue({
          nombreSearch: this.nombreSearch,
          estadoSearch: this.estadoSearch
        });
      });
    });

    this.messages = this.messagesService.getMessages();
  }

  busqueda() {
    this.nombreSearch = this.proveedorSearchForm.controls['nombreSearch'].value;
    this.estadoSearch = this.proveedorSearchForm.controls['estadoSearch'].value;
    if (this.nombreSearch === null) {
      this.nombreSearch = "";
    }
    if (this.estadoSearch === null) {
      this.estadoSearch = "T";
    }

    this.router.navigate(['/proveedor',this.paginator.numeroPagina,this.estadoSearch,this.nombreSearch,this.paginator.cantidadRegistros]);
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/proveedor']);
    });
  }
}
