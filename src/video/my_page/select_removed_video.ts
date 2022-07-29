// TODO マイリスなどで、削除されている動画を選択

// function onCheckRemovedVideo(menu) {
//     const div = document.createElement('div')
//     div.id = 'onCheckRemovedVideo'
//
//     const btn = document.createElement('button')
//     btn.textContent = '削除選択'
//     btn.className = 'VideoListEditMenuButton'
//     btn.addEventListener('click',()=>{
//         const list = []
//         for (const image of document.getElementsByClassName('NC-Thumbnail-image')){
//             if (image.getAttribute('aria-label').match('(削除された動画)|(非公開動画)')){
//                 const input = getParent(image,7).getElementsByClassName('Checkbox-input')[0]
//                 if (!input.checked){
//                     list.push(input)
//                 }
//             }
//         }
//         for (const input of list){
//             input.click()
//         }
//     })
//     div.appendChild(btn)
//
//     const oldDiv = document.getElementById('onCheckRemovedVideo')
//     if (oldDiv){
//         oldDiv.remove()
//     }
//
//     menu.parentElement.insertBefore(div,menu)
//
// }
//
// function getParent(element, count){
//     if (count <= 0){
//         return element
//     }
//     return getParent(element.parentElement,count - 1)
// }