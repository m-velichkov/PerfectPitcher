const audioCache = {};
let randomNote;
let lastPlayedAudio;
let lastPlayedNote;
let lastPlayedOctave;
let isGuessing = false;
let activeTimers = {}; // Store individual timers for each note

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

window.onload = () => {
    restoreSelections();
    preloadAudio();
    restoreAudioDuration();
};

const hamburgerButton = document.getElementById('hamburger');
const fullscreenMenu = document.getElementById('fullscreen-menu');
const closeMenuButton = document.getElementById('close-menu');

const settingsButton = document.getElementById('settings');
const fullscreenSettings = document.getElementById('fullscreen-settings');
const closeSettingsButton = document.getElementById('close-settings');

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

const playButton = document.getElementById('playButton');
const repeatSameButton = document.getElementById('repeatSameButton');
const repeatRandomButton = document.getElementById('repeatRandomButton');
const noteButtonsContainer = document.getElementById('note-buttons');
const noteCheckboxes = document.querySelectorAll('#note-checkboxes input[type="checkbox"]');
const octaveCheckboxes = document.querySelectorAll('#octave-checkboxes input[type="checkbox"]');

function saveSelections() {
    const selectednotes = Array.from(noteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    const selectedOctaves = Array.from(octaveCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    localStorage.setItem('selectednotes', JSON.stringify(selectednotes));
    localStorage.setItem('selectedOctaves', JSON.stringify(selectedOctaves));
}

function restoreSelections() {
    const savednotes = JSON.parse(localStorage.getItem('selectednotes'));
    const savedOctaves = JSON.parse(localStorage.getItem('selectedOctaves'));

    if (savednotes) {
        noteCheckboxes.forEach(checkbox => {
            checkbox.checked = savednotes.includes(checkbox.value);
        });
    }

    if (savedOctaves) {
        octaveCheckboxes.forEach(checkbox => {
            checkbox.checked = savedOctaves.includes(checkbox.value);
        });
    }
}

noteCheckboxes.forEach(checkbox => {
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

        const duration = audioDurationSlider.value;

        const buttonToHighlight = document.querySelector(`button[data-note="${note}"]`);
        buttonToHighlight.classList.add('playing');

        // Clear existing timer for this note if it exists
        if (activeTimers[note]) {
            clearTimeout(activeTimers[note]);
        }

        playAudioWithDuration(randomAudio, duration);

        activeTimers[note] = setTimeout(() => {
            buttonToHighlight.classList.remove('playing');
        }, duration * 1000);
    }
}

if (playButton) {
    playButton.addEventListener('click', function () {
        noteButtonsContainer.innerHTML = '';

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

        randomNote = selectedNotes[Math.floor(Math.random() * selectedNotes.length)];
        const noteAudios = audioCache[randomNote];

        const randomOctave = selectedOctaves[Math.floor(Math.random() * selectedOctaves.length)];

        const octaveIndex = randomOctave - 2;

        lastPlayedAudio = noteAudios[octaveIndex];
        lastPlayedNote = randomNote;
        lastPlayedOctave = octaveIndex;

        const duration = audioDurationSlider.value;
        playAudioWithDuration(lastPlayedAudio, duration);

        isGuessing = true;
    });
}

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
        audio.currentTime = 0;
        audio.play();

        const fadeOutDuration = 1;
        const playbackDuration = duration - fadeOutDuration;

        setTimeout(() => {
            fadeOutAudio(audio, fadeOutDuration);
        }, playbackDuration * 1000);

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
        }, duration * 1000);
    } else {
        console.error("No audio to play!");
    }
}

if (repeatSameButton) {
    repeatSameButton.addEventListener('click', function () {
        if (lastPlayedAudio) {
            const duration = audioDurationSlider.value;
            playAudioWithDuration(lastPlayedAudio, duration);
        }
    });
}

if (repeatRandomButton) {
    repeatRandomButton.addEventListener('click', function () {
        if (lastPlayedNote) {
            const noteAudios = audioCache[lastPlayedNote];

            const selectedOctaves = Array.from(octaveCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => parseInt(checkbox.value, 10));

            if (selectedOctaves.length === 0) {
                alert("Please select at least one octave.");
                return;
            }

            const randomOctave = selectedOctaves[Math.floor(Math.random() * selectedOctaves.length)];

            const randomOctaveIndex = randomOctave - 2;

            const randomAudio = noteAudios[randomOctaveIndex];
            const duration = audioDurationSlider.value;
            playAudioWithDuration(randomAudio, duration);
        }
    });
}

function checkGuess(guessedNote, button) {
    if (!isGuessing) return;

    if (guessedNote === randomNote) {
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        const correctButton = document.querySelector(`button[data-note="${randomNote}"]`);
        correctButton.classList.add('correct');
    }

    const allButtons = document.querySelectorAll('#note-buttons button');
    allButtons.forEach(btn => btn.disabled = true);

    isGuessing = false;
}

// Event listeners for the explore notes buttons
document.querySelectorAll('.note-button').forEach(button => {
    button.addEventListener('click', function () {
        const note = this.getAttribute('data-note');
        const selectedNotes = Array.from(noteCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Only play if the note is selected
        if (selectedNotes.includes(note)) {
            playRandomOctave(note);
        }
    });
});

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

audioDurationSlider.addEventListener('input', function () {
    sliderValueDisplay.textContent = this.value;
    localStorage.setItem('audioDuration', this.value);
});

restoreAudioDuration();
