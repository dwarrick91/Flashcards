// script.js

let playerName = "Player";
let difficultyLevel = 3; // Default difficulty, will be set from UI on game start
let operationType = "multiplication"; // Default operation, will be set from UI on game start
let currentTheme = "rainbow"; // Default theme, will be set from UI on game start

let num1, num2, correctAnswerValue; // For arithmetic problems
// let displayedShapesCount; // Not strictly needed globally if correctAnswerValue is used for counting

let correctAnswers = 0;
let questionsAsked = 0;
// correctAnswersNeededForSticker is no longer used directly as rewards are per correct answer
let totalStickersPlaced = 0; // Tracks items (animals, merged animals) on the stickerBoardEl
let availableStickerCredits = 0; // Used for picking one animal after a correct answer

const gameLength = 1000;
const totalAnimalChoices = 5; // Number of base animal options to show in reward list

// Global variable to track the item being dragged from the main board (stickerBoardEl)
let itemDraggedFromMainBoard = null;
// Global variables for dragging NEW items from the reward list (#sticker-list)
let draggedStickerElement = null;
let stickerGhost = null;
let dragOffsetX, dragOffsetY;

// Local Storage
const localStorageKeyPrefix = "arithmeticFun_";

// Base animal definitions
const animalImageFiles = [
    { src: "cat.png", name: "Cat", alt: "a Cute Cat", baseImagePath: "images/animals/cat.png" },
    { src: "dog.png", name: "Dog", alt: "a Happy Dog", baseImagePath: "images/animals/dog.png" },
    { src: "bear.png", name: "Bear", alt: "a Friendly Bear", baseImagePath: "images/animals/bear.png" },
    { src: "lion.png", name: "Lion", alt: "a Brave Lion", baseImagePath: "images/animals/lion.png" },
    { src: "panda.png", name: "Panda", alt: "a Playful Panda", baseImagePath: "images/animals/panda.png" }
];
// mergeRecipes and checkForMerges are defined in merge.js

// --- Gallery Specific Variables ---
const gallerySlotsCount = 32;
let collectedCreatures = {}; // This will be loaded per player
let allCreatureMetaData = [];
const placeholderImagePath = 'images/placeholder.png'; // Ensure you have this image

// --- DOM Element References (Core Game) ---
const startMenuEl = document.getElementById('start-menu');
const playerNameInputEl = document.getElementById('playerNameInput');
const startGameBtnEl = document.getElementById('startGameBtn');
const nameErrorEl = document.getElementById('nameError');
const gameAndStickersContainerEl = document.getElementById('game-and-stickers-container');
const mainMenuBtnEl = document.getElementById('mainMenuBtn');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const operationSelectionEl = document.getElementById('operation-selection');
const themeRadios = document.querySelectorAll('input[name="theme"]');

const problemTextDisplayEl = document.getElementById('problemTextDisplay');
const problemVisualsEl = document.getElementById('problemVisuals');
const answerEl = document.getElementById('answer');
const feedbackEl = document.getElementById('feedback');
const correctCountEl = document.getElementById('correct-count');
const questionsAskedEl = document.getElementById('questions-asked');
const stickerSectionEl = document.getElementById('sticker-section');
const stickerHeaderEl = document.getElementById('sticker-header');
const stickerPromptEl = document.getElementById('sticker-prompt');
const stickerListEl = document.getElementById('sticker-list');
const stickerBoardEl = document.getElementById('sticker-board');
const personalizedMessageEl = document.getElementById('personalized-message');
let personalizedMessageTimeout = null;

const stickerListScrollUpBtn = document.getElementById('stickerListScrollUpBtn');
const stickerListScrollDownBtn = document.getElementById('stickerListScrollDownBtn');
const stickerListScrollAmount = 60;

const animalGalleryEl = document.getElementById('animal-gallery');


function canDragSticker() {
    if (availableStickerCredits <= 0) {
        return false;
    }
    return true;
}

// --- Local Storage Functions ---
function savePlayerData() {
    if (!playerName || playerName === "Player" || playerName.trim() === "") {
        console.log("Save SKIPPED: Player name not valid ('" + playerName + "') for saving collectedCreatures.");
        return;
    }
    try {
        // ONLY save collectedCreatures
        const playerDataToSave = {
            collectedCreatures: collectedCreatures
            // No longer saving theme, difficulty, operation here
        };
        const storageKey = localStorageKeyPrefix + playerName;
        localStorage.setItem(storageKey, JSON.stringify(playerDataToSave));
        console.log(`SAVED collectedCreatures for player "${playerName}" under key "${storageKey}":`, playerDataToSave);
    } catch (e) {
        console.error("Error SAVING player data to local storage:", e);
    }
}

function loadPlayerData(name) {
    console.log(`Attempting to LOAD collectedCreatures for player: "${name}"`);
    const storageKey = localStorageKeyPrefix + name;
    collectedCreatures = {}; // Reset for this load attempt

    try {
        const savedDataString = localStorage.getItem(storageKey);
        console.log(`Retrieved from localStorage for key "${storageKey}":`, savedDataString);

        if (savedDataString) {
            const savedPlayerData = JSON.parse(savedDataString);
            console.log("Parsed savedPlayerData:", savedPlayerData);
            collectedCreatures = savedPlayerData.collectedCreatures || {}; // Load only this
            console.log(`LOADED collectedCreatures for player "${name}"`);
        } else {
            console.log(`No saved data (collectedCreatures) found for new player: "${name}". Collection will be empty.`);
        }
    } catch (e) {
        console.error(`Error LOADING player data for "${name}":`, e);
        collectedCreatures = {}; // Default to fresh state on error
    }
    // This function no longer sets UI radio buttons for difficulty, op, theme.
    // Those are taken from the UI when "Start Game" is clicked.
}


// --- Theme Application ---
function applyTheme(themeName) {
    console.log("Applying theme:", themeName);
    document.body.className = '';
    document.body.classList.add(themeName + '-theme');
    currentTheme = themeName; // Update global currentTheme

    // Ensure UI radio button matches the applied theme
    const themeRadio = document.getElementById(`theme${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    // DO NOT savePlayerData() here for theme, as theme is not a persistent setting per player anymore.
}

// --- Start Menu Logic ---
function updateOperationVisibility() {
    const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    if (selectedDifficultyRadio && parseInt(selectedDifficultyRadio.value) === 1) { // Preschool selected
        operationSelectionEl.style.display = 'none';
    } else {
        operationSelectionEl.style.display = 'block';
    }
}

difficultyRadios.forEach(radio => {
    radio.addEventListener('change', updateOperationVisibility);
});


startGameBtnEl.addEventListener('click', () => {
    const nameInputValue = playerNameInputEl.value.trim();
    if (nameInputValue) {
        playerName = nameInputValue;
        nameErrorEl.style.display = 'none';
        console.log("Start Game Button Clicked. Player name set to:", playerName);

        // 1. Load ONLY `collectedCreatures` for this player.
        loadPlayerData(playerName);

        // 2. Read the CURRENT selections from the UI radio buttons to set globals for THIS session.
        const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
        difficultyLevel = selectedDifficultyRadio ? parseInt(selectedDifficultyRadio.value) : 3;

        if (difficultyLevel === 1) {
            operationType = "counting";
        } else {
            const selectedOperationRadio = document.querySelector('input[name="operation"]:checked');
            operationType = selectedOperationRadio ? selectedOperationRadio.value : "multiplication";
        }

        const selectedThemeRadio = document.querySelector('input[name="theme"]:checked');
        currentTheme = selectedThemeRadio ? selectedThemeRadio.value : "rainbow";

        applyTheme(currentTheme); // Apply the chosen theme visually.

        console.log(`FINAL settings for this game session: Diff=${difficultyLevel}, Op=${operationType}, Theme=${currentTheme}`);

        startMenuEl.style.display = 'none';
        gameAndStickersContainerEl.style.display = 'flex';
        initializeGame();
    } else {
        nameErrorEl.style.display = 'block';
        playerNameInputEl.focus();
    }
});

playerNameInputEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        startGameBtnEl.click();
    }
});

function initializeGame() {
    console.log("--- Initializing Game (using current globals) ---");
    console.log("Player:", playerName, "Diff:", difficultyLevel, "Op:", operationType, "Theme:", currentTheme);

    if (difficultyLevel === 1) {
         document.querySelector("#game-container h1").textContent = `Counting Fun for ${playerName}! 🧸`;
    } else {
         document.querySelector("#game-container h1").textContent = `${operationType.charAt(0).toUpperCase() + operationType.slice(1)} Fun for ${playerName}!`;
    }
    document.getElementById("sticker-board-header").textContent = `${playerName}'s Reward Board! ✨`;

    answerEl.disabled = false;
    document.getElementById('submitAnswerBtn').disabled = false;

    generateProblem();
    updateStickerSectionStatus();
    initializeGallery(); // Uses the `collectedCreatures` loaded for the player
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    answerEl.focus();
}

if (mainMenuBtnEl) {
    mainMenuBtnEl.addEventListener('click', goToMainMenu);
}

function goToMainMenu() {
    console.log("goToMainMenu called for player:", playerName, "- saving their creature collection if valid name.");
    savePlayerData(); // This will now ONLY save collectedCreatures

    gameAndStickersContainerEl.style.display = 'none';
    startMenuEl.style.display = 'flex';

    // Reset in-memory game state for the next potential player/session
    correctAnswers = 0;
    questionsAsked = 0;
    totalStickersPlaced = 0;
    availableStickerCredits = 0;
    collectedCreatures = {}; // Reset in-memory collection for UI of next potential session
    
    correctCountEl.textContent = correctAnswers;
    questionsAskedEl.textContent = questionsAsked;
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    answerEl.value = '';
    answerEl.disabled = false;
    if(document.getElementById('submitAnswerBtn')) document.getElementById('submitAnswerBtn').disabled = false;

    stickerBoardEl.innerHTML = '';
    stickerListEl.innerHTML = '';
    stickerSectionEl.classList.add('hidden');
    problemVisualsEl.innerHTML = '';
    problemTextDisplayEl.textContent = '';

    if (personalizedMessageTimeout) {
        clearTimeout(personalizedMessageTimeout);
        personalizedMessageTimeout = null;
    }
    if (personalizedMessageEl) personalizedMessageEl.classList.remove('visible');

    initializeGallery(); // Re-initialize gallery (will show placeholders)

    playerNameInputEl.value = "";
    // Set UI radio buttons to default values for the start menu appearance
    document.getElementById('grade3').checked = true;
    document.getElementById('opMultiply').checked = true;
    document.getElementById('themeRainbow').checked = true;
    
    // Reset global JS variables to reflect these UI defaults for the start menu state
    difficultyLevel = 3;
    operationType = "multiplication";
    currentTheme = "rainbow"; 
    
    applyTheme(currentTheme); // Apply default theme visually & ensure its radio is checked
    updateOperationVisibility(); // Reflect the default difficulty for op visibility

    playerName = "Player"; // Reset global playerName to default for next input

    playerNameInputEl.focus();
}

// --- Gallery Functions ---
function buildAllCreatureMetaData() {
    allCreatureMetaData = [];
    let creatureIdCounter = 1;
    animalImageFiles.forEach(animal => {
        allCreatureMetaData.push({ id_num: creatureIdCounter++, name: animal.name, imageSrc: animal.baseImagePath });
    });
    const galleryAddedMergedNames = new Set(animalImageFiles.map(a => a.name));
    if (typeof mergeRecipes !== 'undefined' && Array.isArray(mergeRecipes)) {
        const sortedMergeRecipesForGallery = [...mergeRecipes].sort((a,b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            if (a.components && b.components && a.components.length !== b.components.length) return a.components.length - b.components.length; // Should be baseCount or tier now
            return a.resultName.localeCompare(b.resultName);
        });
        sortedMergeRecipesForGallery.forEach(recipe => {
            if (!galleryAddedMergedNames.has(recipe.resultName)) {
                if (creatureIdCounter <= gallerySlotsCount) {
                     allCreatureMetaData.push({ id_num: creatureIdCounter++, name: recipe.resultName, imageSrc: `images/merged_animals/${recipe.resultImage}` });
                    galleryAddedMergedNames.add(recipe.resultName);
                }
            }
        });
    }
    while(allCreatureMetaData.length < gallerySlotsCount) {
        allCreatureMetaData.push({ id_num: creatureIdCounter++, name: `Unknown ${allCreatureMetaData.length + 1}`, imageSrc: placeholderImagePath });
    }
}

function initializeGallery() {
    if (!animalGalleryEl) return;
    animalGalleryEl.innerHTML = '';
    if (allCreatureMetaData.length === 0 || allCreatureMetaData.length < gallerySlotsCount) {
        buildAllCreatureMetaData();
    }
    for (let i = 0; i < gallerySlotsCount; i++) {
        const slot = document.createElement('div');
        slot.classList.add('gallery-slot');
        const creatureMeta = allCreatureMetaData[i];
        if (creatureMeta) {
            slot.dataset.creatureName = creatureMeta.name;
            if (collectedCreatures[creatureMeta.name]) {
                const img = document.createElement('img');
                img.src = creatureMeta.imageSrc;
                img.alt = creatureMeta.name;
                slot.appendChild(img);
                slot.classList.add('unlocked');
            } else {
                const numberSpan = document.createElement('span');
                numberSpan.classList.add('placeholder-number');
                numberSpan.textContent = creatureMeta.id_num;
                slot.appendChild(numberSpan);
            }
        } else {
            const numberSpan = document.createElement('span');
            numberSpan.classList.add('placeholder-number');
            numberSpan.textContent = (i + 1);
            slot.appendChild(numberSpan);
        }
        animalGalleryEl.appendChild(slot);
    }
}

function unlockInGallery(creatureName) {
    if (!animalGalleryEl || !creatureName) return;
    let newlyUnlocked = false;
    if (!collectedCreatures[creatureName]) {
        newlyUnlocked = true;
    }
    collectedCreatures[creatureName] = true;
    if (newlyUnlocked) {
        savePlayerData(); // Only saves collectedCreatures now
    }
    const creatureMeta = allCreatureMetaData.find(c => c.name === creatureName);
    if (!creatureMeta) { console.warn("Creature meta not found for gallery unlock:", creatureName); return; }
    const slot = animalGalleryEl.querySelector(`.gallery-slot[data-creature-name="${creatureName}"]`);
    if (slot && !slot.classList.contains('unlocked')) {
        slot.innerHTML = '';
        const img = document.createElement('img');
        img.src = creatureMeta.imageSrc;
        img.alt = creatureMeta.name;
        slot.appendChild(img);
        slot.classList.add('unlocked');
    }
}

// --- Core Game Logic ---
function generateProblem() {
    problemVisualsEl.innerHTML = '';
    problemTextDisplayEl.textContent = '';
    console.log(`--- generateProblem called with current settings --- Difficulty: ${difficultyLevel}, Operation: ${operationType}, Theme: ${currentTheme}`);

    if (difficultyLevel === 1 && operationType === "counting") {
        generateCountingProblem();
    } else if (difficultyLevel !== 1 && ["addition", "subtraction", "division", "multiplication"].includes(operationType)) {
        generateArithmeticProblem();
    } else {
        console.error(`generateProblem: Invalid state! Op: "${operationType}", Diff: ${difficultyLevel}. Defaulting.`);
        operationType = "multiplication"; difficultyLevel = 3;
        document.getElementById('opMultiply').checked = true;
        document.getElementById('grade3').checked = true;
        updateOperationVisibility();
        generateArithmeticProblem();
    }
    answerEl.value = '';
}

function generateCountingProblem() {
    console.log("Generating COUNTING problem for Preschool");
    problemTextDisplayEl.textContent = "How many shapes can you count?";
    const numShapesToDisplay = Math.floor(Math.random() * 10) + 1;
    correctAnswerValue = numShapesToDisplay;
    const shapesEmojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '🔺', '▪️', '🔶', '❤️', '💜', '🧡'];
    const selectedShapeEmoji = shapesEmojis[Math.floor(Math.random() * shapesEmojis.length)];
    for (let i = 0; i < numShapesToDisplay; i++) {
        const shapeSpan = document.createElement('span');
        shapeSpan.textContent = selectedShapeEmoji;
        shapeSpan.classList.add('shape');
        problemVisualsEl.appendChild(shapeSpan);
    }
}

function generateArithmeticProblem() {
    let n1, n2, answer;
    let operatorSymbol = '?';
    console.log(`Generating ARITHMETIC Problem: Operation=${operationType}, Difficulty=${difficultyLevel}`);
    switch (operationType) {
        case "addition":
            operatorSymbol = '+';
            switch (difficultyLevel) {
                case 2: n1 = Math.floor(Math.random() * 21); n2 = Math.floor(Math.random() * 11); break;
                case 3: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; break;
                case 4: n1 = Math.floor(Math.random() * 401) + 100; n2 = Math.floor(Math.random() * 401) + 100; break;
                case 5: n1 = Math.floor(Math.random() * 900) + 100; n2 = Math.floor(Math.random() * 900) + 100; break;
                default: console.warn("Add: Unknown diff", difficultyLevel); n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; break;
            }
            if (typeof n1 === 'undefined' || typeof n2 === 'undefined') { console.error("Add: n1/n2 undefined!"); n1=1;n2=1; }
            answer = n1 + n2;
            break;
        case "subtraction":
            operatorSymbol = '−';
            switch (difficultyLevel) {
                case 2: n1 = Math.floor(Math.random() * 19) + 1; n2 = Math.floor(Math.random() * (n1 + 1)); break;
                case 3: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * n1); break;
                case 4: n1 = Math.floor(Math.random() * 900) + 100; n2 = Math.floor(Math.random() * n1); break;
                case 5: n1 = Math.floor(Math.random() * 9900) + 100; n2 = Math.floor(Math.random() * n1); break;
                default: console.warn("Sub: Unknown diff", difficultyLevel); n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * n1); break;
            }
            if (typeof n1 === 'undefined' || typeof n2 === 'undefined') { console.error("Sub: n1/n2 undefined!"); n1=2;n2=1; }
            answer = n1 - n2;
            break;
        case "division":
            operatorSymbol = '÷';
            let quotient;
            switch (difficultyLevel) {
                case 3: n2 = Math.floor(Math.random() * 8) + 2; quotient = Math.floor(Math.random() * 8) + 2; n1 = n2 * quotient; break;
                case 4: n2 = Math.floor(Math.random() * 11) + 2; quotient = Math.floor(Math.random() * 11) + 2; n1 = n2 * quotient; break;
                case 5: n2 = Math.floor(Math.random() * 11) + 2;  quotient = Math.floor(Math.random() * 19) + 2; n1 = n2 * quotient; break;
                default: console.warn("Div: Unknown/Unsupported diff", difficultyLevel, "defaulting to G3"); n2 = Math.floor(Math.random() * 8) + 2; quotient = Math.floor(Math.random() * 8) + 2; n1 = n2 * quotient; break;
            }
            if (n2 === 0) { console.error("Division by zero attempted!"); generateProblem(); return; }
            if (typeof n1 === 'undefined' || typeof n2 === 'undefined') { console.error("Div: n1/n2 undefined!"); n1=4;n2=2; quotient=2; }
            answer = quotient;
            break;
        case "multiplication":
        default:
            if (operationType !== "multiplication") {
                 console.warn(`Unexpected opType "${operationType}", defaulting to multiplication.`);
                 operationType = "multiplication";
            }
            operatorSymbol = '×';
            switch (difficultyLevel) {
                case 2:
                    if (Math.random() < 0.7) { n1 = Math.floor(Math.random() * 6); n2 = Math.floor(Math.random() * 11); }
                    else {
                        if (Math.random() < 0.5) { n1 = 10; n2 = Math.floor(Math.random() * 6); }
                        else { n1 = Math.floor(Math.random() * 6); n2 = 10; }
                    }
                    break;
                case 3: n1 = Math.floor(Math.random() * 10) + 1; n2 = Math.floor(Math.random() * 10) + 1; break;
                case 4: n1 = Math.floor(Math.random() * 12) + 1; n2 = Math.floor(Math.random() * 12) + 1; break;
                case 5:
                    if (Math.random() > 0.5) { n1 = Math.floor(Math.random() * 12) + 1;  n2 = Math.floor(Math.random() * 10) + 10; }
                    else { n1 = Math.floor(Math.random() * 10) + 10; n2 = Math.floor(Math.random() * 12) + 1; }
                    if (Math.random() < 0.2) { n1 = Math.floor(Math.random() * 14) + 2; n2 = Math.floor(Math.random() * 14) + 2; }
                    break;
                default: console.warn("Mul: Unknown diff", difficultyLevel); n1 = Math.floor(Math.random() * 10) + 1; n2 = Math.floor(Math.random() * 10) + 1; break;
            }
            if (typeof n1 === 'undefined' || typeof n2 === 'undefined') { console.error("Mul: n1/n2 undefined!"); n1=2;n2=2; }
            answer = n1 * n2;
            break;
    }
    num1 = n1; num2 = n2;
    correctAnswerValue = answer;
    problemTextDisplayEl.textContent = `${n1} ${operatorSymbol} ${n2} = ?`;
}

function updateStickerSectionStatus() {
    if (availableStickerCredits > 0) {
        stickerSectionEl.classList.remove('hidden');
        stickerHeaderEl.textContent = "🎉 Yay! Pick an animal friend! 🐾";
        stickerPromptEl.textContent = "Drag an animal to your reward board.";
        const firstItemInList = stickerListEl.querySelector('.sticker-option');
        if (!firstItemInList || firstItemInList.tagName !== 'IMG') { 
            populateAnimalChoices();
        }
        document.querySelectorAll('#sticker-list .sticker-option').forEach(opt => opt.classList.remove('disabled-drag'));
    } else {
        stickerHeaderEl.textContent = "Keep up the great work!";
        stickerPromptEl.textContent = "Answer correctly to earn animal friends!";
        document.querySelectorAll('#sticker-list .sticker-option').forEach(opt => opt.classList.add('disabled-drag'));
        if (questionsAsked < gameLength && questionsAsked > 0) {
            setTimeout(() => {
                if(availableStickerCredits === 0 && !personalizedMessageEl.classList.contains('visible')) {
                    stickerSectionEl.classList.add('hidden');
                }
            }, 2500);
        } else if (questionsAsked >= gameLength && availableStickerCredits === 0) {
             stickerSectionEl.classList.add('hidden');
        }
    }
    updateScrollButtonStates();
}
function triggerAnimalReward() {
    availableStickerCredits = 1;
    updateStickerSectionStatus();
}
function checkAnswer() {
    const userAnswer = parseInt(answerEl.value);
    questionsAsked++;
    if (!isNaN(userAnswer)) {
        if (userAnswer === correctAnswerValue) {
            feedbackEl.textContent = "🌟 Correct! 🌟"; 
            feedbackEl.className = 'correct'; 
            correctAnswers++;
            triggerAnimalReward(); 
        } else {
            feedbackEl.textContent = `🤔 Almost! The correct answer was ${correctAnswerValue}.`;
            feedbackEl.className = 'incorrect'; 
        }
    } else {
         feedbackEl.textContent = `Please enter a number.`;
         feedbackEl.className = 'incorrect'; 
         questionsAsked--;
    }
    correctCountEl.textContent = correctAnswers;
    questionsAskedEl.textContent = questionsAsked;
    if (questionsAsked < gameLength) {
        if (!isNaN(userAnswer) || questionsAsked === 0 || userAnswer !== undefined ){
             generateProblem();
        }
    } else {
        endGame();
    }
    answerEl.focus();
}
answerEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') { event.preventDefault(); checkAnswer(); }
});
function populateAnimalChoices() {
    stickerListEl.innerHTML = '';
    for (let i = 0; i < totalAnimalChoices; i++) {
        const animalData = animalImageFiles[i % animalImageFiles.length];
        const animalImgEl = document.createElement('img');
        animalImgEl.src = animalData.baseImagePath;
        animalImgEl.alt = animalData.alt;
        animalImgEl.dataset.animalType = animalData.name;
        animalImgEl.classList.add('sticker-option');
        animalImgEl.draggable = true;
        animalImgEl.addEventListener('dragstart', handleDragStartMouse);
        animalImgEl.addEventListener('touchstart', handleDragStartTouch, { passive: false });
        stickerListEl.appendChild(animalImgEl);
    }
    updateDragDisabledState();
    updateScrollButtonStates();
}
function updateDragDisabledState() {
     document.querySelectorAll('#sticker-list .sticker-option').forEach(opt => {
        if (availableStickerCredits <= 0) opt.classList.add('disabled-drag');
        else opt.classList.remove('disabled-drag');
    });
}
function endGame() {
    problemTextDisplayEl.textContent = "Game Over!";
    problemVisualsEl.innerHTML = '';
    answerEl.disabled = true;
    document.getElementById('submitAnswerBtn').disabled = true;
    let finalMessage = ` You got ${correctAnswers} out of ${questionsAsked} correct.`;
    if (totalStickersPlaced > 0) {
        finalMessage += ` You have ${totalStickersPlaced} creation(s) on your board!`;
    }
    const collectedCount = Object.keys(collectedCreatures).length;
    if (collectedCount > 0) {
        finalMessage += ` You discovered ${collectedCount} out of ${gallerySlotsCount} creatures in your collection!`;
    }
    if (totalStickersPlaced === 0 && collectedCount === 0 && correctAnswers > 0) {
         finalMessage += " Keep practicing to collect creatures!";
    } else if (correctAnswers === 0 && totalStickersPlaced === 0 && collectedCount === 0) {
        finalMessage = " Keep practicing!";
    }
    feedbackEl.innerHTML = `🎉 Game Over, ${playerName}! ${finalMessage} 🎉`;
    feedbackEl.className = '';
     updateStickerSectionStatus();
     if(availableStickerCredits > 0 && stickerSectionEl.classList.contains('hidden')){
         stickerSectionEl.classList.remove('hidden');
     }
}
function handleDragStartMouse(e) {
    if (!canDragSticker()) { e.preventDefault(); return; }
    draggedStickerElement = e.target.cloneNode(true);
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    const rect = e.target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    try {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.dataTransfer.setData('text/plain', e.target.dataset.animalType || e.target.alt);
    } catch (error) {}
}
function handleDragStartTouch(e) {
    if (!canDragSticker()) { return; }
    e.preventDefault();
    const touch = e.targetTouches[0];
    const originalListItem = e.target;
    stickerGhost = originalListItem.cloneNode(true);
    stickerGhost.classList.remove('sticker-option', 'disabled-drag');
    stickerGhost.classList.add('sticker-ghost');
    stickerGhost.style.width = originalListItem.offsetWidth + 'px';
    stickerGhost.style.height = originalListItem.offsetHeight + 'px';
    const rect = originalListItem.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
    document.body.appendChild(stickerGhost);
    draggedStickerElement = originalListItem.cloneNode(true);
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    document.addEventListener('touchmove', handleDragMoveTouch, { passive: false });
    document.addEventListener('touchend', handleDragEndTouchRewardList);
}
function handleDragMoveTouch(e) {
    e.preventDefault();
    if (!stickerGhost) return;
    const touch = e.targetTouches[0];
    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
}
function handleDropOnBoardOrZoo(pageX, pageY) {
    if (!draggedStickerElement) return;
    placeStickerOnBoard(pageX, pageY);
    if (draggedStickerElement) { draggedStickerElement = null; }
    if (stickerGhost && stickerGhost.parentNode) {
        stickerGhost.parentNode.removeChild(stickerGhost);
        stickerGhost = null;
    }
}
stickerBoardEl.addEventListener('dragover', (e) => {
    if (draggedStickerElement || itemDraggedFromMainBoard) {
        e.preventDefault();
        stickerBoardEl.classList.add('board-drop-target-active');
    }
});
stickerBoardEl.addEventListener('dragleave', (e) => {
    stickerBoardEl.classList.remove('board-drop-target-active');
});
stickerBoardEl.addEventListener('drop', (e) => {
    e.preventDefault();
    stickerBoardEl.classList.remove('board-drop-target-active');
    if (draggedStickerElement) {
        placeStickerOnBoard(e.clientX, e.clientY);
    }
});
function handleDragEndTouchRewardList(e) {
    const touch = e.changedTouches[0];
    if (draggedStickerElement && touch) {
         handleDropOnBoardOrZoo(touch.clientX, touch.clientY);
    }
    if (stickerGhost && stickerGhost.parentNode) {
        stickerGhost.parentNode.removeChild(stickerGhost);
        stickerGhost = null;
    }
    if (draggedStickerElement) { draggedStickerElement = null; }
    document.removeEventListener('touchmove', handleDragMoveTouch);
    document.removeEventListener('touchend', handleDragEndTouchRewardList);
}
function placeStickerOnBoard(pageX, pageY) {
    if (!draggedStickerElement) return;
    const boardRect = stickerBoardEl.getBoundingClientRect();
    const stickerTopLeftXonPage = pageX - dragOffsetX;
    const stickerTopLeftYonPage = pageY - dragOffsetY;
    const animalIdentifier = draggedStickerElement.alt || "a new friend";
    const animalTypeOfPlacedItem = draggedStickerElement.dataset.animalType;
    const tempItemWidth = draggedStickerElement.offsetWidth || 50;
    const tempItemHeight = draggedStickerElement.offsetHeight || 50;
    const itemCenterXonPage = stickerTopLeftXonPage + tempItemWidth / 2;
    const itemCenterYonPage = stickerTopLeftYonPage + tempItemHeight / 2;

    if (itemCenterXonPage >= boardRect.left && itemCenterXonPage <= boardRect.right &&
        itemCenterYonPage >= boardRect.top && itemCenterYonPage <= boardRect.bottom) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('placed-animal');
        const imageToPlace = draggedStickerElement.cloneNode(true);
        if (animalTypeOfPlacedItem && !imageToPlace.dataset.animalType) {
            imageToPlace.dataset.animalType = animalTypeOfPlacedItem;
        }
        wrapperDiv.appendChild(imageToPlace);
        let elementToPlaceOnBoard = wrapperDiv;
        elementToPlaceOnBoard.style.position = 'absolute';
        elementToPlaceOnBoard.style.left = (stickerTopLeftXonPage - boardRect.left) + 'px';
        elementToPlaceOnBoard.style.top = (stickerTopLeftYonPage - boardRect.top) + 'px';
        stickerBoardEl.appendChild(elementToPlaceOnBoard);
        makePlacedStickerInteractive(elementToPlaceOnBoard, stickerBoardEl);
        totalStickersPlaced++;
        availableStickerCredits--;
        updateStickerSectionStatus();
        if (animalTypeOfPlacedItem) { unlockInGallery(animalTypeOfPlacedItem); }
        let anyMergeHappenedThisTurn = false;
        let aMergeOccurredInLoop; let iterations = 0; const maxIterations = 10;
        do {
            if (typeof checkForMerges === 'function') {
                const mergeResultName = checkForMerges();
                if (mergeResultName) { anyMergeHappenedThisTurn = true; aMergeOccurredInLoop = true; unlockInGallery(mergeResultName); }
                else { aMergeOccurredInLoop = false; }
            } else { aMergeOccurredInLoop = false; }
            iterations++;
        } while (aMergeOccurredInLoop && iterations < maxIterations);
        if (!anyMergeHappenedThisTurn) {
            if (personalizedMessageTimeout) { clearTimeout(personalizedMessageTimeout); }
            let personalizedTextToShow = `Great job, ${playerName}! You collected ${animalIdentifier}! 🥳`;
            personalizedMessageEl.style.borderColor = '#2ECC40';
            personalizedMessageEl.style.color = (currentTheme === "videogame" && personalizedMessageEl.style.fontFamily.includes('Press Start 2P')) ? '' : '#2ECC40';
            personalizedMessageEl.textContent = personalizedTextToShow;
            personalizedMessageEl.classList.add('visible');
            personalizedMessageTimeout = setTimeout(() => {
                personalizedMessageEl.classList.remove('visible');
                personalizedMessageEl.style.color = '';
            }, 2800);
        }
        draggedStickerElement = null;
    } else {
        draggedStickerElement = null;
    }
}
function makePlacedStickerInteractive(sticker, container) {
    let isDraggingPlaced = false;
    let interactionPointOffsetX, interactionPointOffsetY;
    function startDrag(e) {
        isDraggingPlaced = true;
        itemDraggedFromMainBoard = sticker;
        const clientX = e.clientX || e.targetTouches[0].clientX;
        const clientY = e.clientY || e.targetTouches[0].clientY;
        const stickerRectPage = sticker.getBoundingClientRect();
        interactionPointOffsetX = clientX - stickerRectPage.left;
        interactionPointOffsetY = clientY - stickerRectPage.top;
        document.body.appendChild(sticker);
        sticker.style.position = 'absolute';
        sticker.style.left = (clientX - interactionPointOffsetX) + 'px';
        sticker.style.top = (clientY - interactionPointOffsetY) + 'px';
        sticker.style.cursor = 'grabbing';
        sticker.style.zIndex = '3000';
        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', moveDrag);
            document.addEventListener('mouseup', endDrag);
        } else if (e.type === 'touchstart') {
            e.preventDefault();
            document.addEventListener('touchmove', moveDrag, { passive: false });
            document.addEventListener('touchend', endDrag);
        }
    }
    function moveDrag(e) {
        if (!isDraggingPlaced) return;
        e.preventDefault();
        const clientX = e.clientX || e.targetTouches[0].clientX;
        const clientY = e.clientY || e.targetTouches[0].clientY;
        sticker.style.left = (clientX - interactionPointOffsetX) + 'px';
        sticker.style.top = (clientY - interactionPointOffsetY) + 'px';
    }
    function endDrag(e_up) {
        if (!isDraggingPlaced) return;
        const itemThatWasDragged = itemDraggedFromMainBoard;
        isDraggingPlaced = false;
        itemDraggedFromMainBoard = null;
        sticker.style.cursor = 'move';
        sticker.style.zIndex = '10';
        const eventType = e_up.type;
        if (eventType === 'mouseup') {
            document.removeEventListener('mousemove', moveDrag);
            document.removeEventListener('mouseup', endDrag);
        } else if (eventType === 'touchend') {
            document.removeEventListener('touchmove', moveDrag);
            document.removeEventListener('touchend', endDrag);
        }
        const boardRect = stickerBoardEl.getBoundingClientRect();
        const stickerPageX = parseFloat(itemThatWasDragged.style.left);
        const stickerPageY = parseFloat(itemThatWasDragged.style.top);
        let newLeft = stickerPageX - boardRect.left;
        let newTop = stickerPageY - boardRect.top;
        const itemWidth = itemThatWasDragged.offsetWidth;
        const itemHeight = itemThatWasDragged.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, boardRect.width - itemWidth));
        newTop = Math.max(0, Math.min(newTop, boardRect.height - itemHeight));
        itemThatWasDragged.style.left = newLeft + 'px';
        itemThatWasDragged.style.top = newTop + 'px';
        itemThatWasDragged.style.position = 'absolute';
        if (itemThatWasDragged.parentElement !== stickerBoardEl) {
            stickerBoardEl.appendChild(itemThatWasDragged);
        }
        const isAnimalWrapper = itemThatWasDragged.classList.contains('placed-animal');
        if (isAnimalWrapper) {
            let aMergeOccurredInLoop; let iterations = 0; const maxIterations = 10;
            do {
                if (typeof checkForMerges === 'function') {
                    const mergeResultName = checkForMerges();
                    if (mergeResultName) { aMergeOccurredInLoop = true; unlockInGallery(mergeResultName); }
                    else { aMergeOccurredInLoop = false; }
                } else { aMergeOccurredInLoop = false; }
                iterations++;
            } while (aMergeOccurredInLoop && iterations < maxIterations);
        }
    }
    sticker.addEventListener('mousedown', startDrag);
    sticker.addEventListener('touchstart', startDrag, { passive: false });
    sticker.ondragstart = () => false;
}

// --- Sticker List Scroll Button Logic ---
if (stickerListScrollUpBtn && stickerListScrollDownBtn && stickerListEl) {
    stickerListScrollUpBtn.addEventListener('click', () => {
        stickerListEl.scrollTop -= stickerListScrollAmount;
        updateScrollButtonStates();
    });
    stickerListScrollDownBtn.addEventListener('click', () => {
        stickerListEl.scrollTop += stickerListScrollAmount;
        updateScrollButtonStates();
    });
    stickerListEl.addEventListener('scroll', updateScrollButtonStates);
}
function updateScrollButtonStates() {
    if (!stickerListEl || !stickerListScrollUpBtn || !stickerListScrollDownBtn) return;
    const isScrollable = stickerListEl.scrollHeight > stickerListEl.clientHeight;
    stickerListScrollUpBtn.disabled = !isScrollable || stickerListEl.scrollTop <= 0;
    stickerListScrollDownBtn.disabled = !isScrollable || stickerListEl.scrollTop + stickerListEl.clientHeight >= stickerListEl.scrollHeight -1;
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    const initialThemeRadio = document.querySelector('input[name="theme"]:checked');
    currentTheme = initialThemeRadio ? initialThemeRadio.value : "rainbow";
    applyTheme(currentTheme);

    const initialDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    difficultyLevel = initialDifficultyRadio ? parseInt(initialDifficultyRadio.value) : 3;
    if(difficultyLevel === 1) {
        operationType = "counting";
    } else {
        const initialOperationRadio = document.querySelector('input[name="operation"]:checked');
        operationType = initialOperationRadio ? initialOperationRadio.value : "multiplication";
    }
    
    updateOperationVisibility();
    updateScrollButtonStates();
    buildAllCreatureMetaData();
    initializeGallery();
});