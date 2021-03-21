const queryParams = window.location.search.substr(1).split('&').reduce((accumulator, singleQueryParam) => {
    const [key, value] = singleQueryParam.split('=');
    accumulator[key] = decodeURIComponent(value);
    return accumulator;
}, {})

let isSender = typeof(queryParams["payload"]) == "undefined";
document.getElementById("send").hidden = isSender == false;
document.getElementById("receive").hidden = isSender;


let btnEncrypt = document.getElementById("encrypt");
btnEncrypt.onclick = () => {
    let senderEmail = (document.getElementById("senderemail") as HTMLInputElement).value;
    let subject = (document.getElementById("subject") as HTMLInputElement).value;
    let package = (document.getElementById("package") as HTMLInputElement).value;

    let payloadEncoded = encodeURI(senderEmail + "\n" + subject + "\n" + package);
    document.getElementById("payload").innerText = payloadEncoded;

    navigator.clipboard.writeText(payloadEncoded)
        .then(() => {
        })
        .catch(err => {
            alert('Error in copying text: ' + err);
        });
}


let btnGotoReceive = document.getElementById("gotoreceive");
btnGotoReceive.onclick = () => {
    let payload = document.getElementById("payload").innerText;
    let receiveURI = "http://" + window.location.host + window.location.pathname + "?payload=" + payload;
    window.location.replace(receiveURI);
}