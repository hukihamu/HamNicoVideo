export interface ValuesCheckBox<K extends string | number> extends ValuesTemplate<K>{
    config: {
        valueId: K,
        enable: boolean
    },
    template: {
        name: string
    }
}