import storage from '@/storage';

export const onSetMinimizeLike = ()=>{
    const likeDiv = document.getElementsByClassName("VideoMenuLikeFieldContainer")[0]
    if (likeDiv){
        const param = storage.get("Video_Watch_MinimizeLike")
        likeDiv.classList.add(param.selectList[param.selectIndex].value)
    }
}