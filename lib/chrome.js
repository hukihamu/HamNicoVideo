function getLocal(_key, typeOf) {
    let _value = localStorage.getItem(_key)
    if (typeOf !== undefined){
        if (typeOf === Boolean){
            if (_value === null){
                _value = ""
            }
            _value = _value.toLowerCase() === "true"
        }else {
            _value = typeOf(_value)
        }
    }
    return  _value
}
function setLocal(_key, _value) {
    localStorage.setItem(_key,_value)
}