/* =========================================
   1. GET ELEMENTS
========================================= */

const $ = (id) => document.getElementById(id);

const welcomeScreen = $("welcomeScreen");
const envelopeScreen = $("envelopeScreen");
const photosScreen = $("photosScreen");
const goodbyeScreen = $("goodbyeScreen");

const startButton = $("startButton");
const envelopeButton = $("envelopeButton");
const envelopeInstruction = $("envelopeInstruction");
const envelopeHeading = $("envelopeHeading");
const letterDecoration = $("letterDecoration");

const letterCard = $("letterCard");
const backButton = $("backButton");
const welcomeBackButton = $("welcomeBackButton");
const photosButton = $("photosButton");

const photoDeck = $("photoDeck");
const photoCounter = $("photoCounter");
const photoHint = $("photoHint");
const goodbyeButton = $("goodbyeButton");
const letterBackButton = $("letterBackButton");
const photosBackButton = $("photosBackButton");

const backgroundMusic = $("backgroundMusic");
const musicButton = $("musicButton");
const musicSymbol = $("musicSymbol");
const volumeSlider = $("volumeSlider");
const volumePercentage = $("volumePercentage");
const musicStatus = $("musicStatus");

const cursorGlow = $("cursorGlow");


/* =========================================
   2. SCREEN NAVIGATION
========================================= */

function showScreen(screen) {
    [
        welcomeScreen,
        envelopeScreen,
        photosScreen,
        goodbyeScreen
    ].forEach((item) => {
        item.hidden = item !== screen;
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showWelcomeScreen() {
    showScreen(welcomeScreen);
    startButton.focus({ preventScroll: true });
}


function showEnvelopeScreen() {
    showScreen(envelopeScreen);

    envelopeHeading.textContent = "A little message for you";
    envelopeInstruction.textContent = "Click the envelope to open it ✨";

    envelopeButton.hidden = false;
    envelopeInstruction.hidden = false;
    letterDecoration.hidden = false;

    letterCard.hidden = true;
    photosButton.hidden = true;
    backButton.hidden = true;

    envelopeButton.classList.remove("is-open");
}


function showBirthdayLetter() {
    showScreen(envelopeScreen);

    envelopeHeading.textContent = "A little message for you";

    envelopeButton.hidden = true;
    envelopeInstruction.hidden = true;

    letterDecoration.hidden = false;
    letterCard.hidden = false;

    photosButton.hidden = false;
    backButton.hidden = false;

    letterCard.scrollTop = 0;

    photosButton.textContent = "Next ➜";

    setTimeout(() => {
        letterCard.scrollTop = 0;
    }, 50);
}


function showPhotosScreen() {
    showScreen(photosScreen);

    updatePhotoCounter();

    letterBackButton.focus({ preventScroll: true });
}


function showGoodbyeScreen() {
    showScreen(goodbyeScreen);

    const goodbyeLetter = $("goodbyeLetter");

    goodbyeLetter.scrollTop = 0;

    photosBackButton.focus({ preventScroll: true });
}


/* Welcome -> Envelope */

startButton.addEventListener("click", () => {
    showEnvelopeScreen();
    startMusic();
});


/* Envelope interaction */

envelopeButton.addEventListener("click", () => {

    if (!envelopeButton.classList.contains("is-open")) {

        envelopeButton.classList.add("is-open");

        envelopeInstruction.textContent =
            "Your letter is ready! Click the envelope again 💌";

    } else {

        showBirthdayLetter();

    }

});


/* Birthday letter -> Envelope */

backButton.addEventListener("click", () => {
    showEnvelopeScreen();
});


/* Envelope -> Welcome */

welcomeBackButton.addEventListener("click", () => {
    showWelcomeScreen();
});


/* Birthday letter -> Photos */

photosButton.addEventListener("click", () => {
    showPhotosScreen();
});


/* Photos -> Birthday letter */

letterBackButton.addEventListener("click", () => {
    showBirthdayLetter();
});


/* Photos -> Goodbye letter */

goodbyeButton.addEventListener("click", () => {
    showGoodbyeScreen();
});


/* Goodbye -> Photos */

photosBackButton.addEventListener("click", () => {
    showPhotosScreen();
});


/* =========================================
   3. PHOTO STACK
========================================= */

/*
   Expected photo locations:

   images/photo1.jpg
   images/photo2.jpg
   ...
   images/photo10.jpg

   Each swipe moves the current photo to the back.

   After all 10 photos have been swiped once,
   the Next button becomes visible.
*/

const TOTAL_PHOTOS = 10;

let photoOrder = [];
let swipedPhotos = new Set();

let activeDrag = null;
let photoAnimationBusy = false;

const SWIPE_THRESHOLD = 75;


function initializePhotos() {

    photoDeck.innerHTML = "";

    photoOrder = [];
    swipedPhotos.clear();

    for (let i = 1; i <= TOTAL_PHOTOS; i++) {

        const card = document.createElement("div");

        card.className = "photo-card";
        card.dataset.photoNumber = String(i);

        const img = document.createElement("img");

        img.src = `images/photo${i}.jpg`;
        img.alt = `Memory ${i}`;
        img.draggable = false;
        img.loading = i <= 3 ? "eager" : "lazy";

        img.addEventListener("error", () => {

            img.classList.add("photo-error");

            let message = card.querySelector(".photo-error-message");

            if (!message) {
                message = document.createElement("div");
                message.className = "photo-error-message";

                message.textContent =
                    `Photo ${i} could not be loaded. Check its filename.`;

                card.appendChild(message);
            }

        });

        card.appendChild(img);

        photoDeck.appendChild(card);

        photoOrder.push(i);

    }

    renderPhotoStack();
    updatePhotoCounter();

}


function renderPhotoStack() {

    const cards = Array.from(
        photoDeck.querySelectorAll(".photo-card")
    );

    cards.forEach((card) => {

        card.classList.remove(
            "is-front",
            "is-dragging",
            "swiping-out",
            "swiping-out-left",
            "swiping-out-right",
            "swiping-out-up",
            "swiping-out-down"
        );

        card.style.transform = "";
        card.style.opacity = "";

    });

    photoOrder.forEach((photoNumber, index) => {

        const card = photoDeck.querySelector(
            `[data-photo-number="${photoNumber}"]`
        );

        if (!card) return;

        photoDeck.appendChild(card);

        const stackPosition = Math.min(index, 3);

        card.style.zIndex = String(100 - index);

        if (index === 0) {

            card.classList.add("is-front");

            card.style.transform = "translate(0, 0) rotate(0deg) scale(1)";

        } else {

            const rotations = [0, 4, -5, 7];

            const xOffsets = [0, 7, -7, 5];

            const yOffsets = [0, 5, 10, 14];

            const scale = 1 - stackPosition * 0.03;

            card.style.transform =
                `translate(${xOffsets[stackPosition]}px, ` +
                `${yOffsets[stackPosition]}px) ` +
                `rotate(${rotations[stackPosition]}deg) ` +
                `scale(${scale})`;

        }

    });

}


function updatePhotoCounter() {

    const completed = swipedPhotos.size;

    photoCounter.textContent =
        `${completed} / ${TOTAL_PHOTOS} memories explored 💗`;

    const allPhotosExplored = completed >= TOTAL_PHOTOS;

    goodbyeButton.hidden = !allPhotosExplored;

    if (allPhotosExplored) {

        photoHint.textContent =
            "You saw all the memories! One last little message 💜";

    } else {

        photoHint.textContent =
            "Keep swiping to see all the memories 💜";

    }

}


function getFrontCard() {

    if (!photoOrder.length) return null;

    return photoDeck.querySelector(
        `[data-photo-number="${photoOrder[0]}"]`
    );

}


function handlePhotoPointerDown(event) {

    if (event.button !== undefined && event.button !== 0) {
        return;
    }

    if (photoAnimationBusy) return;

    const card = event.currentTarget;

    if (!card.classList.contains("is-front")) return;

    activeDrag = {
        card,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        deltaX: 0,
        deltaY: 0
    };

    card.classList.add("is-dragging");

    try {
        card.setPointerCapture(event.pointerId);
    } catch (_) {
        // Pointer capture is not available in every browser.
    }

}


function handlePhotoPointerMove(event) {

    if (!activeDrag) return;

    if (event.pointerId !== activeDrag.pointerId) return;

    const dx = event.clientX - activeDrag.startX;
    const dy = event.clientY - activeDrag.startY;

    activeDrag.deltaX = dx;
    activeDrag.deltaY = dy;

    const rotation = dx * 0.07;

    activeDrag.card.style.transform =
        `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;

}


function handlePhotoPointerUp(event) {

    if (!activeDrag) return;

    if (event.pointerId !== activeDrag.pointerId) return;

    const drag = activeDrag;

    activeDrag = null;

    drag.card.classList.remove("is-dragging");

    const dx = drag.deltaX;
    const dy = drag.deltaY;

    if (
        Math.abs(dx) < SWIPE_THRESHOLD &&
        Math.abs(dy) < SWIPE_THRESHOLD
    ) {

        drag.card.style.transform =
            "translate(0, 0) rotate(0deg) scale(1)";

        return;

    }

    let direction;

    if (Math.abs(dx) > Math.abs(dy)) {

        direction = dx < 0 ? "left" : "right";

    } else {

        direction = dy < 0 ? "up" : "down";

    }

    swipeFrontPhoto(direction);

}


function handlePhotoPointerCancel(event) {

    if (!activeDrag) return;

    if (event.pointerId !== activeDrag.pointerId) return;

    activeDrag.card.classList.remove("is-dragging");

    activeDrag.card.style.transform =
        "translate(0, 0) rotate(0deg) scale(1)";

    activeDrag = null;

}


function swipeFrontPhoto(direction) {

    if (photoAnimationBusy) return;

    if (photoOrder.length === 0) return;

    const currentPhoto = photoOrder[0];

    const card = getFrontCard();

    if (!card) return;

    photoAnimationBusy = true;

    card.classList.add("swiping-out");
    card.classList.add(`swiping-out-${direction}`);

    /*
       Record that this photo has been swiped.

       The same photo can appear again later in the deck,
       but it won't count as a new photo.
    */

    swipedPhotos.add(currentPhoto);

    setTimeout(() => {

        /*
           Move the photo from the front to the back.
        */

        photoOrder.push(photoOrder.shift());

        card.classList.remove(
            "swiping-out",
            `swiping-out-${direction}`
        );

        card.style.transform = "";
        card.style.opacity = "";

        renderPhotoStack();

        updatePhotoCounter();

        photoAnimationBusy = false;

    }, 340);

}


/* Register pointer controls for every card */

function attachPhotoInteractions() {

    photoDeck.querySelectorAll(".photo-card").forEach((card) => {

        card.addEventListener(
            "pointerdown",
            handlePhotoPointerDown
        );

        card.addEventListener(
            "pointermove",
            handlePhotoPointerMove
        );

        card.addEventListener(
            "pointerup",
            handlePhotoPointerUp
        );

        card.addEventListener(
            "pointercancel",
            handlePhotoPointerCancel
        );

        card.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });

    });

}


/* =========================================
   4. BACKGROUND MUSIC
========================================= */

/*
   Music file:

   audio/background-music.mp3

   Important:
   - The music starts after a user interaction.
   - Mute pauses playback.
   - Unmute resumes from the current position.
   - The slider controls the volume.
   - Missing audio will not break the website.
*/

let musicMuted = false;
let musicStarted = false;
let musicAvailable = true;

let musicStatusTimer = null;
let musicPlayRequest = 0;

let savedVolume = 0.5;


/* Display music status */

function showMusicStatus(message) {

    musicStatus.textContent = message;
    musicStatus.hidden = false;

    clearTimeout(musicStatusTimer);

    musicStatusTimer = setTimeout(() => {
        musicStatus.hidden = true;
    }, 2800);

}


/* Read current volume from slider */

function getSliderVolume() {

    return Number(volumeSlider.value) / 100;

}


/* Update volume percentage */

function updateVolumeDisplay() {

    const volume = Number(volumeSlider.value);

    volumePercentage.textContent = `${volume}%`;

    backgroundMusic.volume = volume / 100;

    if (volume > 0) {
        savedVolume = volume / 100;
    }

    if (volume === 0) {

        musicSymbol.textContent = "♪";

    } else if (volume < 40) {

        musicSymbol.textContent = "♪";

    } else {

        musicSymbol.textContent = "♫";

    }

    updateMusicButton();

}


/* Update the music button */

function updateMusicButton() {

    const volume = getSliderVolume();

    const muted =
        musicMuted ||
        volume === 0;

    musicButton.classList.toggle(
        "is-playing",
        !muted && !backgroundMusic.paused
    );

    musicButton.setAttribute(
        "aria-pressed",
        String(muted)
    );

    if (muted) {

        musicButton.setAttribute(
            "aria-label",
            "Turn on background music"
        );

        musicButton.title = "Turn on background music";

        musicSymbol.textContent = "♪";

    } else {

        musicButton.setAttribute(
            "aria-label",
            "Mute background music"
        );

        musicButton.title = "Mute background music";

    }

}


/* Attempt to start or resume music */

async function playBackgroundMusic() {

    if (musicMuted) return;

    if (getSliderVolume() === 0) return;

    if (!musicAvailable) {

        showMusicStatus(
            "Check audio/background-music.mp3 🎵"
        );

        return;

    }

    backgroundMusic.volume = getSliderVolume();

    if (!backgroundMusic.paused) {

        musicStarted = true;

        updateMusicButton();

        return;

    }

    const requestNumber = ++musicPlayRequest;

    try {

        await backgroundMusic.play();

        if (
            requestNumber !== musicPlayRequest ||
            musicMuted ||
            getSliderVolume() === 0
        ) {

            backgroundMusic.pause();

            updateMusicButton();

            return;

        }

        musicStarted = true;

        updateMusicButton();

    } catch (error) {

        musicStarted = false;

        updateMusicButton();

        console.info(
            "Music could not start. Check the audio filename.",
            error
        );

    }

}


/* Start music following the user's interaction */

function startMusic() {

    if (!musicStarted && !musicMuted) {
        playBackgroundMusic();
    }

}


/* Toggle mute */

musicButton.addEventListener("click", () => {

    if (!musicMuted && getSliderVolume() > 0) {

        musicMuted = true;

        musicPlayRequest++;

        backgroundMusic.pause();

        updateMusicButton();

        showMusicStatus("Background music muted 🔇");

    } else {

        musicMuted = false;

        /*
           If volume was set to 0, restore the last
           non-zero volume before resuming.
        */

        if (getSliderVolume() === 0) {

            volumeSlider.value = String(
                Math.round(savedVolume * 100) || 50
            );

            updateVolumeDisplay();

        }

        if (!musicAvailable) {

            showMusicStatus(
                "Check audio/background-music.mp3 🎵"
            );

            return;

        }

        showMusicStatus("Background music on 🎵");

        playBackgroundMusic();

    }

});


/* Slider controls the volume */

volumeSlider.addEventListener("input", () => {

    const volume = getSliderVolume();

    backgroundMusic.volume = volume;

    if (volume > 0) {

        savedVolume = volume;

        /*
           Moving the slider above zero should restore
           sound if the user had set volume to zero.
        */

        if (musicMuted) {
            musicMuted = false;
        }

        if (!musicStarted) {
            playBackgroundMusic();
        } else if (backgroundMusic.paused) {
            playBackgroundMusic();
        }

    } else {

        /*
           Zero volume behaves like silent playback.
           Pause the song so it can resume from the
           same position when volume is raised again.
        */

        musicPlayRequest++;

        backgroundMusic.pause();

    }

    updateVolumeDisplay();

});


/* Keep the button in sync with playback */

backgroundMusic.addEventListener("play", () => {

    musicStarted = true;

    updateMusicButton();

});

backgroundMusic.addEventListener("pause", () => {

    updateMusicButton();

});

backgroundMusic.addEventListener("error", () => {

    musicAvailable = false;
    musicStarted = false;

    updateMusicButton();

    console.info(
        "Music file unavailable. Check audio/background-music.mp3"
    );

});

backgroundMusic.addEventListener("loadedmetadata", () => {

    musicAvailable = true;

});


/* Start music after the first welcome-screen interaction */

welcomeScreen.addEventListener("pointerdown", startMusic);

welcomeScreen.addEventListener("click", startMusic);


/* Initial volume */

backgroundMusic.volume = 0.5;

updateVolumeDisplay();


/* =========================================
   5. CURSOR GLOW
========================================= */

const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
).matches;

let cursorGlowFrame = null;
let cursorX = 0;
let cursorY = 0;


function updateCursorGlow() {

    cursorGlow.style.left = `${cursorX}px`;
    cursorGlow.style.top = `${cursorY}px`;

    cursorGlowFrame = null;

}


if (supportsFinePointer) {

    document.addEventListener("pointermove", (event) => {

        if (event.pointerType === "touch") return;

        cursorX = event.clientX;
        cursorY = event.clientY;

        cursorGlow.classList.add("is-visible");

        if (cursorGlowFrame === null) {

            cursorGlowFrame =
                requestAnimationFrame(updateCursorGlow);

        }

    });

    document.addEventListener("pointerdown", (event) => {

        if (event.pointerType === "touch") return;

        cursorX = event.clientX;
        cursorY = event.clientY;

        cursorGlow.classList.add("is-visible");

        if (cursorGlowFrame === null) {

            cursorGlowFrame =
                requestAnimationFrame(updateCursorGlow);

        }

    });

    document.addEventListener("pointerleave", (event) => {

        if (event.target === document.documentElement) {
            cursorGlow.classList.remove("is-visible");
        }

    });

}


/* =========================================
   6. TOUCH GLOW
========================================= */

document.addEventListener("pointerdown", (event) => {

    if (event.pointerType !== "touch") return;

    const touchGlow = document.createElement("span");

    touchGlow.className = "touch-glow";

    touchGlow.setAttribute("aria-hidden", "true");

    touchGlow.style.left = `${event.clientX}px`;
    touchGlow.style.top = `${event.clientY}px`;

    document.body.appendChild(touchGlow);

    setTimeout(() => {
        touchGlow.remove();
    }, 750);

});


/* =========================================
   7. FLOATING PARTICLES
========================================= */

function createParticle() {

    const particle = document.createElement("span");

    const symbols = ["✦", "✧", "·", "♡"];

    particle.className = "floating-particle";

    particle.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

    particle.style.left =
        `${Math.random() * 100}vw`;

    particle.style.color =
        Math.random() > 0.5
            ? "#f477eb"
            : "#a878ff";

    particle.style.fontSize =
        `${Math.random() * 12 + 8}px`;

    particle.style.opacity =
        String(Math.random() * 0.4 + 0.2);

    particle.style.animationDuration =
        `${Math.random() * 5 + 6}s`;

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 12000);

}


/* Create particles occasionally */

const particleInterval = setInterval(createParticle, 1000);


/* =========================================
   8. INITIALIZE WEBSITE
========================================= */

initializePhotos();

attachPhotoInteractions();

showWelcomeScreen();

updateMusicButton();

console.log("Aki Birthday Website initialized successfully 💜");