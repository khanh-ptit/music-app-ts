// Aplayer
const ap = new APlayer({
    container: document.getElementById('aplayer'),
    audio: [{
        name: 'Cắt đôi nỗi sầu',
        artist: 'Tăng Duy Tân',
        url: 'https://backend.daca.vn/assets/audios/cat-doi-noi-sau.mp3',
        cover: 'https://backend.daca.vn/assets/images/cat-doi-noi-sau.jpg'
    }]
});

const container = document.getElementById("aplayer")
console.log(container)
// End aplayer