export type OnSetRepoItem = (itemElement: HTMLDivElement)=>void
export type OnSetRepoSidebar = ()=>void
export interface OnSetNicoRepo {
    item: OnSetRepoItem,
    sideBar: OnSetRepoSidebar
}

/**
 * @param grid 行エレメント
 * @param createGridCell cell作成fun 行エレメントを渡すと自動で子供を生成される
 */
export type OnSetCardGrid = (grid: HTMLDivElement, createGridCell: (grid: HTMLDivElement, isFill?: boolean)
    => HTMLDivElement)=>void

