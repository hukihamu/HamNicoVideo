import {ParameterTemplateValue} from '@/storage/parameters/parameter_value/parameter_base_value';

export interface ParameterSelectValue extends ParameterTemplateValue{
    config: {
        enable: boolean
        templateVersion: number
        selectIndex: number
    }
    template: {
        selectList: {
            name: string,
            value: string
        }[]
    }
}