export const isArrayOf = <T>(values: any[], ...keys: (keyof T)[]): values is Array<T> =>
    values.every(value => keys.every(key=>isInstanceOf(value, key)));

export const isInstanceOf = <T>(value: any, key: keyof T): value is T => key in value
export const isInstancesOf = <T>(value: any, ...keys: (keyof T)[]): value is T => keys.every(key=>key in value)


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

export const getRandomString = (n: number): string =>{
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return Array.from(crypto.getRandomValues(new Uint32Array(n)))
        .map((v) => S[v % S.length])
        .join('');
}
export const getRandomNumber = (n: number): number =>{
    const S = '0123456789';
    return Number.parseInt(Array.from(crypto.getRandomValues(new Uint32Array(n)))
        .map((v) => S[v % S.length])
        .join(''));
}

export const findValue = <T extends ValuesBase<K>, K>(findId: K, values: T[]): T=>{
    return values.find(value =>value.valueId === findId)
}

// const userAgent = window.navigator.userAgent.toLowerCase()
// let browserInstance
// if (userAgent.indexOf('chrome') !== -1) {
//     browserInstance = chrome
// // } else if (userAgent.indexOf('firefox') !== -1) {
// //     browserInstance = browser
// } else {
//     console.error('知らないブラウザ')
// }
// export const BROWSER = browserInstance