function showSave() {
    const saveElement = document.getElementById('save')
    saveElement.classList.remove('is-show')
    saveElement.onanimationcancel
    saveElement.classList.add('is-show')
}
function onClickDefault(event) {
    const key = event.target.dataset.id
    const dValue = BStorage.defaults[key]
    const input = document.getElementById(key)
    if (typeof dValue === 'boolean'){
        input.checked = dValue
    }else {
        input.value = dValue
    }
    const e = document.createEvent('event')
    e.initEvent('change',true,true)
    input.dispatchEvent(e)
}
function setMainView(param,level){
    for (const p in param){
        const tr = document.createElement('tr')
        document.getElementById('main').appendChild(tr)
        if (param[p] instanceof PValue){
            const pv = param[p]
            const label = document.createElement('label')
            label.innerText = PARAMETER_TEXT[pv.key] === undefined ? p : PARAMETER_TEXT[pv.key]
            const tdLabel = document.createElement('td')
            tdLabel.className = 'td-label'
            tdLabel.appendChild(label)

            const input = pv.input
            const tdInput = document.createElement('td')
            tdInput.className = 'td-input'
            tdInput.appendChild(input)

            const button = document.createElement('button')
            button.innerText = "デフォルト"
            button.dataset.id = pv.key
            button.addEventListener('click',onClickDefault)
            const tdDefault = document.createElement('td')
            tdDefault.className = 'td-default'
            tdDefault.appendChild(button)


            tr.appendChild(tdLabel)
            tr.appendChild(tdInput)
            tr.appendChild(tdDefault)
        }else {
            const h = document.createElement('h' + level)
            h.innerText = PARAMETER_TITLE[p] === undefined ? p : PARAMETER_TITLE[p]

            const td = document.createElement('td')
            td.appendChild(h)
            td.colSpan = 3

            tr.appendChild(td)
            setMainView(param[p],level + 1)
        }
    }
}

const options = async function () {
    await BStorage.init()

    setMainView(PARAMETER,1)

    const saveElement = document.getElementById('save')
    saveElement.onanimationend = ()=>{
        saveElement.classList.remove('is-show')
    }
    const script = document.createElement('script')
    script.src = '/lib/jscolor.js'
    document.head.appendChild(script)
}
document.addEventListener("DOMContentLoaded", options,true);
