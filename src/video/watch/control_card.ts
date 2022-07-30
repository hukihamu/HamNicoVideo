// 動画下のHam専用操作場所
export const onSetControlCard = {
    init: () => {
        const cardMain = document.createElement('div')
        cardMain.className = 'Card-main'
        cardMain.id = 'Ham-Card-main'

        const cardTitle = document.createElement('h1')
        cardTitle.className = 'Card-title'
        cardTitle.innerText = 'Hamオプション'
        const cardHeader = document.createElement('div')
        cardHeader.className = 'Card-header'
        cardHeader.appendChild(cardTitle)

        const card = document.createElement('div')
        card.className = 'Card'
        card.appendChild(cardHeader)
        card.appendChild(cardMain)
        const inView = document.createElement('div')
        inView.className = 'InView'
        inView.appendChild(card)

        const sideGrid = document.getElementsByClassName('BottomSideContainer')[0]
        sideGrid.prepend(inView)
    },
    /**
     * カード内にグリッドを生成
     */
    createGrid: (): HTMLDivElement=>{
        const parent = document.getElementById('Ham-Card-main')
        const div = document.createElement('div')
        div.className = 'Grid'
        parent.appendChild(div)
        return div
    },
    /**
     * グリッド内にCellを作成
     * @param grid 親のGrid
     * @param isFill 横に埋めるか
     */
    createGridCell: (grid: HTMLDivElement, isFill: boolean = false): HTMLDivElement =>{
        const div = document.createElement('div')
        div.className = 'GridCell' + isFill ? ' col-fill' : ''
        grid.appendChild(div)
        return div
    }
}