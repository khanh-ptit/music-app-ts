function decodeHtml(html) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
}

function removeBrTags(str) {
    return str.replace(/<br\s*\/?>/gi, '\n');  // Replace <br> tags with newline or other separator
}

// Đảm bảo toastr đã được nhúng vào trước đoạn cấu hình này
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

// Aplayer
const aplayer = document.getElementById("aplayer")
if (aplayer) {
    let dataSong = aplayer.getAttribute("data-song")
    dataSong = JSON.parse(dataSong)
    dataSong.lyrics = decodeHtml(dataSong.lyrics);
    dataSong.lyrics = removeBrTags(dataSong.lyrics);
    console.log(dataSong.lyrics)
    let dataSinger = aplayer.getAttribute("data-singer")
    dataSinger = JSON.parse(dataSinger)
    const ap = new APlayer({
        container: aplayer,
        lrcType: 1,
        audio: [{
            name: dataSong.title,
            artist: dataSinger.fullName,
            url: dataSong.audio,
            cover: dataSong.avatar,
            lrc: dataSong.lyrics
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

    // Sau này bọc tính năng trong setTimeout để tránh bị spam lượt xem
    ap.on('ended', () => {
        const link = `/songs/listen/${dataSong._id}`

        const option = {
            method: "PATCH"
        }

        fetch(link, option)
            .then(res => res.json())
            .then(data => {
                const spanCountListen = document.querySelector(".inner-listen span")
                spanCountListen.innerHTML = `${data.listen} Lượt nghe`
            })
    })
}
// End aplayer

// Show success status
const showAlert = document.querySelector("[show-alert]");
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
};
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
                if (data.code == 200) {
                    const span = btnLike.querySelector("span")
                    span.innerHTML = `${data.like} Thích`

                    btnLike.classList.toggle("active")
                    if (btnLike.classList.contains("active")) {
                        toastr.success("Đã thích bài hát")
                    } else {
                        toastr.success("Đã hủy thích bài hát")
                    }
                }

                else if (data.code == 403) {
                    toastr.error(data.message);
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
                        // console.log("*")
                        console.log(btnFavorite.classList.contains("active"))
                        if (btnFavorite.classList.contains("active")) {
                            
                            toastr.success(`Đã thêm vào danh sách yêu thích`);
                        } else {
                            toastr.success(`Đã xóa khỏi danh sách yêu thích`);
                        }
                    }

                    else if (data.code == 403) {
                        toastr.error(data.message);
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

// Btn-more-topics
const btnMoreTopics = document.querySelector("[button-more-topics]")
if (btnMoreTopics) {
    btnMoreTopics.addEventListener("click", () => {

    })
}

// Pagination
const listButtonPagination = document.querySelectorAll("[button-pagination]")
if (listButtonPagination.length > 0) {
    let url = new URL(window.location.href)
    listButtonPagination.forEach(button => {
        button.addEventListener("click", () => {
            const currentPage = button.getAttribute("button-pagination")
            if (currentPage) {
                url.searchParams.set("page", currentPage)
            } else {
                url.searchParams.delete("page")
            }
            window.location.href = url.href
        })
    })
}
// End Pagination