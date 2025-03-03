let currentsong = new Audio()
let songs ;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60); // Fix applied

    // Format the result
    var formattedMinutes = ('0' + minutes).slice(-2);
    var formattedSeconds = ('0' + remainingSeconds).slice(-2);

    return formattedMinutes + ':' + formattedSeconds;
}

async function filter(folder) {
    let input = document.getElementById('input').value.toLowerCase(); // Convert input to lowercase
    currfolder = folder;
    let songs = await getSongs(folder); // Fetch songs

    // Filter songs based on input
    let filteredSongs = songs.filter(song => {
        let decodedSong = decodeURIComponent(song).toLowerCase(); // Decode and lowercase
        return decodedSong.includes(input);
    });

    // // Show filtered results in the UI
    // let filterDiv = document.getElementById('filter');
    // filterDiv.innerHTML = filteredSongs.length > 0 
    //     ? filteredSongs.map(song => `<p>${decodeURIComponent(song)}</p>`).join('')
    //     : '<p>No results found</p>';
    return filteredSongs
}


async function getSongs(folder){
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith('.mp3')){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
        for (let song of songs){
            songUL.innerHTML = songUL.innerHTML + `<li>
                                <img class="invert" src="images/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll('%20',' ')}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                </div>
                   </li>`
        }

        document.querySelector('.songlist').addEventListener('click', (event) => {
            let songElement = event.target.closest('li'); // Check if clicked inside <li>
            if (songElement) {
                let songName = songElement.querySelector('.info > div').innerText.trim();
                playMusic(songName);
            }
        });

}

const playMusic = (track, pause = false)=>{

    // let audio = new Audio('/songs/'+track)
    currentsong.src = `/${currfolder}/`+track
    if (!pause) {
        currentsong.play()
        play.src = 'images/pause.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track)
    document.querySelector('.songtime').innerHTML = '00:00 / 00:00'

}

// async function songs(){
//     let filterbtn = document.getElementById('filter')
//     filterbtn.addEventListener('click',async ()=>{
//         songs = await filter();
//         playMusic(songs[0] , true)

//         let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
//         for (let song of songs){
//             songUL.innerHTML = songUL.innerHTML + `<li>
//                                 <img class="invert" src="music.svg" alt="">
//                                 <div class="info">
//                                     <div>${song.replaceAll('%20',' ')}</div>
//                                 </div>
//                                 <div class="playnow">
//                                     <span>Play Now</span>
//                                     <img class="invert" src="play.svg" alt="">
//                                 </div>
//                 </li>`
//         }
//         return
//     })
// }

displayAlbum = async ()=>{
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement('div')
    let cardContainer = document.querySelector('.cardContainer')
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes('/songs/')){
            let folder = e.href.split('/').slice(-2)[1]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card" onclick="handlehamburger()">
                        <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                                  <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000000" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                        </div>
                        <img src="	https://i.scdn.co/image/ab67706f0000000254473de875fea0fd19d39037" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description} </p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName('card')).forEach((e)=>{
        e.addEventListener('click',async (item)=>{
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })
}

function handlehamburger(){
    document.querySelector('.left').style.left = '0'
}

async function main(){
    await getSongs('songs/new-songs');
    playMusic(songs[0] , true)

    // Display all the Albums
    displayAlbum()
    let play = document.getElementById('play')

    play.addEventListener('click',()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src = 'images/pause.svg'
        }
        else{
            currentsong.pause()
            play.src = 'images/play.svg'
        }
    })

    currentsong.addEventListener('timeupdate',()=>{
        document.querySelector('.songtime').innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${
            secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector('.circle').style.left = (currentsong.currentTime / currentsong.duration)*100 + '%'    

    })

    document.querySelector('.seekbar').addEventListener('click',e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector('.circle').style.left = percent + '%';
        currentsong.currentTime = ((currentsong.duration)*percent) / 100
    })

    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left = '0'
    })

    document.querySelector('.close').addEventListener('click',()=>{
        document.querySelector('.left').style.left = '-120%'
    })

    previous.addEventListener('click',()=>{
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener('click',()=>{
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if((index+1) <  songs.length){
            playMusic(songs[index+1])
        }
        else{
            index = 0
            playMusic(songs[index])
        }
    })

    
}
main()
