

function setHeader(){
    const header = document.getElementById('CommonHeader')
    const temp = header.getElementsByClassName('common-header-wb7b82')
    if (temp){
        const button = document.createElement('button')
        button.textContent = 'あとで見る'

    }
}

window.addEventListener('load',setHeader)