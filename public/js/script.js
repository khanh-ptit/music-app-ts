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

// Show success status
document.addEventListener("DOMContentLoaded", function () {
    const showAlert = document.querySelector("[show-alert]");
    // const btnCancel = showAlert.querySelector("span.alert-hidden")
    if (showAlert) {
        const btnCancel = showAlert.querySelector("span.btn-cancel")
        // console.log(btnCancel)
        btnCancel.addEventListener("click", () => {
            showAlert.classList.add("alert-hidden")
        })
        const time = parseInt(showAlert.getAttribute("data-time"));
        setTimeout(() => {
            showAlert.classList.add("alert-hidden");
        }, time);
    }
});
// End show success status

// Button like
const btnLike = document.querySelector("[button-like]")
if (btnLike) {
    btnLike.addEventListener("click", () => {
        const idSong = btnLike.getAttribute("button-like")
        
        const isActive = btnLike.classList.contains("active")
        let typeLike = (isActive) ? "dislike" : "like"

        const link = `/songs/like/${typeLike}/${idSong}`
        const option = {
            method: "PATCH"
        }
        
        fetch(link, option)
            .then(res => res.json())
            .then(data => {
                const span = btnLike.querySelector("span")
                span.innerHTML = `${data.like} Thích`

                btnLike.classList.toggle("active")
            })
    })    
}
// End button like
