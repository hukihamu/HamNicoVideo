import {ParameterBaseValue} from '@/storage/parameters/parameter_value/parameter_base_value';

export interface ParameterTextValue extends ParameterBaseValue{
    config: {
        enable: boolean
        textValue: string
    }
}