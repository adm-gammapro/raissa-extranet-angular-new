import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Resumen } from '../../../../../apis/model/module/private/resumen';

@Component({
  selector: 'app-resumen-general-modal',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ...PRIME_NG_MODULES],
  providers: [],
  templateUrl: './resumen-general-modal.component.html',
  styleUrl: './resumen-general-modal.component.scss'
})
export class ResumenGeneralModalComponent {
  @Input() resumen: Resumen = new Resumen();
  @Output() cerrarModal = new EventEmitter<void>();

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
