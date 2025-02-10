import { Pipe, PipeTransform } from '@angular/core';
import { EstadoRegistroEnum, EstadoRegistroLabels } from '../enums/estado-registro';

@Pipe({
  name: 'estadoRegistroLabel',
  standalone: true
})
export class EstadoRegistroLabelPipe implements PipeTransform {
  transform(value: keyof typeof EstadoRegistroEnum): string {
    const enumValue = EstadoRegistroEnum[value];
    return EstadoRegistroLabels[enumValue] || value;
  }
}