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
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    let songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith('.mp3')){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }

    return songs

}

const playMusic = (track, pause = false)=>{

    // let audio = new Audio('/songs/'+track)
    currentsong.src = `/${currfolder}/`+track
    if (!pause) {
        currentsong.play()
        play.src = 'pause.svg'
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

async function main(){

    const filterBtn = document.getElementById('filter')
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]

    updatedSongsList = (songs)=>{
        songUL.innerHTML = ""
        for (let song of songs){
            songUL.innerHTML = songUL.innerHTML + `<li>
                                <img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll('%20',' ')}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div>
                   </li>`
        }
    }

    filterBtn.addEventListener('click',async ()=>{
        let songs = await filter('songs/new-songs')
        console.log(songs)
        playMusic(songs[0] , true)
        updatedSongsList(songs)
    
    })
    songs = await getSongs('songs/new-songs');
    console.log(songs)
    playMusic(songs[0] , true)
    updatedSongsList(songs)
    
    document.querySelector('.songlist').addEventListener('click', (event) => {
        let songElement = event.target.closest('li'); // Check if clicked inside <li>
        if (songElement) {
            let songName = songElement.querySelector('.info > div').innerText.trim();
            playMusic(songName);
        }
    });

    let play = document.getElementById('play')

    play.addEventListener('click',()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src = 'pause.svg'
        }
        else{
            currentsong.pause()
            play.src = 'play.svg'
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
        if((index+1) <  songs.length-1){
            playMusic(songs[index+1])
        }
    })

    Array.from(document.getElementsByClassName('card')).forEach((e)=>{
        e.addEventListener('click',async (item)=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })
}
main()
