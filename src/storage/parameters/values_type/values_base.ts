interface ValuesBase<K extends string | number>{
    config: {
        valueId: K
    }
}
interface ValuesTemplate<K extends string | number> extends ValuesBase<K>{
    config: {
        valueId: K
    },
    template: {

    }
}