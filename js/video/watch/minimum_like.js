function minimumLike() {
    const likeField = document.getElementsByClassName('VideoMenuLikeFieldContainer')[0]

    const option = PARAMETER.VIDEO.WATCH.MINIMUM_LIKE.options
    likeField.classList.add(option[PARAMETER.VIDEO.WATCH.MINIMUM_LIKE.pValue].value)
}