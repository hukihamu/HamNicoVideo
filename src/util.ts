export const isArrayOf = <T>(values: any[], ...keys: (keyof T)[]): values is Array<T> =>
    values.every(value => keys.every(key=>isInstanceOf(value, key)));

export const isInstanceOf = <T>(value: any, key: keyof T): value is T => key in value
export const isInstancesOf = <T>(value: any, ...keys: (keyof T)[]): value is T => keys.every(key=>key in value)

/**
 * オブジェクトをKeyでソートしつつArrayに変換
 * @param o オブジェクト
 */
export const toObjectArray = <T>(o: {[p: string]: T}): T[]=>{
    const v = Object.entries(o).sort((a, b)=>{
        const nameA = a[0].toUpperCase(); // 大文字と小文字を無視する
        const nameB = b[0].toUpperCase(); // 大文字と小文字を無視する
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        // names must be equal
        return 0;
    })
    return v.map(v => v[1])
}
/**
 * オブジェクトのKeyをソートしつつ出力
 */
export const toKeyArray = <T, K extends string>(o: {[p in K]: T}): K[]=>{
    const v = Object.keys(o).sort((a, b)=>{
        const nameA = a.toUpperCase(); // 大文字と小文字を無視する
        const nameB = b.toUpperCase(); // 大文字と小文字を無視する
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        // names must be equal
        return 0;
    })
    return v as K[]
}

