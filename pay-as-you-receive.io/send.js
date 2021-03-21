var queryParams = window.location.search.substr(1).split('&').reduce(function (accumulator, singleQueryParam) {
    var _a = singleQueryParam.split('='), key = _a[0], value = _a[1];
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
}, {});
var isSender = typeof (queryParams["payload"]) == "undefined";
document.getElementById("send").hidden = isSender == false;
document.getElementById("receive").hidden = isSender;
var btnEncrypt = document.getElementById("encrypt");
btnEncrypt.onclick = function () {
    var senderEmail = document.getElementById("senderemail").value;
    var subject = document.getElementById("subject").value;
    var package = document.getElementById("package").value;
    var payloadEncoded = encodeURI(senderEmail + "\n" + subject + "\n" + package);
    document.getElementById("payload").innerText = payloadEncoded;
    navigator.clipboard.writeText(payloadEncoded)
        .then(function () {
    })
        .catch(function (err) {
        alert('Error in copying text: ' + err);
    });
};
var btnGotoReceive = document.getElementById("gotoreceive");
btnGotoReceive.onclick = function () {
    var payload = document.getElementById("payload").innerText;
    var receiveURI = "http://" + window.location.host + window.location.pathname + "?payload=" + payload;
    window.location.replace(receiveURI);
};
