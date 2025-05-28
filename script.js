// script.js

let playerName = "Player";
let difficultyLevel = 3;
let operationType = "multiplication";
let currentTheme = "rainbow";

let num1, num2, correctAnswerValue;
let displayedShapesCount;

let correctAnswers = 0;
let questionsAsked = 0;
let totalStickersPlaced = 0; 
let availableStickerCredits = 0; 

const gameLength = 1000;
const totalAnimalChoices = 5; 

let itemDraggedFromMainBoard = null;
let draggedStickerElement = null;
let stickerGhost = null;
let dragOffsetX, dragOffsetY;

const animalImageFiles = [
    { src: "cat.png", name: "Cat", alt: "a Cute Cat" },
    { src: "dog.png", name: "Dog", alt: "a Happy Dog" },
    { src: "bear.png", name: "Bear", alt: "a Friendly Bear" },
    { src: "lion.png", name: "Lion", alt: "a Brave Lion" },
    { src: "panda.png", name: "Panda", alt: "a Playful Panda" }
];
// mergeRecipes and checkForMerges are defined in merge.js

// --- DOM Element References (Core Game & Zoo Gallery) ---
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

const viewZooBtnEl = document.getElementById('viewZooBtn');
const zooGalleryOverlayEl = document.getElementById('zoo-gallery-overlay');
const zooGalleryGridEl = document.getElementById('zoo-gallery-grid');
const closeZooGalleryBtnEl = document.getElementById('closeZooGalleryBtn');
let zooGalleryPopulated = false;

console.log("script.js: Global variables and DOM references initialized.");

// --- Function to check if a sticker can be dragged from the reward list ---
function canDragSticker() {
    console.log("canDragSticker called. Credits:", availableStickerCredits);
    return availableStickerCredits > 0;
}

// --- Theme Application ---
function applyTheme(themeName) {
    console.log("applyTheme called with theme:", themeName);
    document.body.className = '';
    document.body.classList.add(themeName + '-theme');
    currentTheme = themeName;
}

// --- Start Menu Logic ---
function updateOperationVisibility() {
    console.log("updateOperationVisibility called.");
    const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    if (selectedDifficultyRadio && parseInt(selectedDifficultyRadio.value) === 1) { // Preschool selected
        operationSelectionEl.style.display = 'none';
    } else {
        operationSelectionEl.style.display = 'block';
    }
}

difficultyRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        console.log("Difficulty radio changed to:", event.target.value);
        updateOperationVisibility();
    });
});

startGameBtnEl.addEventListener('click', () => {
    console.log("startGameBtn clicked.");
    const nameInputValue = playerNameInputEl.value.trim();
    if (nameInputValue) {
        playerName = nameInputValue;
        nameErrorEl.style.display = 'none';
        console.log("Player name set to:", playerName);

        const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
        difficultyLevel = selectedDifficultyRadio ? parseInt(selectedDifficultyRadio.value) : 3;
        console.log("Difficulty level set to:", difficultyLevel);
        
        if (difficultyLevel === 1) { 
            operationType = "counting";
        } else {
            const selectedOperationRadio = document.querySelector('input[name="operation"]:checked');
            operationType = selectedOperationRadio ? selectedOperationRadio.value : "multiplication";
        }
        console.log("Operation type set to:", operationType);

        const selectedThemeRadio = document.querySelector('input[name="theme"]:checked');
        const themeToApply = selectedThemeRadio ? selectedThemeRadio.value : "rainbow";
        applyTheme(themeToApply);
        console.log("Theme applied:", themeToApply);

        startMenuEl.style.display = 'none';
        gameAndStickersContainerEl.style.display = 'flex';
        console.log("Start menu hidden, game container shown.");
        initializeGame();
    } else {
        nameErrorEl.style.display = 'block';
        playerNameInputEl.focus();
        console.log("Player name input empty, error shown.");
    }
});

playerNameInputEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        console.log("Enter key pressed in playerNameInput.");
        event.preventDefault();
        startGameBtnEl.click();
    }
});

function initializeGame() {
    console.log("initializeGame called.");
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
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    if (zooGalleryOverlayEl) zooGalleryOverlayEl.classList.remove('visible');
    document.body.classList.remove('zoo-gallery-open');
    answerEl.focus();
    console.log("Game initialized, first problem generated, focus on answer.");
}

if (mainMenuBtnEl) {
    mainMenuBtnEl.addEventListener('click', () => {
        console.log("mainMenuBtn clicked.");
        goToMainMenu();
    });
}

function goToMainMenu() {
    console.log("goToMainMenu called.");
    gameAndStickersContainerEl.style.display = 'none';
    startMenuEl.style.display = 'flex';

    correctAnswers = 0;
    questionsAsked = 0;
    totalStickersPlaced = 0;
    availableStickerCredits = 0;
    console.log("Game state variables reset.");
    
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
    
    if (zooGalleryOverlayEl) { 
        zooGalleryOverlayEl.classList.remove('visible');
        document.body.classList.remove('zoo-gallery-open');
        console.log("Zoo gallery hidden.");
    }
            
    playerNameInputEl.value = "";
    document.getElementById('grade3').checked = true;
    document.getElementById('opMultiply').checked = true;
    document.getElementById('themeRainbow').checked = true;
    applyTheme("rainbow");
    difficultyLevel = 3;
    operationType = "multiplication";
    updateOperationVisibility();
    console.log("Start menu options reset to default.");

    playerNameInputEl.focus();
}

// --- Zoo Gallery Logic ---
function populateZooGallery() {
    console.log("populateZooGallery() called. Populated flag:", zooGalleryPopulated); 
    // if (zooGalleryPopulated && zooGalleryGridEl.children.length > 0) {
    //     console.log("Zoo gallery already populated with items, returning."); 
    //     return; 
    // }

    if (!zooGalleryGridEl) {
        console.error("CRITICAL: zooGalleryGridEl is not found in populateZooGallery!"); 
        return;
    }
    zooGalleryGridEl.innerHTML = ''; 
    console.log("Zoo gallery grid cleared for population."); 

    const allCreatures = [];
    const addedCreatureNames = new Set(); 

    console.log("Adding base animals to gallery list..."); 
    animalImageFiles.forEach(animal => {
        if (!addedCreatureNames.has(animal.name)) {
            allCreatures.push({
                name: animal.name,
                imageSrc: `images/animals/${animal.src}`,
                alt: animal.alt || animal.name,
                baseCount: 1 
            });
            addedCreatureNames.add(animal.name);
        }
    });
    console.log(`Added ${animalImageFiles.length} potential base animals. Unique so far: ${allCreatures.length}`); 

    if (typeof mergeRecipes !== 'undefined' && mergeRecipes) { 
        console.log(`Adding merged animals from ${mergeRecipes.length} recipes...`); 
        mergeRecipes.forEach(recipe => {
            if (!addedCreatureNames.has(recipe.resultName)) {
                allCreatures.push({
                    name: recipe.resultName,
                    imageSrc: `images/merged_animals/${recipe.resultImage}`,
                    alt: recipe.resultName,
                    baseCount: recipe.baseCount 
                });
                addedCreatureNames.add(recipe.resultName);
            }
        });
    } else {
        console.warn("mergeRecipes is not defined or empty in populateZooGallery!"); 
    }
    console.log("Total unique creatures to display in gallery:", allCreatures.length); 

    allCreatures.sort((a,b) => {
        if ((a.baseCount || 0) !== (b.baseCount || 0)) { 
            return (a.baseCount || 0) - (b.baseCount || 0); 
        }
        return a.name.localeCompare(b.name); 
    });

    if (allCreatures.length === 0) {
        console.warn("No creatures to display in the zoo gallery!");
        zooGalleryGridEl.textContent = "No creatures in the collection yet (or images missing/recipes not loaded).";
    }

    allCreatures.forEach(creature => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('zoo-gallery-item');

        const img = document.createElement('img');
        img.src = creature.imageSrc;
        img.alt = creature.alt;
        img.title = creature.name; 
        img.onerror = function() {
            console.error(`Failed to load gallery image: ${this.src}`);
            this.alt = `Error: ${creature.name}`;
            itemDiv.innerHTML = `<span>${creature.name}<br>(Image Missing)</span>`;
        };

        const nameSpan = document.createElement('span');
        nameSpan.textContent = creature.name;

        itemDiv.appendChild(img);
        itemDiv.appendChild(nameSpan);
        zooGalleryGridEl.appendChild(itemDiv);
    });
    console.log("All creatures added to zoo gallery grid. Items in grid:", zooGalleryGridEl.children.length); 
    zooGalleryPopulated = true; 
}

if (viewZooBtnEl) {
    viewZooBtnEl.addEventListener('click', () => {
        console.log("View Collection (Zoo Gallery) button clicked."); 
        if (typeof populateZooGallery === 'function') {
            console.log("Calling populateZooGallery()."); 
            populateZooGallery(); 
        } else {
            console.error("populateZooGallery function is not defined!"); 
        }

        if (zooGalleryOverlayEl) {
            console.log("Attempting to make zoo gallery overlay visible.");
            zooGalleryOverlayEl.classList.remove('hidden'); 
            zooGalleryOverlayEl.classList.add('visible');   
            console.log("Zoo gallery overlay classList:", zooGalleryOverlayEl.classList); 
            document.body.classList.add('zoo-gallery-open'); 
        } else {
            console.error("zooGalleryOverlayEl is not defined when trying to show!"); 
        }
    });
} else {
    console.error("viewZooBtnEl not found! Cannot attach listener."); 
}

function hideZooGallery() { // Renamed for clarity
    console.log("hideZooGallery called.");
    if (zooGalleryOverlayEl) {
        zooGalleryOverlayEl.classList.remove('visible');
        // To ensure it's fully hidden if CSS relies on .hidden for display:none after transition
        // setTimeout(() => { 
        //     if (!zooGalleryOverlayEl.classList.contains('visible')) zooGalleryOverlayEl.classList.add('hidden');
        // }, 300); // Match transition duration
    }
    document.body.classList.remove('zoo-gallery-open');
}

if (closeZooGalleryBtnEl) {
    closeZooGalleryBtnEl.addEventListener('click', () => {
        console.log("Close Zoo Gallery button clicked."); 
        hideZooGallery();
    });
} else {
    console.error("closeZooGalleryBtnEl not found! Cannot attach listener."); 
}

if (zooGalleryOverlayEl) {
    zooGalleryOverlayEl.addEventListener('click', (event) => {
        if (event.target === zooGalleryOverlayEl) { 
            console.log("Clicked on Zoo Gallery overlay background to close."); 
            hideZooGallery();
        }
    });
} else {
    console.error("zooGalleryOverlayEl not found for background click listener!"); 
}


// --- Core Game Logic Functions ---
function generateProblem() {
    console.log("generateProblem called. Difficulty:", difficultyLevel, "Operation:", operationType);
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
    console.log("generateCountingProblem called.");
    problemTextDisplayEl.textContent = "How many shapes can you count?";
    const numShapesToDisplay = Math.floor(Math.random() * 10) + 1; 
    correctAnswerValue = numShapesToDisplay;

    const shapesEmojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '🔺', '▪️', '🔶', '❤️', '💜', '🧡'];
    const selectedShapeEmoji = shapesEmojis[Math.floor(Math.random() * shapesEmojis.length)];
    console.log("Counting problem: Displaying", numShapesToDisplay, "of", selectedShapeEmoji);

    for (let i = 0; i < numShapesToDisplay; i++) {
        const shapeSpan = document.createElement('span');
        shapeSpan.textContent = selectedShapeEmoji;
        shapeSpan.classList.add('shape'); 
        problemVisualsEl.appendChild(shapeSpan);
    }
}

function generateArithmeticProblem() {
    console.log("generateArithmeticProblem called.");
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
            if (n2 === 0) { console.warn("Division by zero avoided, regenerating problem."); generateProblem(); return; } 
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
    console.log(`Arithmetic problem: ${n1} ${operatorSymbol} ${n2} = ${answer}`);
}


function updateStickerSectionStatus() {
    console.log("updateStickerSectionStatus called. Credits:", availableStickerCredits, "Difficulty:", difficultyLevel);
    if (availableStickerCredits > 0) {
        stickerSectionEl.classList.remove('hidden');
        // Header and prompt are set by triggerAnimalReward
        if (stickerListEl.children.length === 0) { 
            console.log("Sticker list empty, populating animal choices.");
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
    console.log("triggerAnimalReward called.");
    availableStickerCredits = 1;
    stickerHeaderEl.textContent = "🎉 Yay! Pick an animal friend! 🐾";
    stickerPromptEl.textContent = "Drag an animal to your reward board.";
    populateAnimalChoices(); 
    stickerSectionEl.classList.remove('hidden');
    updateScrollButtonStates();
}

function checkAnswer() {
    console.log("checkAnswer called.");
    const userAnswer = parseInt(answerEl.value);
    questionsAsked++;
    console.log("User answer:", userAnswer, "Correct answer:", correctAnswerValue);

    if (!isNaN(userAnswer)) {
        if (userAnswer === correctAnswerValue) {
            feedbackEl.textContent = "🌟 Correct! 🌟"; 
            feedbackEl.className = 'correct'; 
            correctAnswers++;
            console.log("Answer correct. Total correct:", correctAnswers);
            triggerAnimalReward(); 
        } else {
            feedbackEl.textContent = `🤔 Almost! The correct answer was ${correctAnswerValue}.`;
            feedbackEl.className = 'incorrect'; 
            console.log("Answer incorrect.");
        }
    } else {
         feedbackEl.textContent = `Please enter a number.`;
         feedbackEl.className = 'incorrect'; 
         questionsAsked--;
         console.log("Invalid input, not a number.");
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
        console.log("Enter key pressed in answer input.");
        event.preventDefault();
        checkAnswer();
    }
});

function populateAnimalChoices() {
    console.log("populateAnimalChoices called.");
    stickerListEl.innerHTML = ''; 
    for (let i = 0; i < totalAnimalChoices; i++) {
        const animalData = animalImageFiles[i % animalImageFiles.length];
        const animalImgEl = document.createElement('img');
        animalImgEl.src = `images/animals/${animalData.src}`; 
        animalImgEl.alt = animalData.alt; 
        animalImgEl.dataset.animalType = animalData.name; 
        animalImgEl.classList.add('sticker-option'); 

        animalImgEl.draggable = true;
        animalImgEl.addEventListener('dragstart', handleDragStartMouse);
        animalImgEl.addEventListener('touchstart', handleDragStartTouch, { passive: false });
        stickerListEl.appendChild(animalImgEl);
    }
    console.log("Animal choices populated in reward list.");
    updateDragDisabledState(); 
    updateScrollButtonStates();
}

function updateDragDisabledState() {
    console.log("updateDragDisabledState called. Credits:", availableStickerCredits);
     document.querySelectorAll('#sticker-list .sticker-option').forEach(opt => {
        if (availableStickerCredits <= 0) {
            opt.classList.add('disabled-drag');
        } else {
            opt.classList.remove('disabled-drag');
        }
    });
}

function endGame() {
    console.log("endGame called.");
    problemTextDisplayEl.textContent = "Game Over!";
    problemVisualsEl.innerHTML = '';
    answerEl.disabled = true;
    document.getElementById('submitAnswerBtn').disabled = true;

    let finalMessage = ` You got ${correctAnswers} out of ${questionsAsked} correct.`; 
    if (totalStickersPlaced > 0) { 
        finalMessage += ` You collected ${totalStickersPlaced} animal(s)/creation(s) on your board!`;
    }
    if (typeof zooGalleryGridEl !== 'undefined' && zooGalleryGridEl && zooGalleryGridEl.children.length > 0) { 
        finalMessage += ` You have ${zooGalleryGridEl.children.length} unique creature(s) in your Collection!`;
    }

    if (totalStickersPlaced === 0 && (typeof zooGalleryGridEl === 'undefined' || !zooGalleryGridEl || zooGalleryGridEl.children.length === 0) && correctAnswers > 0) {
         finalMessage += " Keep practicing to collect animals!";
    } else if (correctAnswers === 0 && totalStickersPlaced === 0 && (typeof zooGalleryGridEl === 'undefined' || !zooGalleryGridEl || zooGalleryGridEl.children.length === 0)) {
        finalMessage = " Keep practicing!";
    }
    feedbackEl.innerHTML = `🎉 Game Over, ${playerName}! ${finalMessage} 🎉`; 
    feedbackEl.className = ''; 

     updateStickerSectionStatus(); 
     if(availableStickerCredits > 0 && stickerSectionEl.classList.contains('hidden')){
         stickerSectionEl.classList.remove('hidden');
     }
     console.log("Game over message displayed.");
}


// --- Drag and Drop Logic for items FROM THE REWARD LIST (#sticker-list) ---
function handleDragStartMouse(e) {
    console.log("handleDragStartMouse called for (reward list):", e.target); 
    if (!canDragSticker()) { 
        console.log("Drag from list not allowed (no credits)"); 
        e.preventDefault(); 
        return; 
    }
    draggedStickerElement = e.target.cloneNode(true); 
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    console.log("draggedStickerElement (mouse from list):", draggedStickerElement); 

    const rect = e.target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    console.log("dragOffsetX/Y (mouse from list):", dragOffsetX, dragOffsetY); 

    try {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.dataTransfer.setData('text/plain', e.target.alt || e.target.textContent); 
    } catch (error) { console.error("DataTransfer error:", error); }
}

function handleDragStartTouch(e) {
    console.log("handleDragStartTouch called for (reward list):", e.target); 
    if (!canDragSticker()) { 
        console.log("Drag from list not allowed (no credits)"); 
        return; 
    }
    e.preventDefault();

    const touch = e.targetTouches[0];
    const originalListItem = e.target; 

    stickerGhost = originalListItem.cloneNode(true); 
    stickerGhost.classList.remove('sticker-option', 'disabled-drag');
    stickerGhost.classList.add('sticker-ghost'); 
    console.log("Sticker ghost created for list item"); 
    
    stickerGhost.style.width = originalListItem.offsetWidth + 'px';
    stickerGhost.style.height = originalListItem.offsetHeight + 'px';

    const rect = originalListItem.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    console.log("dragOffsetX/Y (touch from list):", dragOffsetX, dragOffsetY); 
    
    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
    document.body.appendChild(stickerGhost);

    draggedStickerElement = originalListItem.cloneNode(true); 
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    console.log("draggedStickerElement (touch from list):", draggedStickerElement); 

    document.addEventListener('touchmove', handleDragMoveTouch, { passive: false });
    document.addEventListener('touchend', handleDragEndTouchRewardList);
}

function handleDragMoveTouch(e) {
    // console.log("handleDragMoveTouch called"); // Can be very noisy
    e.preventDefault();
    if (!stickerGhost) return;
    const touch = e.targetTouches[0];
    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
}

function handleDropNewItem(pageX, pageY) { 
    console.log("handleDropNewItem called with pageX/Y:", pageX, pageY); 
    if (!draggedStickerElement) {
        console.log("handleDropNewItem: no draggedStickerElement."); 
        return; 
    }
    
    console.log("handleDropNewItem: attempting to place on board with draggedStickerElement:", draggedStickerElement); 
    placeStickerOnBoard(pageX, pageY); 

    if (draggedStickerElement) { 
        console.warn("draggedStickerElement was not cleared by placeStickerOnBoard, clearing now in handleDropNewItem."); 
        draggedStickerElement = null;
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
    console.log("stickerBoard drop event triggered."); 
    e.preventDefault();
    stickerBoardEl.classList.remove('board-drop-target-active');
    if (draggedStickerElement) { 
        console.log("Board Drop: Attempting to place new item from reward list:", draggedStickerElement); 
        placeStickerOnBoard(e.clientX, e.clientY);
    } else if (itemDraggedFromMainBoard) {
        console.log("Board Drop: itemDraggedFromMainBoard is set. Its endDrag should handle re-placement."); 
    } else {
        console.log("Board Drop: Neither draggedStickerElement nor itemDraggedFromMainBoard is set."); 
    }
});

function handleDragEndTouchRewardList(e) { 
    console.log("handleDragEndTouchRewardList called"); 
    const touch = e.changedTouches[0];
    if (draggedStickerElement && touch) { 
         console.log("TouchEnd (RewardList): Calling handleDropNewItem"); 
         handleDropNewItem(touch.clientX, touch.clientY);
    } else {
        console.log("TouchEnd (RewardList): no draggedStickerElement or no touch info."); 
    }
    
    if (stickerGhost && stickerGhost.parentNode) {
        stickerGhost.parentNode.removeChild(stickerGhost);
        stickerGhost = null;
        console.log("Sticker ghost removed (TouchEnd RewardList)"); 
    }
    if (draggedStickerElement) { 
        console.warn("draggedStickerElement was not cleared by drop handler, clearing now in handleDragEndTouchRewardList."); 
        draggedStickerElement = null; 
    }
    
    document.removeEventListener('touchmove', handleDragMoveTouch);
    document.removeEventListener('touchend', handleDragEndTouchRewardList);
}


function placeStickerOnBoard(pageX, pageY) {
    console.log("placeStickerOnBoard called. PageX/Y:", pageX, pageY, "Current draggedStickerElement:", draggedStickerElement); 
    if (!draggedStickerElement) {
        console.error("placeStickerOnBoard: Aborting, draggedStickerElement is null!"); 
        return; 
    }

    const boardRect = stickerBoardEl.getBoundingClientRect();
    console.log("Board Rect for placement:", boardRect); 

    if (typeof dragOffsetX === 'undefined' || typeof dragOffsetY === 'undefined') {
        console.error("dragOffsetX/Y are undefined in placeStickerOnBoard. Drag start might have failed."); 
        dragOffsetX = (draggedStickerElement.offsetWidth || 55) / 2; 
        dragOffsetY = (draggedStickerElement.offsetHeight || 55) / 2;
        console.warn("Using fallback dragOffsetX/Y for placeStickerOnBoard:", dragOffsetX, dragOffsetY); 
    }

    const stickerTopLeftXonPage = pageX - dragOffsetX; 
    const stickerTopLeftYonPage = pageY - dragOffsetY;
    console.log("Calculated stickerTopLeftX/Y on Page for new item:", stickerTopLeftXonPage, stickerTopLeftYonPage); 
    
    const itemIdentifier = draggedStickerElement.alt || "a new friend";
    const animalTypeOfPlacedItem = draggedStickerElement.dataset.animalType; 

    const placedItemDisplayWidth = 60; 
    const placedItemDisplayHeight = 60;
    console.log("Using dimensions for boundary check:", placedItemDisplayWidth, "x", placedItemDisplayHeight); 

    const itemCenterXonPage = stickerTopLeftXonPage + placedItemDisplayWidth / 2;
    const itemCenterYonPage = stickerTopLeftYonPage + placedItemDisplayHeight / 2;
    console.log("Calculated itemCenterX/Y on Page for boundary check:", itemCenterXonPage, itemCenterYonPage); 

    if (itemCenterXonPage >= boardRect.left && itemCenterXonPage <= boardRect.right &&
        itemCenterYonPage >= boardRect.top && itemCenterYonPage <= boardRect.bottom) {
        console.log("Item IS within board bounds. Proceeding with placement."); 

        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('placed-animal');
        if (animalTypeOfPlacedItem && !draggedStickerElement.dataset.animalType) { 
            draggedStickerElement.dataset.animalType = animalTypeOfPlacedItem;
        }
        wrapperDiv.appendChild(draggedStickerElement); 
        let elementToPlaceOnBoard = wrapperDiv;

        elementToPlaceOnBoard.style.position = 'absolute'; 
        elementToPlaceOnBoard.style.left = (stickerTopLeftXonPage - boardRect.left) + 'px';
        elementToPlaceOnBoard.style.top = (stickerTopLeftYonPage - boardRect.top) + 'px';
        console.log("Calculated final left/top on board for new item:", elementToPlaceOnBoard.style.left, elementToPlaceOnBoard.style.top); 

        stickerBoardEl.appendChild(elementToPlaceOnBoard);
        console.log("New item wrapper appended to stickerBoardEl."); 
        makePlacedStickerInteractive(elementToPlaceOnBoard, stickerBoardEl); 

        totalStickersPlaced++;
        availableStickerCredits--; 
        updateStickerSectionStatus(); 
        console.log("Counts updated. availableStickerCredits:", availableStickerCredits); 

        let anyMergeHappenedThisTurn = false; 
        let aMergeOccurredInLoop;
        let iterations = 0; 
        const maxIterations = 10; 
        console.log("Checking for merges after new item placement..."); 
        do {
            if (typeof checkForMerges === 'function') { 
                aMergeOccurredInLoop = checkForMerges(); 
                if (aMergeOccurredInLoop) {
                    anyMergeHappenedThisTurn = true;
                    console.log("A merge occurred in loop!"); 
                }
            } else {
                console.warn("checkForMerges function not found!"); 
                aMergeOccurredInLoop = false; 
            }
            iterations++;
        } while (aMergeOccurredInLoop && iterations < maxIterations); 
        if (iterations >= maxIterations) console.warn("Merge check loop hit max iterations."); 
        

        if (!anyMergeHappenedThisTurn) { 
            console.log("No merge happened, showing 'collected animal' message."); 
            if (personalizedMessageTimeout) { clearTimeout(personalizedMessageTimeout); }
            let personalizedTextToShow = `Great job, ${playerName}! You collected ${itemIdentifier}! 🥳`;
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
        console.log("placeStickerOnBoard successful for new item, draggedStickerElement cleared."); 
    } else {
        console.warn("New item dropped OUTSIDE board bounds. Not placed."); 
        console.log("Drop Coords (Center):", itemCenterXonPage, itemCenterYonPage); 
        console.log("Board LTRB:", boardRect.left, boardRect.right, boardRect.top, boardRect.bottom); 
        draggedStickerElement = null; 
    }
}


// --- MODIFIED makePlacedStickerInteractive ---
// For dragging items ALREADY ON THE STICKER BOARD
function makePlacedStickerInteractive(sticker, container) { 
    console.log("makePlacedStickerInteractive called for:", sticker);
    let isDraggingPlaced = false;
    let interactionPointOffsetX, interactionPointOffsetY;
    
    function startDrag(e) {
        // No Zoo check needed
        console.log("makePlacedStickerInteractive: startDrag on", sticker); 
        isDraggingPlaced = true;
        itemDraggedFromMainBoard = sticker; 

        const clientX = e.clientX || e.targetTouches[0].clientX;
        const clientY = e.clientY || e.targetTouches[0].clientY;
        
        const stickerRectPage = sticker.getBoundingClientRect();
        interactionPointOffsetX = clientX - stickerRectPage.left;
        interactionPointOffsetY = clientY - stickerRectPage.top;

        document.body.appendChild(sticker);
        sticker.style.position = 'absolute'; 
        sticker.style.left = stickerRectPage.left + 'px'; 
        sticker.style.top = stickerRectPage.top + 'px';
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
        console.log("makePlacedStickerInteractive: endDrag for item from board:", itemDraggedFromMainBoard); 
        if (!isDraggingPlaced) return;
        
        const itemThatWasDragged = itemDraggedFromMainBoard; 
        isDraggingPlaced = false; 
        
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
        
        if (itemThatWasDragged) { 
            console.log("endDrag: Repositioning item on stickerBoardEl:", itemThatWasDragged); 
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
                console.log("Item re-appended to stickerBoardEl from body."); 
            } else {
                console.log("Item already child of stickerBoardEl, position updated on board."); 
            }
            
            const isDraggableAnimalItem = itemThatWasDragged.classList.contains('placed-animal');
            if (isDraggableAnimalItem) {
                console.log("endDrag: Re-checking merges after moving item on board."); 
                let aMergeOccurredInLoop;
                let iterations = 0;
                const maxIterations = 10; 
                do {
                    if (typeof checkForMerges === 'function') {
                        aMergeOccurredInLoop = checkForMerges();
                        if(aMergeOccurredInLoop) console.log("Merge occurred after board item move."); 
                    } else { aMergeOccurredInLoop = false; }
                    iterations++;
                } while (aMergeOccurredInLoop && iterations < maxIterations);
            }
        }
        itemDraggedFromMainBoard = null; // Clear the global flag
    }

    sticker.addEventListener('mousedown', startDrag);
    sticker.addEventListener('touchstart', startDrag, { passive: false });
    sticker.ondragstart = () => false;
}


// --- Sticker List Scroll Button Logic --- 
if (stickerListScrollUpBtn && stickerListScrollDownBtn && stickerListEl) {
    stickerListScrollUpBtn.addEventListener('click', () => {
        console.log("Scroll Up button clicked.");
        stickerListEl.scrollTop -= stickerListScrollAmount;
        updateScrollButtonStates();
    });
    stickerListScrollDownBtn.addEventListener('click', () => {
        console.log("Scroll Down button clicked.");
        stickerListEl.scrollTop += stickerListScrollAmount;
        updateScrollButtonStates();
    });
    stickerListEl.addEventListener('scroll', () => {
        // console.log("Sticker list scrolled."); // Can be very noisy
        updateScrollButtonStates();
    });
}
function updateScrollButtonStates() {
    // console.log("updateScrollButtonStates called."); // Can be noisy
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
    console.log("DOMContentLoaded event fired.");
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    applyTheme(currentTheme); 
    updateOperationVisibility(); 
    updateScrollButtonStates();
    // No Zoo initialization needed in this version
    console.log("Initial page setup complete.");
});