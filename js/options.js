function showSave() {
    const saveElement = document.getElementById('save')
    saveElement.classList.remove('is-show')
    saveElement.onanimationcancel
    saveElement.classList.add('is-show')
}

function onClickExportOption() {
    const e = new Blob([JSON.stringify(BStorage.cache)])
    const date = new Date()
    const t = `HamNicoVideo ${date.toLocaleString('ja-JP')}.json`
    const o = document.createElement('a')
    o.href = 'string' == typeof e ? e : URL.createObjectURL(e)
    o.download = t
    o.dispatchEvent(new MouseEvent('click'))
}

function onClickImportOption() {
    document.getElementById('import_input').click()
}

function onClickInputImportOption(e) {
    const file = e.target.files[0]
    const t = new FileReader
    t.addEventListener('load', (() => {
        let e
        try {
            e = JSON.parse(t.result)
        } catch (e) {
            console.group('Import')
            console.error('Failed to read settings file')
            console.error(e)
            console.groupEnd()
            alert('インポートに失敗しました')
            return
        }
        for (const key in BStorage.defaults){
            BStorage.set(key,BStorage.defaults[key])
        }
        for (const key in e){
            BStorage.set(key,e[key])
        }
        alert('インポートしました')
        window.location.reload()
    }))
    t.readAsText(file)
}

function onClickDefault(event) {
    const key = event.target.dataset.id
    const dValue = BStorage.defaults[key]
    const input = document.getElementById(key)
    if (typeof dValue === 'boolean') {
        input.checked = dValue
    } else {
        input.value = dValue
    }
    const e = document.createEvent('event')
    e.initEvent('change', true, true)
    input.dispatchEvent(e)
}

function onClickEnable(event) {
    const target = event.target
    const tr = target.parentElement.parentElement
    const table = tr.parentElement
    const level = tr.dataset['level']
    let isStart = false
    for (const child of table.children) {
        if (isStart) {
            if (child.dataset['level'] > level) {
                if (target.checked || target.selectedIndex !== 0) {
                    child.classList.remove('input-disabled')
                } else {
                    child.classList.add('input-disabled')
                }
            } else {
                break
            }
        } else if (child === tr) {
            isStart = true
        }
    }
}

function setMainView(param, level) {
    for (const p in param) {
        const tr = document.createElement('tr')
        tr.dataset['level'] = level
        document.getElementById('main').appendChild(tr)
        if (param[p] instanceof PValue) {
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
            button.innerText = 'デフォルト'
            button.dataset.id = pv.key
            button.addEventListener('click', onClickDefault)
            const tdDefault = document.createElement('td')
            tdDefault.className = 'td-default'
            tdDefault.appendChild(button)


            if (p === 'ENABLE') {
                tr.remove()
                const hTR = document.getElementById('main').lastChild
                hTR.firstChild.colSpan = 1
                tdInput.addEventListener('change', onClickEnable)
                hTR.appendChild(tdInput)
                hTR.appendChild(tdDefault)
            } else {
                tr.appendChild(tdLabel)
                tr.appendChild(tdInput)
                tr.appendChild(tdDefault)
            }

        } else {
            const text = PARAMETER_TITLE[p] === undefined ? p : PARAMETER_TITLE[p]

            const h = document.createElement('h' + level)
            h.innerText = text
            h.id = p

            const td = document.createElement('td')
            td.appendChild(h)
            td.colSpan = 3

            tr.appendChild(td)

            //side
            const a = document.createElement('a')
            a.innerText = text
            a.href = '#' + p

            const li = document.createElement('li')
            li.appendChild(a)

            let parent = document.getElementById('sidebar')
            for (let i = 0; i < level; i++) {
                const child = document.createElement('ul')
                parent.appendChild(child)
                parent = child
            }
            parent.appendChild(li)

            setMainView(param[p], level + 1)
        }
    }
}

const options = async function () {
    await BStorage.init()

    setMainView(PARAMETER, 1)


    const saveElement = document.getElementById('save')
    saveElement.onanimationend = () => {
        saveElement.classList.remove('is-show')
    }
    const script = document.createElement('script')
    script.src = '/lib/jscolor.js'
    document.head.appendChild(script)


    //export
    document.getElementById('export').addEventListener('click', onClickExportOption)
    document.getElementById('import').addEventListener('click', onClickImportOption)
    document.getElementById('import_input').addEventListener('change', onClickInputImportOption)
}
document.addEventListener('DOMContentLoaded', options, true)

