

const synth = new Tone.Synth().toDestination();
const resetGame = async () => {
    try {
        const response = await axios.put("http://localhost:3000/api/v1/game-state");
        
        //  reset game values if needed
        gameSequence = response.data.sequence;
        userSequence = [];
        level = 1;
        
        // update the UI
        document.getElementById("high-score").innerText = response.data.gameState.highScore;
        document.getElementById("level-indicator").innerText = level;
        document.getElementById("start-btn").disabled = false;
        document.getElementById("replay-btn").disabled = true;

        document.getElementById("pad-red").disabled = true;
        document.getElementById("pad-yellow").disabled = true;
        document.getElementById("pad-green").disabled = true;
        document.getElementById("pad-blue").disabled = true;
    } catch (error) {
        console.error("Error resettig game:", error);
    }
};

const startGame = async () => {
    try {
        await Tone.start();
        const response = await axios.get("http://localhost:3000/api/v1/game-state");

        gameSequence = response.data.sequence; 
        userSequence = [];

        //update UI for starting game
        document.getElementById("start-btn").disabled = true;
        document.getElementById("replay-btn").disabled = false;

        document.getElementById("pad-red").disabled = false;
        document.getElementById("pad-yellow").disabled = false;
        document.getElementById("pad-green").disabled = false;
        document.getElementById("pad-blue").disabled = false;

        playTune();
        setTimeout(() => playSequence(gameSequence), 2000);
    

    } catch (error) {
        console.error("Error starting game:", error);
    }
};
const playTune = () => { //plays tune when game starts
    try {
        const now = Tone.now();
        
        synth.triggerAttackRelease("C4", "8n", now);
        synth.triggerAttackRelease("F#4", "4n", now + 0.5);
        synth.triggerAttackRelease("D#4", "2n", now + 1);
        
    } catch (error) {
        console.error("Error playing tune:", error);
    }
};

let startTime = Tone.now(); 

const playNote = (color) => {
    try {
        // get selected sound type from the dropdown
        const soundType = document.getElementById("sound-select").value;
        
        // set sound 
        synth.set({ oscillator: { type: soundType } });

        //specific tones for each button
        if (color === "red") synth.triggerAttackRelease("C4", "8n");
        if (color === "yellow") synth.triggerAttackRelease("D4", "8n");
        if (color === "green") synth.triggerAttackRelease("E4", "8n");
        if (color === "blue") synth.triggerAttackRelease("F4", "8n");

    } catch (error) {
        console.error("Error playing note:", error);
    }
};

// user clicks
document.getElementById("start-btn").addEventListener("click", startGame);

const lightUpPad = (color) => {
    const pad = document.getElementById(`pad-${color}`);
    pad.classList.add("active");
    setTimeout(() => pad.classList.remove("active"), 300);
};

// the light up effect for buttons and matching note
document.getElementById("pad-red").addEventListener("click", () => {
    userSequence.push("red");
    playNote("red");
    lightUpPad("red");
    if (userSequence.length === gameSequence.length) checkUserSequence();
});
document.getElementById("pad-yellow").addEventListener("click", () => {
    userSequence.push("yellow");
    playNote("yellow");
    lightUpPad("yellow");
    if (userSequence.length === gameSequence.length) checkUserSequence();
});
document.getElementById("pad-green").addEventListener("click", () => {
    userSequence.push("green");
    playNote("green");
    lightUpPad("green");
    if (userSequence.length === gameSequence.length) checkUserSequence();
});
document.getElementById("pad-blue").addEventListener("click", () => {
    userSequence.push("blue");
    playNote("blue");
    lightUpPad("blue");
    if (userSequence.length === gameSequence.length) checkUserSequence();
});
document.getElementById("replay-btn").addEventListener("click", async () => {
    const response = await axios.get("http://localhost:3000/api/v1/game-state");

    gameSequence = response.data.sequence; 
    playSequence(gameSequence);
});

document.getElementById("reset-btn").addEventListener("click", async () => {

    resetGame();
    document.getElementById("failure-modal").style.display = "none"; // Hide game over modal
});


// handles keyboard push input
document.addEventListener("keydown", (event) => {
    if (event.key === "q") {
        userSequence.push("red");
        playNote("red");
        lightUpPad("red");
    }
    if (event.key === "w") {
        userSequence.push("yellow");
        playNote("yellow");
        lightUpPad("yellow");
    }
    if (event.key === "a") {
        userSequence.push("green");
        playNote("green");
        lightUpPad("green");
    }
    if (event.key === "s") {
        userSequence.push("blue");
        playNote("blue");
        lightUpPad("blue");
    }

    
    if (userSequence.length === gameSequence.length) checkUserSequence();
});


const playSequence = (sequence) => {
    let i = 0;

    const showNext = () => {
        if (i >= sequence.length) return; 

        const color = sequence[i];
        document.getElementById(`pad-${color}`).classList.add("active");
        playNote(color);

        setTimeout(() => {
            document.getElementById(`pad-${color}`).classList.remove("active");
            i++;
            setTimeout(showNext, 500); 
        }, 1000); 
    };

    showNext();
};
const checkUserSequence = async () => { 
    try {

        const response = await axios.post("http://localhost:3000/api/v1/game-state/sequence", {
            sequence: userSequence
        });
        
        
        gameSequence = response.data.gameState.sequence;  // get the new sequence from backend
        userSequence = [];  // reset user sequence

        // update the UI with the new level and high score
        document.getElementById("level-indicator").innerText = response.data.gameState.level;
        document.getElementById("high-score").innerText = response.data.gameState.highScore;

        // play the new sequence (next level)
        setTimeout(() => playSequence(gameSequence), 2000);

    } catch (error) {
        // game over if wrong sequence
        document.getElementById("failure-modal").style.display = "flex"; // Show game over modal
        console.error("Incorrect sequence! Restarting game...");
    }
};

resetGame();