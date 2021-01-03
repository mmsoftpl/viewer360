
export const GetServiceAddress = () => {
    let s = `${window.location}`;
    const str = s.split("/");

    s = s.replace(str[str.length - 1], "");
    return s;
}

export function testCors(url) {
    var myRequest = new XMLHttpRequest();
    myRequest.open('GET', url, true);
    myRequest.onreadystatechange = () => {
        if (myRequest.readyState !== 4) {
            return;
        }
        if (myRequest.status === 200) {
            console.log(url, 'ok');
        } else {
            var myImage = document.createElement('img');
            myImage.onerror = (...args) => { console.log(url, 'other type of error', args); }
            myImage.onload = () => { console.log(url, 'image exists but cors blocked'); }
            myImage.src = url;
            console.log(url, 'Image not found');
        }
    };
    myRequest.send();
}


export const getQueryParam = (url, name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export const eventFire = (el, etype) => {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}


export function IsEmpty(value) {
    if (typeof value === "undefined") return true;
    if (value == null) return true;

    if (Array.isArray(value) || IsString(value))
        return value.length == 0;

    return Object.keys(value).length === 0 && value.constructor === Object;
}