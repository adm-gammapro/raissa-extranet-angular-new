import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'tipoUsuarioLabel',
  standalone: true
})
export class TipoUsuarioLabelPipe implements PipeTransform {

  transform(value: string): string {
    const labels: Record<string, string> = {
      'U': 'Funcionario',
      'A': 'Administrador',
    };

    return labels[value] || value;
  }
}
