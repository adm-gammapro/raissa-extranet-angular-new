import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'claseUsuarioLabel',
  standalone: true
})
export class ClaseUsuarioLabelPipe implements PipeTransform {

  transform(value: string): string {
    const labels: Record<string, string> = {
      'S': 'Supervisor',
      'O': 'Operativo',
    };

    return labels[value] || value;
  }
}
