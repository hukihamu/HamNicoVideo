import {popupMain} from '@/popup/main';
import {editNotify} from '@/popup/edit_notify';

const initPopup = async ()=>{
    const pathname = window.location.pathname
    if (pathname.match('popup_main')){
        popupMain()
    }else if(pathname.match('popup_edit_notify')){
        await editNotify()
    }
}
window.addEventListener('DOMContentLoaded', initPopup)