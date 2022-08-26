






export default {
    findIndex<T extends ValuesBase<K>, K>(findId: K, values: T[]): number{
        return values.findIndex(value =>value.valueId === findId)
    },
    findValue<T extends ValuesBase<K>, K>(findId: K, values: T[]): T | undefined{
        return values.find(value =>value.valueId === findId)
    },
    formatNumber(num: number): string{
        const numString = num.toString()
        if (numString.length <= 4){
            // 4桁以下
            return num.toLocaleString('ja-JP')
        }else if (numString.length % 4 === 0){
            // TODO 1,000表記
            return num.toLocaleString('ja-JP')
        }else {
            const place = ['', '万', '億']
            let kDotText = ''
            let cnt = 1
            for (let i = numString.length - 1; i >= 0; i--){
                kDotText = numString[i] +  kDotText
                if (cnt % 4 === 0){
                    kDotText = '.' +  kDotText
                }
                cnt++
            }
            return (kDotText.match(/(^\d\.\d\d)|(^\d\d\.\d)|^\d{3}/) ?? [''])[0] + place[Math.floor(numString.length / 4)]
        }
    },
    throwText(text: string): never {
        throw new Error(text)
    },
    isArrayOf<T>(values: any[], ...keys: (keyof T)[]): values is Array<T>{
        return values.every(value => keys.every(key=>this.isInstanceOf(value, key)));
    },
    isInstanceOf<T>(value: any, key: keyof T): value is T {
        return key in value
    },
    isInstancesOf<T>(value: any, ...keys: (keyof T)[]): value is T{
        return keys.every(key=>key in value)
    },
    getRandomString(n: number): string{
        const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        return Array.from(crypto.getRandomValues(new Uint32Array(n)))
          .map((v) => S[v % S.length])
          .join('');
    },

    getRandomNumber(n: number): number{
        const S = '0123456789';
        return Number.parseInt(Array.from(crypto.getRandomValues(new Uint32Array(n)))
          .map((v) => S[v % S.length])
          .join(''));
    },
    /**
     * オブジェクトのKeyをソートしつつ出力
     */
    objectToKeyArray<T>(o: {[p in keyof T]: any }): (keyof T)[]{
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