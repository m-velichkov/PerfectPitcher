const audioCache = {};
let randomNote; // Store the current random note to guess
let lastPlayedAudio; // Store the last played audio
let lastPlayedNote; // Store the last played note for random octave repeat
let lastPlayedOctave; // Store the last played octave for same-octave repeat
let isGuessing = false;

function preloadAudio() {
    const notes = ['C', 'CSharp', 'D', 'DSharp', 'E', 'F', 'FSharp', 'G', 'GSharp', 'A', 'ASharp', 'B'];
    const octaves = ['2', '3', '4', '5', '6'];

    notes.forEach(note => {
        audioCache[note] = [];
        octaves.forEach(octave => {
            const audioPath = `audio/${note}${octave}.wav`; // Ensure the path matches your file structure
            const audio = new Audio(audioPath);
            audio.load();
            audioCache[note].push(audio);
        });
    });
}

// Restore selections on page load
window.onload = () => {
    restoreSelections();
    preloadAudio(); // Make sure to load the audio files as well
    // Restore audio duration from local storage
    const savedDuration = localStorage.getItem('audioDuration');
    if (savedDuration) {
        audioDurationSlider.value = savedDuration; // Set the slider to the saved value
        sliderValueDisplay.textContent = savedDuration; // Display the saved value
    } else {
        audioDurationSlider.value = 3; // Set default value if none is saved
        sliderValueDisplay.textContent = 3; // Display the default value
    }
};


// Hamburger menu
const hamburgerButton = document.getElementById('hamburger');
const fullscreenMenu = document.getElementById('fullscreen-menu');
const closeMenuButton = document.getElementById('close-menu');

// Settings menu
const settingsButton = document.getElementById('settings');
const fullscreenSettings = document.getElementById('fullscreen-settings');
const closeSettingsButton = document.getElementById('close-settings');

// Toggle Hamburger Menu
hamburgerButton.addEventListener('click', function () {
    fullscreenMenu.classList.add('show');
});

closeMenuButton.addEventListener('click', function () {
    fullscreenMenu.classList.remove('show');
});

// Toggle Settings Menu
settingsButton.addEventListener('click', function () {
    fullscreenSettings.classList.add('show');
});

closeSettingsButton.addEventListener('click', function () {
    fullscreenSettings.classList.remove('show');
});


const playButton = document.getElementById('playButton');
const repeatSameButton = document.getElementById('repeatSameButton');
const repeatRandomButton = document.getElementById('repeatRandomButton');
const toneButtonsContainer = document.getElementById('tone-buttons');
const toneCheckboxes = document.querySelectorAll('#tone-checkboxes input[type="checkbox"]');
const octaveCheckboxes = document.querySelectorAll('#octave-checkboxes input[type="checkbox"]'); // Selecting octave checkboxes

// Function to save selected checkboxes to localStorage
function saveSelections() {
    const selectedTones = Array.from(toneCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    const selectedOctaves = Array.from(octaveCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    localStorage.setItem('selectedTones', JSON.stringify(selectedTones));
    localStorage.setItem('selectedOctaves', JSON.stringify(selectedOctaves));
}

// Function to restore selections from localStorage
function restoreSelections() {
    const savedTones = JSON.parse(localStorage.getItem('selectedTones'));
    const savedOctaves = JSON.parse(localStorage.getItem('selectedOctaves'));

    if (savedTones) {
        toneCheckboxes.forEach(checkbox => {
            checkbox.checked = savedTones.includes(checkbox.value);
        });
    }

    if (savedOctaves) {
        octaveCheckboxes.forEach(checkbox => {
            checkbox.checked = savedOctaves.includes(checkbox.value);
        });
    }
}

// Save selections when checkboxes are changed
toneCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveSelections);
});

octaveCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveSelections);
});

const noteToSolfègeMap = {
    'C': 'Do',
    'CSharp': 'Do#',
    'D': 'Re',
    'DSharp': 'Re#',
    'E': 'Mi',
    'F': 'Fa',
    'FSharp': 'Fa#',
    'G': 'Sol',
    'GSharp': 'Sol#',
    'A': 'La',
    'ASharp': 'La#',
    'B': 'Si'
};


function playRandomOctave(note) {
    const noteAudios = audioCache[note];
    if (noteAudios && noteAudios.length > 0) {
        const randomIndex = Math.floor(Math.random() * noteAudios.length);
        const randomAudio = noteAudios[randomIndex];
        
        randomAudio.pause();
        randomAudio.currentTime = 0;

        randomAudio.play().catch(error => {
            console.error('Audio playback failed:', error);
        });
    }
}

// Play random tone and generate buttons for guessing
if (playButton) {
playButton.addEventListener('click', function () {
    toneButtonsContainer.innerHTML = ''; // Clear previous buttons

    // Get selected notes and octaves
    const selectedNotes = Array.from(toneCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const selectedOctaves = Array.from(octaveCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => parseInt(checkbox.value, 10)); // Parse as integers for octaves

    if (selectedNotes.length === 0 || selectedOctaves.length === 0) {
        alert("Please select at least one note and one octave.");
        return;
    }

    // Generate buttons for selected tones, showing the solfège equivalents in the button text
    selectedNotes.forEach(note => {
        const button = document.createElement('button');
        button.textContent = noteToSolfègeMap[note] || note; // Set the button text to the solfège equivalent
        button.dataset.note = note;
        toneButtonsContainer.appendChild(button);
        button.addEventListener('click', () => checkGuess(note, button)); // Add event listener for guessing
    });

    // Play random tone in a random selected octave
    randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
    const noteAudios = audioCache[randomNote];

    // Get a random octave from the selected octaves
    const randomOctave = selectedOctaves[Math.floor(Math.random() * selectedOctaves.length)];

    // Map the selected octave (2-7) to the corresponding index in the audioCache
    const octaveIndex = randomOctave - 2; // Since the audioCache index starts from octave 2

    lastPlayedAudio = noteAudios[octaveIndex]; // Get the corresponding audio for the note and octave
    lastPlayedNote = randomNote;
    lastPlayedOctave = octaveIndex;

    const duration = audioDurationSlider.value; // Get duration from slider
    // (Play the last played audio, for example)
    playAudioWithDuration(lastPlayedAudio, duration);

    isGuessing = true; // Set the guessing state to true
});
}

function fadeOutAudio(audio, duration) {
    const fadeOutInterval = 50; // The interval in milliseconds
    const fadeOutSteps = duration * 1000 / fadeOutInterval; // Number of steps for fading out
    let currentVolume = audio.volume; // Start from the current volume

    const fadeOutIntervalId = setInterval(() => {
        if (currentVolume > 0) {
            currentVolume -= 1 / fadeOutSteps; // Decrease volume gradually
            audio.volume = Math.max(currentVolume, 0); // Ensure volume doesn't go below 0
        } else {
            clearInterval(fadeOutIntervalId); // Stop the interval when volume reaches 0
            audio.pause(); // Pause the audio
            audio.currentTime = 0; // Reset time to 0
            audio.volume = 1; // Reset volume for next playback
            console.log(`Paused ${audio.src} after fading out`); // Log when audio is paused
        }
    }, fadeOutInterval);
}

// Function to play audio for a specified duration with a fade-out
function playAudioWithDuration(audio, duration) {
    if (audio) {
        console.log(`Playing ${audio.src} for ${duration} seconds`); // Log which audio is being played
        audio.currentTime = 0; // Reset to start
        audio.play(); // Start playing

        const fadeOutDuration = 1; // Duration of fade out in seconds
        const playbackDuration = duration - fadeOutDuration; // Time to play before fading out

        // Stop playback after specified duration and then fade out
        setTimeout(() => {
            fadeOutAudio(audio, fadeOutDuration); // Fade out over the specified fade out duration
        }, playbackDuration * 1000); // Convert playback duration to milliseconds

        // Explicitly pause the audio after the total duration
        setTimeout(() => {
            audio.pause(); // Ensure audio is paused
            audio.currentTime = 0; // Reset time to 0
            audio.volume = 1; // Reset volume for next playback
        }, duration * 1000); // Stop playback after total specified duration
    } else {
        console.error("No audio to play!"); // Log if no audio is provided
    }
}

// Repeat the last played tone in the same octave
if(repeatSameButton) {
repeatSameButton.addEventListener('click', function () {
    if (lastPlayedAudio) {
        const duration = audioDurationSlider.value; // Get duration from slider
        // (Play the last played audio, for example)
        playAudioWithDuration(lastPlayedAudio, duration);
    }
});
}

// Repeat the last played tone but in a random octave
if(repeatRandomButton) {
repeatRandomButton.addEventListener('click', function () {
    if (lastPlayedNote) {
        const noteAudios = audioCache[lastPlayedNote];

        const selectedOctaves = Array.from(octaveCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => parseInt(checkbox.value, 10)); // Parse as integers for octaves

        if (selectedOctaves.length === 0) {
            alert("Please select at least one octave.");
            return;
        }

        // Get a random octave from the selected octaves
        const randomOctave = selectedOctaves[Math.floor(Math.random() * selectedOctaves.length)];

        // Map the selected octave (2-7) to the corresponding index in the audioCache
        const randomOctaveIndex = randomOctave - 2; // Since the audioCache index starts from 2 (i.e., index 0 is octave 2)

        const randomAudio = noteAudios[randomOctaveIndex];        
        const duration = audioDurationSlider.value; // Get duration from slider
        // (Play the last played audio, for example)
        playAudioWithDuration(randomAudio, duration);
    }
});
}

// Check if the guessed note is correct
function checkGuess(guessedNote, button) {
    if (!isGuessing) return; // Don't allow guessing if no tone is playing

    if (guessedNote === randomNote) {
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        // Highlight the correct note
        const correctButton = document.querySelector(`button[data-note="${randomNote}"]`);
        correctButton.classList.add('correct');
    }

    // Disable all buttons after a guess
    const allButtons = document.querySelectorAll('#tone-buttons button');
    allButtons.forEach(btn => btn.disabled = true);

    // After a guess, stop the guessing state
    isGuessing = false;
}

document.querySelectorAll('.note-button').forEach(button => {
    button.addEventListener('click', function() {
        const note = this.getAttribute('data-tone');
        playRandomOctave(note); 
    });
});


// Get the slider element
const audioDurationSlider = document.getElementById('audio-duration-slider');
const sliderValueDisplay = document.getElementById('slider-value');

// Function to update slider value display and background color
audioDurationSlider.addEventListener('input', function () {
    console.log("Slider value changed to:", this.value); 
    sliderValueDisplay.textContent = this.value; // Update displayed value
});

audioDurationSlider.addEventListener('change', () => {
    localStorage.setItem('audioDuration', audioDurationSlider.value);
});