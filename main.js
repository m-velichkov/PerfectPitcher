const audioCache = {};
let randomNote;
let lastPlayedAudio;
let lastPlayedNote;
let lastPlayedOctave;
let isGuessing = false;
let activeTimers = {}; // Store individual timers for each note

// Selectors for checkboxes
let noteCheckboxes;
let octaveCheckboxes;

let correctGuesses = 0;
let overallTries = 0;

// Preload audio files
function preloadAudio() {
    const notes = ['C', 'CSharp', 'D', 'DSharp', 'E', 'F', 'FSharp', 'G', 'GSharp', 'A', 'ASharp', 'B'];
    const octaves = ['2', '3', '4', '5', '6'];

    notes.forEach(note => {
        audioCache[note] = [];
        octaves.forEach(octave => {
            const audioPath = `audio/${note}${octave}.wav`;
            const audio = new Audio(audioPath);
            audio.load();
            audioCache[note].push(audio);
        });
    });
}

// Initialize when the window loads
window.onload = () => {
    preloadAudio();
    noteCheckboxes = document.querySelectorAll('#note-checkboxes input[type="checkbox"]');
    octaveCheckboxes = document.querySelectorAll('#octave-checkboxes input[type="checkbox"]');
    restoreSelections();
    restoreAudioDuration();
    initializeNoteButtons(); // Initialize note buttons on load
    addEventListeners();
};

function addEventListeners() {
    const hamburgerButton = document.getElementById('hamburger');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    const closeMenuButton = document.getElementById('close-menu');

    const settingsButton = document.getElementById('settings');
    const fullscreenSettings = document.getElementById('fullscreen-settings');
    const closeSettingsButton = document.getElementById('close-settings');

    const playButton = document.getElementById('playButton');
    const repeatSameButton = document.getElementById('repeatSameButton');
    const repeatRandomButton = document.getElementById('repeatRandomButton');
    const noteButtonsContainer = document.getElementById('note-buttons');
    
    hamburgerButton.addEventListener('click', function () {
        fullscreenMenu.classList.add('show');
    });

    closeMenuButton.addEventListener('click', function () {
        fullscreenMenu.classList.remove('show');
    });

    settingsButton.addEventListener('click', function () {
        fullscreenSettings.classList.add('show');
    });

    closeSettingsButton.addEventListener('click', function () {
        fullscreenSettings.classList.remove('show');
    });

    noteCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSelections);
    });

    octaveCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveSelections);
    });

    if (playButton) {
        playButton.addEventListener('click', function () {
            noteButtonsContainer.innerHTML = ''; // Clear existing buttons
    
            const selectedNotes = Array.from(noteCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
    
            const selectedOctaves = Array.from(octaveCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => parseInt(checkbox.value, 10));
    
            if (selectedNotes.length === 0 || selectedOctaves.length === 0) {
                alert("Please select at least one note and one octave.");
                return;
            }
    
            selectedNotes.forEach(note => {
                const button = document.createElement('button');
                button.textContent = noteToSolfègeMap[note] || note;
                button.dataset.note = note;
                noteButtonsContainer.appendChild(button);
                button.addEventListener('click', () => checkGuess(note, button));
            });
    
            // Pick a random note and a random octave
            randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
            const noteAudios = audioCache[randomNote];
    
            const randomOctave = selectedOctaves[Math.floor(Math.random() * selectedOctaves.length)];
            const octaveIndex = randomOctave - 2;
    
            // Create a new audio instance for the last played note
            lastPlayedAudio = new Audio(noteAudios[octaveIndex].src); // Create a new instance directly from the source
            lastPlayedNote = randomNote;
            lastPlayedOctave = octaveIndex;
    
            const duration = audioDurationSlider.value;
            playAudioWithDuration(lastPlayedAudio, duration);
    
            isGuessing = true; // Enable guessing mode
        });
    }
    
    if (repeatSameButton) {
        repeatSameButton.addEventListener('click', function () {
            if (lastPlayedNote) {
                const noteAudios = audioCache[lastPlayedNote];
                if (noteAudios && noteAudios.length > 0) {
                    const sameNoteAudio = new Audio(lastPlayedAudio.src); // Create a new instance directly from the source
    
                    const duration = audioDurationSlider.value;
                    playAudioWithDuration(sameNoteAudio, duration); // Play the new instance
                }
            }
        });
    }
    
    if (repeatRandomButton) {
        repeatRandomButton.addEventListener('click', function () {
            if (lastPlayedNote) {
                // Call the existing playRandomOctave function with the last played note and set highlight to false
                playRandomOctave(lastPlayedNote, false);
            }
        });
    }
}

// Initialize buttons for exploring notes
function initializeNoteButtons() {
    const noteButtonsContainer = document.getElementById('note-buttons');
    noteButtonsContainer.innerHTML = ''; // Clear existing buttons

    const selectedNotes = Array.from(noteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    selectedNotes.forEach(note => {
        const exploreButton = document.createElement('button');
        exploreButton.textContent = noteToSolfègeMap[note] || note;
        exploreButton.dataset.note = note;
        noteButtonsContainer.appendChild(exploreButton);
        exploreButton.addEventListener('click', () => playRandomOctave(note));
    });
}

// Map notes to solfège
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

// Save selected notes and octaves to local storage
function saveSelections() {
    const selectedNotes = Array.from(noteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    const selectedOctaves = Array.from(octaveCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    localStorage.setItem('selectedNotes', JSON.stringify(selectedNotes));
    localStorage.setItem('selectedOctaves', JSON.stringify(selectedOctaves));
}

// Restore selections from local storage
function restoreSelections() {
    const savedNotes = JSON.parse(localStorage.getItem('selectedNotes'));
    const savedOctaves = JSON.parse(localStorage.getItem('selectedOctaves'));

    if (savedNotes) {
        noteCheckboxes.forEach(checkbox => {
            checkbox.checked = savedNotes.includes(checkbox.value);
        });
    }

    if (savedOctaves) {
        octaveCheckboxes.forEach(checkbox => {
            checkbox.checked = savedOctaves.includes(checkbox.value);
        });
    }
}

// Play a random octave of the given note
function playRandomOctave(note, highlight = true) {
    const noteAudios = audioCache[note];
    if (noteAudios && noteAudios.length > 0) {
        const randomIndex = Math.floor(Math.random() * noteAudios.length);
        const randomAudio = new Audio(noteAudios[randomIndex].src); // Create a new instance from the source

        // Reset the audio
        randomAudio.pause();
        randomAudio.currentTime = 0;

        const duration = audioDurationSlider.value;

        if (highlight) {
            // Highlight the button for the note
            const buttonToHighlight = document.querySelector(`button[data-note="${note}"]`);
            buttonToHighlight.classList.add('playing');

            // Clear previous timer for the highlight
            if (activeTimers[note]) {
                clearTimeout(activeTimers[note]);
            }

            // Set a timer to remove the highlight after the duration
            activeTimers[note] = setTimeout(() => {
                buttonToHighlight.classList.remove('playing');
            }, duration * 1000);
        }

        playAudioWithDuration(randomAudio, duration);
    }
}


// Fade out the audio
function fadeOutAudio(audio, duration) {
    const fadeOutInterval = 50;
    const fadeOutSteps = duration * 1000 / fadeOutInterval;
    let currentVolume = audio.volume;

    const fadeOutIntervalId = setInterval(() => {
        if (currentVolume > 0) {
            currentVolume -= 1 / fadeOutSteps;
            audio.volume = Math.max(currentVolume, 0);
        } else {
            clearInterval(fadeOutIntervalId);
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
        }
    }, fadeOutInterval);
}

function playAudioWithDuration(audio, duration) {
    if (audio) {
        audio.play();  // Start playing the audio immediately
        fadeOutAudio(audio, duration);  // Start fading out without waiting
    } else {
        console.error("No audio to play!");
    }
}

// Check the player's guess
function checkGuess(guessedNote, button) {
    if (!isGuessing) return;

    overallTries++; // Increment overall tries
    const allButtons = document.querySelectorAll('#note-buttons button');

    if (guessedNote === randomNote) {
        button.classList.add('correct');
        correctGuesses++; // Increment correct guesses
    } else {
        button.classList.add('incorrect');
        const correctButton = document.querySelector(`button[data-note="${randomNote}"]`);
        correctButton.classList.add('correct');
    }

    allButtons.forEach(btn => btn.disabled = true);
    isGuessing = false;

    // Update the counter display
    updateCounterDisplay();
}

function updateCounterDisplay() {
    const counterDisplay = document.getElementById('counter-display');
    counterDisplay.textContent = `Guessed: ${correctGuesses} / Overall: ${overallTries}`;
}

const resetCounterButton = document.getElementById('reset-counter');

if (resetCounterButton) {
    resetCounterButton.addEventListener('click', function () {
        correctGuesses = 0;
        overallTries = 0;
        updateCounterDisplay(); // Update display to reflect reset
    });
}

// Audio duration slider functionality
const audioDurationSlider = document.getElementById('audio-duration-slider');
const sliderValueDisplay = document.getElementById('slider-value');

function restoreAudioDuration() {
    const savedDuration = localStorage.getItem('audioDuration');
    const defaultDuration = 3;

    if (savedDuration) {
        audioDurationSlider.value = savedDuration;
        sliderValueDisplay.textContent = savedDuration;
    } else {
        audioDurationSlider.value = defaultDuration;
        sliderValueDisplay.textContent = defaultDuration;
        localStorage.setItem('audioDuration', defaultDuration);
    }
}

// Update slider value and save it to local storage
audioDurationSlider.addEventListener('input', function () {
    sliderValueDisplay.textContent = this.value;
    localStorage.setItem('audioDuration', this.value);
});

// Call this function to initialize audio duration
restoreAudioDuration();
