import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from "../../layout/header/header.component";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {PRIME_NG_MODULES} from '../../../../config/primeNg/primeng-global-imports';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {UsuarioService} from '../../../../service/modules/private/administrativo/usuario.service';
import {Usuario} from '../../../../apis/model/module/private/usuario';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Paginator} from '../../../../apis/model/commons/paginator';
import {Util} from '../../../../utils/util/util.util';
import {Estado} from '../../../../apis/model/commons/estado';
import {environment} from '../../../../../environments/environment';
import {PaginatorComponent} from '../../commons/paginator/paginator.component';
import {FormUsuarioPerfilComponent} from './usuario-perfil/form-usuario-perfil.component';
import {UsuarioResponse} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {EstadoRegistroLabelPipe} from '../../../../apis/model/pipe/estado-registro-label.pipe';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    PaginatorComponent,
    HeaderComponent,
    FormUsuarioPerfilComponent,
    RouterLink, EstadoRegistroLabelPipe],
providers: [ConfirmationService, MessageService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent implements OnInit {
  @ViewChild(FormUsuarioPerfilComponent) formUsuarioPerfilComponent!: FormUsuarioPerfilComponent;
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;
  protected usuarios!: UsuarioResponse[];
  protected nombreSearch:string | undefined;
  protected estadoSearch:string | undefined;
  protected mostrarHijo = false;
  public usuarioSearchForm: FormGroup;
  protected estados: Estado[] = Estado.estados;
  protected idEmpresa: string = "";
  protected visibleResetPassword: boolean = false;
  public idUsuarioReset!: number;
  public passwordReset!: string;

  paginator: Paginator = new Paginator();//esta variable se debe declarar para usar el paginador de los apis, no de primeng

  constructor(private readonly confirmationService: ConfirmationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly usuarioService: UsuarioService) {

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
                this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Se dió de baja al registro', life: 5000 });
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

  esBotonDeshabilitado(usuario: Usuario): boolean {
    return usuario.estadoRegistro === "INACTIVO";
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const pagina = Util.parseOrDefault(params.get('pagina'), 0);
      const cantReg = Util.parseOrDefault(params.get('cantReg'), 5);
      const estado = Util.getEstado(params.get('estadoSearch'));
      const username = params.get('usernameSearch') ?? "";

      // Configuración del paginador
      this.paginator.numeroPagina = pagina;
      this.paginator.cantidadRegistros = cantReg;
      this.estadoSearch = estado === "T" ? "" : estado;
      this.nombreSearch = username;

      this.loadUsuarios();

      this.estadoSearch = this.estadoSearch ? this.estadoSearch : "T";

      this.usuarioSearchForm.patchValue({
        usernameSearch: this.nombreSearch,
        estadoSearch: this.estadoSearch
      });

      this.initializeBreadcrumbs();
    });
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
  }

  showDialog(idUsuario: number) {
    this.idUsuarioReset = idUsuario;
    this.visibleResetPassword = true;
  }

  onGuardado() {
    this.mostrarHijo = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Registro guardado satisfactoriamente.',
      life: 4000
    });
  }

  async resetPassword () {
    if (this.passwordReset) {
      this.usuarioService.cambiarPassword(this.idUsuarioReset,this.passwordReset).subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Password actualizado', life: 5000 });
        this.reloadPage();
      }
    )}
  }

  private loadUsuarios(): void {
    this.usuarioService
      .getUsuariosPage(this.paginator.numeroPagina, this.estadoSearch, this.nombreSearch, Number(this.idEmpresa), this.paginator.cantidadRegistros)
      .subscribe(response => {
        this.usuarios = response.content as UsuarioResponse[];
        this.paginator.totalRegistros = response.totalElements;
        this.paginator.primerRegistroVisualizado = response.pageable.offset;
      });
  }

  private initializeBreadcrumbs(): void {
    this.items = [{ label: 'Usuarios' }];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
