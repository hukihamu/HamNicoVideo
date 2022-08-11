import message from '@/message';

export const popupMain = ()=>{
    document.getElementById('notification_edit').addEventListener('click', ()=>{
        window.location.href = '/html/popup_edit_notify.html?add'
    })
    message.send('list', undefined, (resultValue)=>{
        console.log(resultValue)
        // TODO
    })
}