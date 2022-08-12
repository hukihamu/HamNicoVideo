export const isArrayOf = <T>(values: any[], ...keys: (keyof T)[]): values is Array<T> =>
    values.every(value => keys.every(key=>isInstanceOf(value, key)));

export const isInstanceOf = <T>(value: any, key: keyof T): value is T => key in value
export const isInstancesOf = <T>(value: any, ...keys: (keyof T)[]): value is T => keys.every(key=>key in value)

/**
 * オブジェクトをKeyでソートしつつArrayに変換
 * @param o オブジェクト
 */
export const objectToSortArray = <T>(o: {[p: string]: T}): T[]=>{
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
export const objectToKeyArray = <T>(o: {[p in keyof T]: any }): (keyof T)[]=>{
    const v = Object.keys(o).sort((a, b)=>{
        const nameA = a.toUpperCase(); // 大文字と小文字を無視する
        const nameB = b.toUpperCase(); // 大文字と小文字を無視する
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        // names must be equal
        return 0;
    })
    return v as (keyof T)[]
}
/**
 * オブジェクトをKeyでソートしつつKeyValueObjectArrayに変換
 * @param o オブジェクト
 */
export const objectToSortArrayObject = <T>(o: {[p: string]: T}): {key: string, value: T}[]=>{
    const v = Object.entries(o).sort((a, b)=>{
        const nameA = a[0].toUpperCase(); // 大文字と小文字を無視する
        const nameB = b[0].toUpperCase(); // 大文字と小文字を無視する
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        // names must be equal
        return 0;
    })
    return v.map(v => ({key: v[0], value: v[1]}))
}


const userAgent = window.navigator.userAgent.toLowerCase()
let browserInstance
if (userAgent.indexOf('chrome') !== -1) {
    browserInstance = chrome
// } else if (userAgent.indexOf('firefox') !== -1) {
//     browserInstance = browser
} else {
    console.error('知らないブラウザ')
}
export const BROWSER = browserInstance