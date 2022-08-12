interface ParameterDynamicValues<T extends ValuesBase<number>> extends ParameterBaseValue{
    dynamicValues: T[]
}