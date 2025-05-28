// script.js

let playerName = "Player";
let difficultyLevel = 3;
let operationType = "multiplication";
let currentTheme = "rainbow";

let num1, num2, correctAnswerValue;
let displayedShapesCount;

let correctAnswers = 0;
let questionsAsked = 0;
// correctAnswersNeededForSticker is effectively 1 for animals now
let totalStickersPlaced = 0; // Tracks items on the main interactive stickerBoardEl
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
let collectedCreatures = {}; // Object to track unlocked creatures: { "Cat": true, "Bearcat": true }
let allCreatureMetaData = [];
const placeholderImagePath = 'images/placeholder.png';

// --- DOM Element References (Core Game) ---
const startMenuEl = document.getElementById('start-menu');
const playerNameInputEl = document.getElementById('playerNameInput');
const startGameBtnEl = document.getElementById('startGameBtn');
const nameErrorEl = document.getElementById('nameError');
const gameAndStickersContainerEl = document.getElementById('game-and-stickers-container');
const mainMenuBtnEl = document.getElementById('mainMenuBtn');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const operationSelectionEl = document.getElementById('operation-selection');

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

// --- Local Storage Functions ---
function savePlayerData() {
    if (!playerName || playerName === "Player" || playerName.trim() === "") {
        // console.log("Player name not set or default, not saving data.");
        return;
    }
    try {
        const playerData = {
            collectedCreatures: collectedCreatures,
            lastTheme: currentTheme,
            lastDifficulty: difficultyLevel,
            lastOperation: operationType
        };
        localStorage.setItem(localStorageKeyPrefix + playerName, JSON.stringify(playerData));
        // console.log("Player data saved for:", playerName);
    } catch (e) {
        console.error("Error saving player data to local storage:", e);
    }
}

function loadPlayerData(name) {
    try {
        const savedDataString = localStorage.getItem(localStorageKeyPrefix + name);
        if (savedDataString) {
            const savedPlayerData = JSON.parse(savedDataString);
            collectedCreatures = savedPlayerData.collectedCreatures || {};
            
            currentTheme = savedPlayerData.lastTheme || "rainbow";
            // applyTheme will be called after this based on selectedThemeRadio or currentTheme

            difficultyLevel = savedPlayerData.lastDifficulty || 3;
            const diffRadioId = difficultyLevel === 1 ? 'gradePreschool' : `grade${difficultyLevel}`;
            const diffRadio = document.getElementById(diffRadioId);
            if (diffRadio) diffRadio.checked = true;
            
            updateOperationVisibility(); // Update based on loaded difficulty

            if (difficultyLevel !== 1) { 
                operationType = savedPlayerData.lastOperation || "multiplication";
                // Construct operation radio ID: op + Capitalized(operationType)
                const opRadioId = `op${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`;
                const opRadio = document.getElementById(opRadioId);
                if (opRadio) opRadio.checked = true;
            } else {
                operationType = "counting"; 
            }
            
            // Theme radio button will be updated when applyTheme is called in startGameBtnEl listener
            // console.log("Player data loaded for:", name);
            return true; 
        } else {
            // console.log("No saved data for new player:", name);
            collectedCreatures = {}; 
            // Set defaults for UI elements on start menu if no data (already handled by 'checked' in HTML)
            difficultyLevel = 3;
            operationType = "multiplication";
            currentTheme = "rainbow";
            document.getElementById('grade3').checked = true;
            document.getElementById('opMultiply').checked = true;
            document.getElementById('themeRainbow').checked = true;
            updateOperationVisibility();
        }
    } catch (e) {
        console.error("Error loading player data:", e);
        collectedCreatures = {}; 
    }
    return false; 
}

// script.js

// ... (all existing global variables like playerName, difficultyLevel, etc.) ...
// ... (all existing DOM element consts: startMenuEl, ..., stickerBoardEl, etc.) ...
// ... (animalImageFiles constant) ...
// mergeRecipes and checkForMerges are defined in merge.js

// --- ADD THIS FUNCTION BACK ---
function canDragSticker() {
    // This function checks if there's a reward credit available.
    // It's used by both animal rewards and (previously) word sticker rewards.
    // Since all rewards are now animals and triggerAnimalReward sets availableStickerCredits = 1,
    // this function still correctly checks if a reward pick is allowed.
    if (availableStickerCredits <= 0) {
        // console.log("No reward credits available to drag."); // For debugging
        return false;
    }
    return true;
}
// --- END OF FUNCTION TO ADD BACK ---


// --- Start Menu and Game Initialization Logic ---
// ... (applyTheme, updateOperationVisibility, startGameBtn listeners, initializeGame, goToMainMenu functions as before) ...

// --- Gallery Functions ---
// ... (buildAllCreatureMetaData, initializeGallery, unlockInGallery functions as before) ...

// --- Core Game Logic ---
// ... (generateProblem, generateCountingProblem, generateArithmeticProblem functions as before) ...
// ... (updateStickerSectionStatus, triggerAnimalReward functions as before) ...
// ... (checkAnswer function - this one was updated in the last step, ensure it's correct) ...
/*
function checkAnswer() {
    const userAnswer = parseInt(answerEl.value);
    questionsAsked++;

    if (!isNaN(userAnswer)) {
        if (userAnswer === correctAnswerValue) {
            feedbackEl.textContent = "🌟 Correct! 🌟"; 
            feedbackEl.className = 'correct'; 
            correctAnswers++;
            triggerAnimalReward(); // ALL MODES now trigger an animal reward

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
    if (event.key === 'Enter') {
        event.preventDefault();
        checkAnswer();
    }
});
*/
// (The checkAnswer function above is likely what you have, just ensuring it's not the source of canDragSticker)


// ... (populateAnimalChoices, updateDragDisabledState, endGame functions as before) ...
// populateWordStickers function should be removed.


// --- Drag and Drop Logic for items FROM THE REWARD LIST (#sticker-list) ---
// (handleDragStartMouse, handleDragStartTouch - these will call the re-added canDragSticker)
/*
function handleDragStartMouse(e) {
    if (!canDragSticker()) { e.preventDefault(); return; } // Call to canDragSticker
    draggedStickerElement = e.target.cloneNode(true);
    // ... rest of function
}

function handleDragStartTouch(e) {
    if (!canDragSticker()) { return; } // Call to canDragSticker
    e.preventDefault();
    // ... rest of function
}
*/
// ... (handleDragMoveTouch, handleDropOnBoardOrZoo, stickerBoardEl listeners, handleDragEndTouchRewardList functions as before) ...

// --- Place Item on Board (Called by drop handlers for new items from list) ---
// ... (placeStickerOnBoard function as before) ...

// --- Drag and Drop Logic for items ALREADY ON THE STICKER BOARD ---
// ... (makePlacedStickerInteractive function as before) ...

// --- Sticker List Scroll Button Logic --- 
// ... (scroll button listeners and updateScrollButtonStates function as before) ...

// --- Initial Setup ---
// ... (DOMContentLoaded listener with applyTheme, updateOperationVisibility, updateScrollButtonStates calls as before) ...
// ... (NO initializeZoo call) ...
// --- Theme Application ---
function applyTheme(themeName) {
    document.body.className = '';
    document.body.classList.add(themeName + '-theme');
    currentTheme = themeName;

    const themeRadio = document.getElementById(`theme${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    // Only save if game has started and player name is valid
    if (playerName && playerName !== "Player" && !startMenuEl.style.display_none_if_set_to_none_otherwise_empty_string_is_fine_here_too) { // Check if game is active
         savePlayerData();
    }
}

// --- Start Menu Logic ---
function updateOperationVisibility() {
    const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    if (selectedDifficultyRadio && parseInt(selectedDifficultyRadio.value) === 1) {
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

        loadPlayerData(playerName); // Load data. This updates difficultyLevel, operationType, currentTheme globals.

        // Ensure UI reflects loaded or default values before starting
        const themeToApply = currentTheme; // Use currentTheme as updated by loadPlayerData or default
        applyTheme(themeToApply);
        
        const difficultyRadioId = difficultyLevel === 1 ? 'gradePreschool' : `grade${difficultyLevel}`;
        const diffRadioToEnsure = document.getElementById(difficultyRadioId);
        if (diffRadioToEnsure) diffRadioToEnsure.checked = true;
        updateOperationVisibility(); // Ensure op visibility is correct based on loaded difficulty

        if (difficultyLevel !== 1) {
            const opRadioIdToEnsure = `op${operationType.charAt(0).toUpperCase() + operationType.slice(1)}`;
            const opRadioToEnsure = document.getElementById(opRadioIdToEnsure);
            if (opRadioToEnsure) opRadioToEnsure.checked = true;
        }

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
    initializeGallery(); // Initialize gallery with (potentially loaded) collectedCreatures
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    answerEl.focus();
}

if (mainMenuBtnEl) {
    mainMenuBtnEl.addEventListener('click', goToMainMenu);
}

function goToMainMenu() {
    savePlayerData(); // Save current player's data before going to main menu

    gameAndStickersContainerEl.style.display = 'none';
    startMenuEl.style.display = 'flex';

    correctAnswers = 0;
    questionsAsked = 0;
    totalStickersPlaced = 0;
    availableStickerCredits = 0;
    collectedCreatures = {}; // Reset in-memory collection for next player

    correctCountEl.textContent = correctAnswers;
    questionsAskedEl.textContent = questionsAsked;
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    answerEl.value = '';
    answerEl.disabled = false;
    document.getElementById('submitAnswerBtn').disabled = false;

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
    document.getElementById('grade3').checked = true;
    document.getElementById('opMultiply').checked = true;
    document.getElementById('themeRainbow').checked = true;
    applyTheme("rainbow"); // Apply default visual theme (doesn't save "Player" data)
    difficultyLevel = 3;
    operationType = "multiplication";
    updateOperationVisibility();

    playerName = "Player"; // Reset global playerName

    playerNameInputEl.focus();
}

// --- Gallery Functions ---
function buildAllCreatureMetaData() {
    allCreatureMetaData = [];
    let creatureIdCounter = 1;

    animalImageFiles.forEach(animal => {
        allCreatureMetaData.push({
            id_num: creatureIdCounter++,
            name: animal.name,
            imageSrc: animal.baseImagePath
        });
    });

    const galleryAddedMergedNames = new Set(animalImageFiles.map(a => a.name));
    if (typeof mergeRecipes !== 'undefined') { // Check if mergeRecipes is loaded
        const sortedMergeRecipesForGallery = [...mergeRecipes].sort((a,b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            return a.resultName.localeCompare(b.resultName);
        });

        sortedMergeRecipesForGallery.forEach(recipe => {
            if (!galleryAddedMergedNames.has(recipe.resultName)) {
                if (creatureIdCounter <= gallerySlotsCount) {
                     allCreatureMetaData.push({
                        id_num: creatureIdCounter++,
                        name: recipe.resultName,
                        imageSrc: `images/merged_animals/${recipe.resultImage}`
                    });
                    galleryAddedMergedNames.add(recipe.resultName);
                }
            }
        });
    }
    // Ensure allCreatureMetaData has exactly gallerySlotsCount items, pad if necessary
    while(allCreatureMetaData.length < gallerySlotsCount) {
        allCreatureMetaData.push({
            id_num: creatureIdCounter++,
            name: `Future Creature ${creatureIdCounter-1}`, // Placeholder name
            imageSrc: placeholderImagePath // Use placeholder for unassigned slots
        });
    }
    // console.log("All Creature MetaData for Gallery:", allCreatureMetaData.length, allCreatureMetaData);
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
        } else { // Should not happen if buildAllCreatureMetaData pads correctly
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

    if (!collectedCreatures[creatureName]) { // Only save and update UI if newly collected
        collectedCreatures[creatureName] = true;
        savePlayerData(); // Save progress
    }

    const creatureMeta = allCreatureMetaData.find(c => c.name === creatureName);
    if (!creatureMeta) return;

    const slot = animalGalleryEl.querySelector(`.gallery-slot[data-creature-name="${creatureName}"]`);
    if (slot && !slot.classList.contains('unlocked')) { // Update UI only if not already showing image
        slot.innerHTML = '';
        const img = document.createElement('img');
        img.src = creatureMeta.imageSrc;
        img.alt = creatureMeta.name;
        slot.appendChild(img);
        slot.classList.add('unlocked');
    }
}


// --- Core Game Logic ---
// generateProblem, generateCountingProblem, generateArithmeticProblem functions remain the same

function generateProblem() {
    problemVisualsEl.innerHTML = ''; 
    problemTextDisplayEl.textContent = ''; 

    if (difficultyLevel === 1) { 
        generateCountingProblem();
    } else { 
        generateArithmeticProblem();
    }
    answerEl.value = '';
}

function generateCountingProblem() {
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

    switch (operationType) {
        case "addition":
            operatorSymbol = '+';
            switch (difficultyLevel) {
                case 2: n1 = Math.floor(Math.random() * 21); n2 = Math.floor(Math.random() * 11); break; 
                case 3: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; break; 
                case 4: n1 = Math.floor(Math.random() * 401) + 100; n2 = Math.floor(Math.random() * 401) + 100; break; 
                case 5: n1 = Math.floor(Math.random() * 900) + 100; n2 = Math.floor(Math.random() * 900) + 100; break; 
                default: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; break;
            }
            answer = n1 + n2;
            break;
        case "subtraction":
            operatorSymbol = '−';
            switch (difficultyLevel) {
                case 2: n1 = Math.floor(Math.random() * 19) + 1; n2 = Math.floor(Math.random() * (n1 + 1)); break;
                case 3: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * n1); break;
                case 4: n1 = Math.floor(Math.random() * 900) + 100; n2 = Math.floor(Math.random() * n1); break;
                case 5: n1 = Math.floor(Math.random() * 9900) + 100; n2 = Math.floor(Math.random() * n1); break;
                default: n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * n1); break;
            }
            answer = n1 - n2;
            break;
        case "division": 
            operatorSymbol = '÷';
            let quotient;
            switch (difficultyLevel) {
                case 3: 
                    n2 = Math.floor(Math.random() * 8) + 2; 
                    quotient = Math.floor(Math.random() * 8) + 2; 
                    n1 = n2 * quotient;
                    break;
                case 4: 
                    n2 = Math.floor(Math.random() * 11) + 2; 
                    quotient = Math.floor(Math.random() * 11) + 2; 
                    n1 = n2 * quotient;
                    break;
                case 5: 
                    n2 = Math.floor(Math.random() * 11) + 2;  
                    quotient = Math.floor(Math.random() * 19) + 2; 
                    n1 = n2 * quotient;
                    break;
                default: 
                    n2 = Math.floor(Math.random() * 8) + 2; quotient = Math.floor(Math.random() * 8) + 2; n1 = n2 * quotient; break;
            }
            if (n2 === 0) { generateProblem(); return; } 
            answer = quotient;
            break;
        case "multiplication":
        default: 
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
                default: n1 = Math.floor(Math.random() * 10) + 1; n2 = Math.floor(Math.random() * 10) + 1; break;
            }
            answer = n1 * n2;
            break;
    }
    num1 = n1; num2 = n2; 
    correctAnswerValue = answer;
    problemTextDisplayEl.textContent = `${n1} ${operatorSymbol} ${n2} = ?`;
}

function updateStickerSectionStatus() {
    // Now always assumes animal rewards if credits > 0
    if (availableStickerCredits > 0) {
        stickerSectionEl.classList.remove('hidden');
        stickerHeaderEl.textContent = stickerHeaderEl.textContent.includes("Pick an animal") ? stickerHeaderEl.textContent : "🎉 Pick your reward! 🐾";
        stickerPromptEl.textContent = stickerPromptEl.textContent.includes("Drag an animal") ? stickerPromptEl.textContent : "Drag an animal to your reward board.";
        
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
    stickerHeaderEl.textContent = "🎉 Yay! Pick an animal friend! 🐾";
    stickerPromptEl.textContent = "Drag an animal to your reward board.";
    populateAnimalChoices();
    stickerSectionEl.classList.remove('hidden');
    updateScrollButtonStates();
}

function checkAnswer() {
    const userAnswer = parseInt(answerEl.value);
    questionsAsked++;

    if (!isNaN(userAnswer)) {
        if (userAnswer === correctAnswerValue) {
            feedbackEl.textContent = "🌟 Correct! 🌟"; 
            feedbackEl.className = 'correct'; 
            correctAnswers++;
            triggerAnimalReward(); // ALL MODES now trigger an animal reward

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
    if (event.key === 'Enter') {
        event.preventDefault();
        checkAnswer();
    }
});

// populateWordStickers() is REMOVED

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
        if (availableStickerCredits <= 0) {
            opt.classList.add('disabled-drag');
        } else {
            opt.classList.remove('disabled-drag');
        }
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
        finalMessage += ` You discovered ${collectedCount} creature(s) in your collection!`;
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

// --- Drag and Drop Logic for items FROM THE REWARD LIST (#sticker-list) ---
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
    } catch (error) { /* Failsafe */ }
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

function handleDropOnBoardOrZoo(pageX, pageY) { // Zoo functionality is removed
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

    const isAnimalBaseElement = true; // All rewards from list are animals
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
        // The draggedStickerElement (img) already has its dataset.animalType
        wrapperDiv.appendChild(draggedStickerElement.cloneNode(true)); // Place a clone of the img from list
        let elementToPlaceOnBoard = wrapperDiv;

        elementToPlaceOnBoard.style.position = 'absolute';
        elementToPlaceOnBoard.style.left = (stickerTopLeftXonPage - boardRect.left) + 'px';
        elementToPlaceOnBoard.style.top = (stickerTopLeftYonPage - boardRect.top) + 'px';

        stickerBoardEl.appendChild(elementToPlaceOnBoard);
        makePlacedStickerInteractive(elementToPlaceOnBoard, stickerBoardEl);

        totalStickersPlaced++;
        availableStickerCredits--;
        updateStickerSectionStatus();

        // --- Unlock in Gallery for base animal ---
        if (animalTypeOfPlacedItem) { 
            unlockInGallery(animalTypeOfPlacedItem);
        }

        let anyMergeHappenedThisTurn = false;
        let aMergeOccurredInLoop;
        let iterations = 0;
        const maxIterations = 10; 
        do {
            if (typeof checkForMerges === 'function') {
                const mergeResultName = checkForMerges(); 
                if (mergeResultName) {
                    anyMergeHappenedThisTurn = true;
                    aMergeOccurredInLoop = true;
                    unlockInGallery(mergeResultName); 
                } else {
                    aMergeOccurredInLoop = false;
                }
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
    let originalParentForSnapback, originalLeftForSnapback, originalTopForSnapback;

    function startDrag(e) {
        // No dragging from gallery items
        isDraggingPlaced = true;
        itemDraggedFromMainBoard = sticker;

        const clientX = e.clientX || e.targetTouches[0].clientX;
        const clientY = e.clientY || e.targetTouches[0].clientY;
        
        originalParentForSnapback = sticker.parentElement;
        originalLeftForSnapback = sticker.style.left;
        originalTopForSnapback = sticker.style.top;

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
        
        // Item should be placed back onto the stickerBoardEl
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
        
        // After re-placing on board, check for merges again
        const isAnimalWrapper = itemThatWasDragged.classList.contains('placed-animal'); // Includes base and merged
        if (isAnimalWrapper) { 
            let aMergeOccurredInLoop;
            let iterations = 0;
            const maxIterations = 10;
            do {
                if (typeof checkForMerges === 'function') {
                    const mergeResultName = checkForMerges();
                    if (mergeResultName) {
                        aMergeOccurredInLoop = true;
                        unlockInGallery(mergeResultName); 
                    } else { aMergeOccurredInLoop = false; }
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
    if (!isScrollable) {
        stickerListScrollUpBtn.disabled = true;
        stickerListScrollDownBtn.disabled = true;
        return;
    }
    stickerListScrollUpBtn.disabled = stickerListEl.scrollTop <= 0;
    stickerListScrollDownBtn.disabled = stickerListEl.scrollTop + stickerListEl.clientHeight >= stickerListEl.scrollHeight -1;
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    applyTheme(currentTheme);
    updateOperationVisibility();
    updateScrollButtonStates();
    // Gallery is initialized when initializeGame() is called after start.
    // No direct call to initializeZoo() as zoo feature was removed.
});