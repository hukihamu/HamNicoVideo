export interface ParameterStaticValues<T extends ValuesBase<any>> extends ParameterBaseValue{
    templateKey: (keyof T)[]
    values: T[]
}