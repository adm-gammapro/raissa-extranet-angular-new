import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { HeaderComponent } from "../../layout/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { MenuComponent } from '../../layout/menu/menu.component';
import { Consolidado } from '../../../../apis/model/module/private/consolidado';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { EmpresaService } from '../../../../service/modules/private/administrativo/empresa.service';
import { Empresa } from '../../../../apis/model/module/private/empresa';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-seleccion',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES,
    HeaderComponent,
    MenuComponent],
  providers: [ConfirmationService, MessageService, EmpresaService],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './seleccion.component.html',
  styleUrl: './seleccion.component.scss'
})
export class SeleccionComponent implements OnInit {
  consolidado : Consolidado = new Consolidado();
  seleccionado?:Empresa;
  public selectionForm: FormGroup;

  constructor(private empresaService: EmpresaService, 
              private activatedRoute: ActivatedRoute, 
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private router: Router) {
    this.selectionForm = this.formBuilder.group({
      seleccion: ['', Validators.required]
    });
  }

  public seleccionarEmpresa(): void {
    if (this.selectionForm.valid) {
      this.seleccionado = new Empresa();
      const codigoEmpresaSeleccionada = this.selectionForm.get('seleccion')?.value;
      const empresaSeleccionada = this.consolidado.empresas.find(empresa => empresa.codigo === codigoEmpresaSeleccionada);
      this.seleccionado = empresaSeleccionada;

      if (this.seleccionado?.codigo && this.seleccionado?.razonSocial){
        sessionStorage.setItem(environment.session.ID_EMPRESA, this.seleccionado.codigo.toString());
        sessionStorage.setItem(environment.session.NOMBRE_EMPRESA, this.seleccionado?.razonSocial);
        this.router.navigate(['/content']);
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error!', detail: 'No se seleccionó empresa', life: 5000 });
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe (params => {

      let user: string | null = sessionStorage.getItem(environment.session.USERNAME)!;

      this.empresaService.getempresas(user)
        .subscribe(response => {
          if (response.cantEmpVinculadas <= 1) {
            this.seleccionado = response.empresas[0];
            if (this.seleccionado?.codigo && this.seleccionado?.razonSocial){
              sessionStorage.setItem(environment.session.ID_EMPRESA, this.seleccionado.codigo.toString());
              sessionStorage.setItem(environment.session.NOMBRE_EMPRESA, this.seleccionado?.razonSocial);
              this.router.navigate(['/content']);
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error!', detail: 'No se encontró empresas vinculadas', life: 5000 });
            }
          } else {
            this.consolidado = response as Consolidado;
          }
        });
    })
  }
}
