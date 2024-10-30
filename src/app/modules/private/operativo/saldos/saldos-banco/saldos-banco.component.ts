import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PaginatorComponent } from '../../../commons/paginator/paginator.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { MenuComponent } from '../../../layout/menu/menu.component';
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
    PaginatorComponent,
    HeaderComponent,
    MenuComponent, ResumenGeneralModalComponent],
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

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router, 
              private saldosService: SaldosService) {
      if (sessionStorage.getItem(environment.session.ID_EMPRESA) != undefined) {
        this.idEmpresa = sessionStorage.getItem(environment.session.ID_EMPRESA)!;
      }
  }

  actualizarSaldosMovimientos() {
    this.loading = true;
    const dateActual = new Date();
    const dateInicial = new Date();

    dateInicial.setDate(dateActual.getDate() - 120);

    var fechaActual = this.transform(dateActual.toString(),'yyyy-MM-dd');
    var fechaInicial = this.transform(dateInicial.toString(),'yyyy-MM-dd');

    var fechaActual = this.transform('2024-10-19','yyyy-MM-dd');
    var fechaInicial = this.transform('2024-01-01','yyyy-MM-dd');

    if (fechaActual != null && fechaInicial != null) {
      this.saldosService.actualizarSaldosMovimientosPorBanco(Number(this.idEmpresa),
                                                            this.idBanco,
                                                            fechaInicial, 
                                                            fechaActual).subscribe({
        next:(response) => {
          this.loading = false;  // Ocultar el spinner
          this.reloadPage();
        },
        error: (err) => {
          this.loading = false;
        }
      });
    }
  }

  actualizarSaldosMovimientosPorCuenta(codigoAgrupacion: number, numeroCuenta: string, idBanco: string){
    this.loading = true;
    const dateActual = new Date();
    const dateInicial = new Date();

    dateInicial.setDate(dateActual.getDate() - 120);

    var fechaActual = this.transform('2023-12-03','yyyy-MM-dd');
    var fechaInicial = this.transform('2023-11-01','yyyy-MM-dd');

    if (fechaActual != null && fechaInicial != null) {
      this.saldosService.actualizarSaldosMovimientos(Number(this.idEmpresa), 
                                                    codigoAgrupacion, 
                                                    idBanco, 
                                                    numeroCuenta, 
                                                    fechaInicial, 
                                                    fechaActual).subscribe({
        next:(response) => {
          this.loading = false;  // Ocultar el spinner
          this.reloadPage();
        },
          error: (err) => {
          this.loading = false;
        }
      });
    }
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
      this.resumen = response as Resumen;
    });
  }

  reloadPage() {
    this.router.navigateByUrl('/content-web', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/saldos']);
    });
  }

  transform(value: string, formato: string) {
    var datePipe = new DatePipe("en-US");
    return datePipe.transform(value, formato);
  }

  cerrarModal(): void {
    this.resumenSaldos = false;
  }
}
