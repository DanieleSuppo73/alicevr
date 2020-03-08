/// get the Parameters from iframe declaration in html page
function getParameterFromIframe(parameter) {
    let url = window.location.search.substring(1); //get rid of "?" in querystring
    let qArray = url.split('&'); //get key-value pairs
    for (let i = 0; i < qArray.length; i++) {
        let pArr = qArray[i].split('='); //split key and value
        if (pArr[0] === parameter)
            return pArr[1]; //return value
    }
}