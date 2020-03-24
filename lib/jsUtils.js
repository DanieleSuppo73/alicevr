/* wait to resolve for a key-value of an object */
export const waitObjectProperty = (object, key, value) =>
    new Promise(resolve => setTimeout(() => {
        if (object[key] === value) resolve();
        else {
            setTimeout(function () {
                resolve(waitObjectProperty(object, key, value));
            }, 0);
        }
    }, 50));



/* load xml file from url */
export function loadXml(url) {
    return new Promise(function (resolve) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(xhttp.responseXML);
            };
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    });
};