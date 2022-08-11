interface ParameterDynamicValues<T> extends ParameterBaseValue{
    dynamicValues: T[]
    createView: (value?: T)=>HTMLDivElement
    getValue: (element: HTMLDivElement)=> T
}