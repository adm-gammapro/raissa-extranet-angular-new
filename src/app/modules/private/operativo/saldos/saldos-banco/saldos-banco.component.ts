import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../../layout/header/header.component';
import { ResumenGeneralModalComponent } from '../resumen-general/resumen-general-modal.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { SaldosService } from '../../../../../service/modules/private/operativo/saldos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { Resumen } from '../../../../../apis/model/module/private/resumen';

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
export class SaldosBancoComponent {
  loading: boolean = false;
  resumenSaldos: boolean = false;
  public resumen: Resumen = new Resumen();
  idEmpresa: string = "";
  messages: Message[] = [];
  private idBanco: string ="";

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router, 
              private readonly saldosService: SaldosService) {
      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }
  }

  actualizarSaldosMovimientos() {
    this.loading = true;

    this.saldosService.actualizarSaldosMovimientosPorBanco(Number(this.idEmpresa),
      this.idBanco).subscribe({
        next: () => {
          this.loading = false;  // Ocultar el spinner
          this.reloadPage();
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  actualizarSaldosMovimientosPorCuenta(codigoCuenta: number) {
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

  }

  private cargarSaldos(): void {
    this.saldosService.getSaldosPorCuenta(this.idEmpresa, this.idBanco).subscribe(response => {
      this.resumen = response;
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
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
}
