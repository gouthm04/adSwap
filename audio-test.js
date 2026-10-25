const player = document.getElementById("player");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");


playButton.addEventListener("click",async () => {
    try{
        player.currentTime = 0;
        await player.play();
        console.log("Audio is playing successfully!");

    }catch(error){

        console.error("Playback Failed : ", error.name, error.message);
    }
})

pauseButton.addEventListener("click",() => {
    player.pause()
})