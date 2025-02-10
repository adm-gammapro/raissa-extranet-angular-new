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
import { ProveedorService } from '../../../../service/modules/private/operativo/proveedor.service';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { CredencialesResponse } from '../../../../apis/model/module/private/operativo/credenciales/response/credenciales-response';
import { ProveedorResponse } from '../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { EstadoRegistroLabelPipe } from '../../../../apis/model/pipe/estado-registro-label.pipe';
import { EstadoRegistroEnum } from '../../../../apis/model/enums/estado-registro';

@Component({
  selector: 'app-credenciales',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent, 
    HeaderComponent,
    EstadoRegistroLabelPipe],
providers: [ConfirmationService, MessageService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './credenciales.component.html',
  styleUrl: './credenciales.component.scss'
})
export class CredencialesComponent implements OnInit {
  public credenciales: CredencialesResponse[] = [];
  nombreSearch:string | undefined;
  proveedorSearch!:string;
  estadoSearch:string | undefined;
  messages: Message[] = [];
  public credencialesSearchForm: FormGroup;
  estados: Estado[] = Estado.estados;
  idEmpresa: string = "";
  proveedores: ProveedorResponse[] = [];

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService, 
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router, 
              private readonly formBuilder: FormBuilder,
              private readonly messageService: MessageService,
              private readonly messagesService: MessagesService,
              private readonly credencialesService: CredencialesService,
              private readonly proveedorService: ProveedorService) {

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

  esBotonDeshabilitado(cuenta: CredencialesResponse): boolean {
      return Util.mapEstadoRegistro(cuenta.estadoRegistro) === EstadoRegistroEnum.NO_VIGENTE;
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
            this.credencialesService.eliminar(credencialesParam.codigo, Number(this.idEmpresa)).subscribe(
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
      let pagina = Util.parseOrDefault(params.get('pagina'), 0);
      let estado = params.get('estadoSearch') ?? "T";
      let proveedor = params.get('proveedorSearch') ?? "";
      let referencia = params.get('nombreSearch') ?? "";
      let cantReg = Util.parseOrDefault(params.get('cantReg'),5);

      this.paginator.numeroPagina = pagina;
      this.nombreSearch = referencia;
      this.proveedorSearch = proveedor;

      if(estado == "T"){
        this.estadoSearch = "";
      } else {
        this.estadoSearch = estado;
      }
      
      this.paginator.cantidadRegistros = cantReg;

      this.credencialesService.getCredenciales(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, this.proveedorSearch, this.paginator.cantidadRegistros, Number(this.idEmpresa)).subscribe(response => {
        this.credenciales = response.content as CredencialesResponse[];
        //estos valores se usan para catualizar los valores del paginador
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;

        this.estadoSearch = estado;

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
      this.proveedores = response;
    });
  }

  ocultarValor(valor: string): string {
    return '*'.repeat(valor.length);
  }
}
