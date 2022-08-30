export interface ParameterBaseValue {
    config: {
        enable: boolean
    }
}
export interface ParameterTemplateValue extends ParameterBaseValue {
    template: {}
    config: {
        enable: boolean
        templateVersion: number
    }
}