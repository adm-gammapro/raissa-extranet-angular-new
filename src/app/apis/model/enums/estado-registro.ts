export enum EstadoRegistroEnum {
    TODOS = "T",
    VIGENTE = "S",
    NO_VIGENTE = "N",
}

export const EstadoRegistroLabels = {
    [EstadoRegistroEnum.TODOS]: "Todos",
    [EstadoRegistroEnum.VIGENTE]: "Vigente",
    [EstadoRegistroEnum.NO_VIGENTE]: "No vigente"
};

export const EstadoRegistroValue = {
    [EstadoRegistroEnum.TODOS]: "T",
    [EstadoRegistroEnum.VIGENTE]: "S",
    [EstadoRegistroEnum.NO_VIGENTE]: "N"
};