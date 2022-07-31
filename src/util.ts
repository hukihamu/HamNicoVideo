export const isArrayOf = <T>(values: any[], ...keys: (keyof T)[]): values is Array<T> =>
    values.every(value => keys.every(key=>isInstanceOf(value, key)));

export const isInstanceOf = <T>(value: any, key: keyof T): value is T => key in value