// Aplayer
const aplayer = document.getElementById("aplayer")
if (aplayer) {
    let dataSong = aplayer.getAttribute("data-song")
    dataSong = JSON.parse(dataSong)
    let dataSinger = aplayer.getAttribute("data-singer")
    dataSinger = JSON.parse(dataSinger)
    const ap = new APlayer({
        container: aplayer,
        audio: [{
            name: dataSong.title,
            artist: dataSinger.fullName,
            url: dataSong.audio,
            cover: dataSong.avatar,
        }],
        autoplay: true
    });

    const innerAvatar = document.querySelector(".inner-avatar")
    
    ap.on('play', () => {
        innerAvatar.style.animationPlayState = "running"
    })

    ap.on('pause', () => {
        innerAvatar.style.animationPlayState = "paused"
    })
}
// End aplayer