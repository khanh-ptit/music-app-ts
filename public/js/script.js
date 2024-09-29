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
        console.log("*")
        const isActive = btnLike.classList.contains("active")
        let typeLike = (isActive) ? "dislike" : "like"

        const link = `/songs/like/${typeLike}/${idSong}`
        const option = {
            method: "PATCH"
        }

        fetch(link, option)
            .then(res => res.json())
            .then(data => {
                if (data.code == 200) {
                    const span = btnLike.querySelector("span")
                    span.innerHTML = `${data.like} Thích`

                    btnLike.classList.toggle("active")
                }
            })
    })
}
// End button like

// Button favorite
const listbtnFavorite = document.querySelectorAll("[button-favorite]")
if (listbtnFavorite.length > 0) {
    listbtnFavorite.forEach(btnFavorite => {
        btnFavorite.addEventListener("click", () => {
            const idSong = btnFavorite.getAttribute("button-favorite")

            const isActive = btnFavorite.classList.contains("active")
            let typeFavorite = (isActive) ? "unfavorite" : "favorite"

            const link = `/songs/favorite/${typeFavorite}/${idSong}`
            const option = {
                method: "PATCH"
            }

            fetch(link, option)
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        btnFavorite.classList.toggle("active")
                    }
                })
        })
    })
}
// End button favorite

// Search suggest
const boxSearch = document.querySelector(".box-search")
if (boxSearch) {
    const input = boxSearch.querySelector("input[name='keyword']")
    const boxSuggest = boxSearch.querySelector(".inner-suggest")

    input.addEventListener("keyup", (e) => {
        const keyword = input.value

        const link = `/search/suggest?keyword=${keyword}`

        fetch(link)
            .then(res => res.json())
            .then(data => {
                const songs = data.songs
                if (songs.length > 0) {
                    boxSuggest.classList.add("show")
                    let htmls = []

                    songs.forEach(song => {
                        htmls.push(`
                            <a class="inner-item" href="/songs/detail/${song.slug}">
                                <div class="inner-image"><img src=${song.avatar} /></div>
                                <div class="inner-info">
                                    <div class="inner-title">${song.title}</div>
                                    <div class="inner-singer"><i class="fa-solid fa-microphone-lines"> </i> ${song.singerInfo.fullName}</div>
                                </div>
                            </a>
                        `)
                    })
                    
                    const boxList = boxSuggest.querySelector(".inner-list")
                    boxList.innerHTML = htmls.join("")
                    htmls.forEach(item => {
                        console.log(item)
                    })
                } else {
                    boxSuggest.classList.remove("show")
                }
            })
    })

    document.addEventListener("click", (event) => {
        // Check if the clicked target is not the input or the suggestion box
        if (!boxSearch.contains(event.target)) {
            boxSuggest.classList.remove("show")
        }
    })
}
// End search suggest