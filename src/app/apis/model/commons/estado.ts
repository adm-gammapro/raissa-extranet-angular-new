export class Estado {
  valor: string;
  descripcion: string;

  constructor(valor: string, descripcion: string) {
    this.valor = valor;
    this.descripcion = descripcion;
  }

  static estados: Estado[] = [
    new Estado('S', 'Activo'),
    new Estado('N', 'Inactivo'),
    new Estado('T', 'Todos'),
  ];

  static estadosSimple: Estado[] = [
    new Estado('S', 'Activo'),
    new Estado('N', 'Inactivo'),
  ];
}
