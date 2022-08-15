import {throwText} from '@/util';

export const doc = {
    getElementById<T extends HTMLElement>(id: string): T{
        return document.getElementById(id) as T ?? throwText(`getElementById取得に失敗\n id: ${id}`)
    },
    getElementsByFirstClassName<T extends HTMLElement>(className: string, element?: HTMLElement): T{
        return (element ?? document).getElementsByClassName(className)[0] as T
    }
}