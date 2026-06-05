import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PRIME_NG_MODULES} from '../../../../../config/primeNg/primeng-global-imports';
import {HeaderComponent} from '../../../layout/header/header.component';
import {ResumenGeneralModalComponent} from '../resumen-general/resumen-general-modal.component';
import {ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {SaldosService} from '../../../../../service/modules/private/operativo/saldos.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../../../../environments/environment';
import {Resumen} from '../../../../../apis/model/module/private/resumen';

@Component({
  selector: 'app-saldos-banco',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    HeaderComponent,
    ResumenGeneralModalComponent],
  providers: [ConfirmationService, MessageService, SaldosService],
  templateUrl: './saldos-banco.component.html',
  styleUrl: './saldos-banco.component.scss'
})
export class SaldosBancoComponent implements OnInit {
  loading: boolean = false;
  resumenSaldos: boolean = false;
  public resumen: Resumen = new Resumen();
  idEmpresa: string = "";
  private idBanco: string = "";
  protected codigoUsuarioSesion: string = "";
  protected claseUsuarioSesion: string = "";
  protected items: MenuItem[] | undefined;
  protected home: MenuItem | undefined;

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly messageService: MessageService,
              private readonly confirmationService: ConfirmationService,
              private readonly saldosService: SaldosService) {
    if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
      this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
    }
    if (sessionStorage.getItem(environment.session.ID_USUARIO_SESSION) != undefined) {
      this.codigoUsuarioSesion = sessionStorage.getItem(environment.session.ID_USUARIO_SESSION)!;
    }

    if (sessionStorage.getItem(environment.session.CLASE_USUARIO_SESSION) != undefined) {
      this.claseUsuarioSesion = sessionStorage.getItem(environment.session.CLASE_USUARIO_SESSION)!;
    }
  }

  actualizarSaldosMovimientos() {
    this.confirmationService.confirm({
      message: 'Se enviará un solicitud de actualización de saldos y movimientos para todas las cuentas de esta entidad financiera. ' +
        '<br> <div class="text-center font-bold mt-3">¿Desea confirmar la acción?</div>',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;

        this.saldosService.actualizarSaldosMovimientosPorBanco(Number(this.idEmpresa), this.idBanco);
        setTimeout(() => {
          this.messageService.add({
            severity: 'info',
            summary: 'Procesando',
            detail: 'La actualización se está ejecutando en segundo plano, revisar el monitor de procesos para seguimiento.',
            life: 5000
          });

          this.loading = false;

        }, 1000);
      }
    });
  }

  actualizarSaldosMovimientosPorCuenta(codigoCuenta: number) {
    this.confirmationService.confirm({
      message: 'Se enviará un solicitud de actualización de saldos y movimientos para esta cuenta.' +
        '<br> <div class="text-center font-bold mt-3">¿Desea confirmar la acción?</div>',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;

        this.saldosService.actualizarSaldosMovimientos(Number(this.idEmpresa),
          codigoCuenta).subscribe({
          next: () => {
            this.loading = false;  // Ocultar el spinner
            this.reloadPage();
          },
          error: (err) => {
            this.loading = false;
          }
        });
      }
    });
  }

  mostrarResumen() {
    this.resumenSaldos = true;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.idBanco = String(params.get('idBanco'));
      if (this.idBanco != null) {
        this.cargarSaldos();
      }
    })

    this.initializeBreadcrumbs();
  }

  private cargarSaldos(): void {
    this.saldosService.getSaldosPorCuenta(this.idEmpresa, this.idBanco, Number(this.codigoUsuarioSesion)).subscribe(response => {
      this.resumen = response;
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', {skipLocationChange: true}).then(() => {
      this.router.navigate(['/saldos']);
    });
  }

  cerrarModal(): void {
    this.resumenSaldos = false;
  }

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  mostrarSaldo() {
    this.router.navigate(['/saldos']);
  }

  mostrarDetalle(idCuenta: number, bitacora: number, idBanco: number) {
    this.router.navigate(['/movimientos', idCuenta, bitacora, idBanco, '-', '-', 'T', 5, 0]);
  }

  private initializeBreadcrumbs(): void {
    this.items = [
      { label: 'Posición general', routerLink: '/saldos' },
      { label: 'Posición por banco' },
    ];
    this.home = { icon: 'pi pi-home', routerLink: '/content' };
  }
}
