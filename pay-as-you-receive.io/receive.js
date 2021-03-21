var queryParams = window.location.search.substr(1).split('&').reduce(function (accumulator, singleQueryParam) {
    var _a = singleQueryParam.split('='), key = _a[0], value = _a[1];
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
}, {});
var payloadEncoded = queryParams["payload"];
var payload = decodeURI(payloadEncoded).split("\n");
document.getElementById("received_senderemail").innerText = payload[0];
document.getElementById("received_subject").innerText = payload[1];
