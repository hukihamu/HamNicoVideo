export interface ParameterStaticValues<T, K extends string> extends ParameterBaseValue{
    templateKey: (keyof T)[]
    values: {
        [key in K]: T
    }
}