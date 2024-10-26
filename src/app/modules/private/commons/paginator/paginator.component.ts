import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { Paginator } from '../../../../apis/model/commons/paginator';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule,
            FormsModule,
            ...PRIME_NG_MODULES],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent implements OnInit {
  @Input() paginatorInput?: Paginator;
  @Output() paginatorOutput = new EventEmitter<Paginator>();
  paginator: Paginator = new Paginator();

  options = [
    5, 10, 20
  ];

  ngOnInit(): void {
    if (this.paginatorInput != undefined) {
      this.paginator = this.paginatorInput;
    }
  }

  onPageChange(event: PaginatorState) {
    if (event.first!=undefined) {
      this.paginator.primerRegistroVisualizado = event.first;
    }
    if (event.rows!=undefined) {
      this.paginator.cantidadRegistros = event.rows;
    }
    if (event.page!=undefined) {
      this.paginator.numeroPagina = event.page;
    }
    this.paginatorOutput.emit(this.paginator);
  }
}
