const queryParams = window.location.search.substr(1).split('&').reduce((accumulator, singleQueryParam) => {
    const [key, value] = singleQueryParam.split('=');
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
}, {})

let payloadEncoded = queryParams["payload"];
let payload = decodeURI(payloadEncoded).split("\n");

document.getElementById("received_senderemail").innerText = payload[0];
document.getElementById("received_subject").innerText = payload[1];