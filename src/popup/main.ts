export const popupMain = ()=>{
    document.getElementById('notification_edit').addEventListener('click', ()=>{
        window.location.href = '/html/popup_edit_notify.html?add'
    })
}