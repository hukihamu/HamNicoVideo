export interface ParameterSelectValue extends ParameterBaseValue{
    selectIndex: number
    selectList: {
        name: string,
        value: string
    }[]
}