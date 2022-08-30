import {ParameterBaseValue} from '@/storage/parameters/parameter_value/parameter_base_value';

export interface ParameterDynamicValues<T extends ValuesBase<number>> extends ParameterBaseValue{
    config: {
        enable: boolean
        dynamicValues: T[]
    }
}