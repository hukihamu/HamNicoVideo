document.addEventListener('DOMContentLoaded',async ()=>{
    await BStorage.init()

    document.getElementById('notification').addEventListener('click',()=>{
        window.location.href = '/html/popup.html'
    })
    const listBody = document.getElementById('body')

})