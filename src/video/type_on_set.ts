export type OnSetRepoItem = (itemElement: HTMLDivElement)=>void
export type OnSetRepoSidebar = ()=>void
export interface OnSetNicoRepo {
    item: OnSetRepoItem,
    sideBar: OnSetRepoSidebar
}