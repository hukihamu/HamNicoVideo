import {ParameterBaseValue} from '@/storage/parameters/parameter_value/parameter_base_value';

export interface ParameterStaticValues<T extends ValuesTemplate<K>, K extends string | number> extends ParameterBaseValue{
    template: {
        values: {
            [key in K]: T['template']
        }
    }
    config: {
        enable: boolean
        templateVersion: number
        values: T['config'][]
    }
}