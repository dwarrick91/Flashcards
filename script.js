// script.js

let playerName = "Player";
let difficultyLevel = 3; 
let operationType = "multiplication"; 
let currentTheme = "rainbow"; 

let num1, num2, correctAnswerValue; 
let displayedShapesCount; 

let correctAnswers = 0;
let questionsAsked = 0;
const correctAnswersNeededForSticker = 10; 
let totalStickersPlaced = 0; 
let availableStickerCredits = 0; 

const gameLength = 1000;
const totalStickerOptionsInList = 21; 
const totalAnimalChoices = 5;


const encouragingWords = [
    "Great!", "Awesome!", "Super!", "Well Done!", "Fantastic!", "Amazing!", "Excellent!",
    "Bravo!", "Wow!", "Incredible!", "Superb!", "Marvelous!", "Outstanding!", "Perfect!",
    "Terrific!", "Way to Go!", "You Rock!", "Smart!", "Brilliant!", "Star!", "Genius!"
];
const themeStickerColorClasses = [ 
    "theme-sticker-color-1", "theme-sticker-color-2", "theme-sticker-color-3",
    "theme-sticker-color-4", "theme-sticker-color-5", "theme-sticker-color-6", "theme-sticker-color-7"
];
        
// animalImageFiles is used by populateAnimalChoices in this file
const animalImageFiles = [
    { src: "cat.png", name: "Cat", alt: "a Cute Cat" }, 
    { src: "dog.png", name: "Dog", alt: "a Happy Dog" },
    { src: "bear.png", name: "Bear", alt: "a Friendly Bear" },
    { src: "lion.png", name: "Lion", alt: "a Brave Lion" },
    { src: "panda.png", name: "Panda", alt: "a Playful Panda" }
];
// mergeRecipes and checkForMerges are now in merge.js


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

function applyTheme(themeName) {
    document.body.className = ''; 
    document.body.classList.add(themeName + '-theme');
    currentTheme = themeName;
}

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

        const selectedDifficultyRadio = document.querySelector('input[name="difficulty"]:checked');
        difficultyLevel = selectedDifficultyRadio ? parseInt(selectedDifficultyRadio.value) : 3;
        
        if (difficultyLevel === 1) { 
            operationType = "counting"; 
        } else {
            const selectedOperationRadio = document.querySelector('input[name="operation"]:checked');
            operationType = selectedOperationRadio ? selectedOperationRadio.value : "multiplication";
        }

        const selectedThemeRadio = document.querySelector('input[name="theme"]:checked');
        const themeToApply = selectedThemeRadio ? selectedThemeRadio.value : "rainbow";
        applyTheme(themeToApply);


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
    if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
    answerEl.focus(); 
}

if (mainMenuBtnEl) {
    mainMenuBtnEl.addEventListener('click', goToMainMenu);
}

function goToMainMenu() {
    gameAndStickersContainerEl.style.display = 'none';
    startMenuEl.style.display = 'flex';

    correctAnswers = 0;
    questionsAsked = 0;
    totalStickersPlaced = 0;
    availableStickerCredits = 0;
    
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
    
    playerNameInputEl.value = ""; 
    document.getElementById('grade3').checked = true; 
    document.getElementById('opMultiply').checked = true; 
    document.getElementById('themeRainbow').checked = true; 
    applyTheme("rainbow"); 
    difficultyLevel = 3; 
    operationType = "multiplication"; 
    updateOperationVisibility();


    playerNameInputEl.focus(); 
}

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
    displayedShapesCount = numShapesToDisplay; 
    correctAnswerValue = displayedShapesCount;

    const shapesEmojis = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '🔺', '▪️', '🔶', '❤️', '💜', '🧡'];
    const selectedShapeEmoji = shapesEmojis[Math.floor(Math.random() * shapesEmojis.length)];

    for (let i = 0; i < displayedShapesCount; i++) {
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
    if (difficultyLevel === 1) { 
        if (availableStickerCredits > 0) { 
             stickerSectionEl.classList.remove('hidden');
        } else {
             stickerSectionEl.classList.add('hidden');
        }
    } else { 
        if (availableStickerCredits > 0) {
            stickerSectionEl.classList.remove('hidden');
            stickerHeaderEl.textContent = `🌟 You've earned ${availableStickerCredits} sticker credit(s)! 🌟`;
            stickerPromptEl.textContent = "Choose one colorful word sticker and drag it to your board.";
            if (stickerListEl.children.length === 0 || stickerListEl.querySelector('img')) { 
                populateWordStickers();
            }
            document.querySelectorAll('.sticker-option').forEach(opt => opt.classList.remove('disabled-drag'));
        } else {
            stickerHeaderEl.textContent = "Keep answering correctly for stickers!";
            stickerPromptEl.textContent = "You're doing great!";
            document.querySelectorAll('.sticker-option').forEach(opt => opt.classList.add('disabled-drag'));
            if (questionsAsked < gameLength && questionsAsked > 0) { 
                setTimeout(() => {
                    if(availableStickerCredits === 0 && !personalizedMessageEl.classList.contains('visible')) {
                        stickerSectionEl.classList.add('hidden');
                    }
                }, 2500);
            }
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

            if (difficultyLevel === 1) { 
                triggerAnimalReward();
            } else { 
                if (correctAnswers > 0 && correctAnswers % correctAnswersNeededForSticker === 0) {
                    availableStickerCredits++;
                    let stickerEarnedText = "";
                    switch (currentTheme) {
                        case "videogame": stickerEarnedText = "<br>✨ Power-Up! Sticker Credit Unlocked! ✨"; break;
                        case "animals": stickerEarnedText = "<br>🐾 Wild! You found a Sticker Credit! 🐾"; break;
                        case "rainbow": default: stickerEarnedText = "<br>🌈 You've earned a sticker credit! 🌈"; break;
                    }
                    feedbackEl.innerHTML = feedbackEl.textContent + stickerEarnedText; 
                    updateStickerSectionStatus();
                }
            }
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
        if (!isNaN(userAnswer) || questionsAsked === 0 || (difficultyLevel === 1 && userAnswer !== undefined) ){
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

function populateWordStickers() { 
    stickerListEl.innerHTML = '';
    for (let i = 0; i < totalStickerOptionsInList; i++) {
        const wordSticker = document.createElement('div');
        wordSticker.textContent = encouragingWords[i % encouragingWords.length];
        wordSticker.classList.add('sticker-base', 'sticker-option');
        wordSticker.classList.add(themeStickerColorClasses[i % themeStickerColorClasses.length]);
        wordSticker.draggable = true;
        wordSticker.addEventListener('dragstart', handleDragStartMouse);
        wordSticker.addEventListener('touchstart', handleDragStartTouch, { passive: false });
        stickerListEl.appendChild(wordSticker);
    }
    updateDragDisabledState();
    updateScrollButtonStates();
}

function populateAnimalChoices() {
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
        finalMessage += ` You collected ${totalStickersPlaced} reward(s) for your board!`;
    } else if (correctAnswers > 0) {
         finalMessage += " Keep practicing to collect rewards!";
    } else {
        finalMessage = " Keep practicing!";
    }
    feedbackEl.innerHTML = `🎉 Game Over, ${playerName}! ${finalMessage} 🎉`; 
    feedbackEl.className = ''; 

     updateStickerSectionStatus(); 
     if(availableStickerCredits > 0 && stickerSectionEl.classList.contains('hidden')){
         stickerSectionEl.classList.remove('hidden');
     }
}

let draggedStickerElement = null;
let stickerGhost = null;
let dragOffsetX, dragOffsetY;

function canDragSticker() { return availableStickerCredits > 0; }

function handleDragStartMouse(e) {
    if (!canDragSticker()) { e.preventDefault(); return; }
    draggedStickerElement = e.target.cloneNode(true); 
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    
    const rect = e.target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    try {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.dataTransfer.setData('text/plain', e.target.alt || e.target.textContent); 
    } catch (error) { /* Failsafe */ }
}

function handleDragStartTouch(e) {
    if (!canDragSticker()) { return; }
    e.preventDefault();

    const touch = e.targetTouches[0];
    const originalSticker = e.target;

    stickerGhost = originalSticker.cloneNode(true); 
    stickerGhost.classList.remove('sticker-option', 'disabled-drag');
    stickerGhost.classList.add('sticker-ghost'); 
    if (originalSticker.tagName === 'DIV') { 
         originalSticker.classList.forEach(cls => {
             if(cls.startsWith('theme-sticker-color-') || cls === 'sticker-base') {
                if (!stickerGhost.classList.contains(cls)) stickerGhost.classList.add(cls);
             }
        });
    }
    
    stickerGhost.style.width = originalSticker.offsetWidth + 'px';
    stickerGhost.style.height = originalSticker.offsetHeight + 'px';

    const rect = originalSticker.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;

    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
    document.body.appendChild(stickerGhost);

    draggedStickerElement = originalSticker.cloneNode(true);
    draggedStickerElement.classList.remove('sticker-option', 'disabled-drag');
    
    document.addEventListener('touchmove', handleDragMoveTouch, { passive: false });
    document.addEventListener('touchend', handleDragEndTouch);
}

function handleDragMoveTouch(e) {
    e.preventDefault();
    if (!stickerGhost) return;
    const touch = e.targetTouches[0];
    stickerGhost.style.left = (touch.clientX - dragOffsetX) + 'px';
    stickerGhost.style.top = (touch.clientY - dragOffsetY) + 'px';
}

function placeStickerOnBoard(pageX, pageY) {
    if (!draggedStickerElement) return;

    const boardRect = stickerBoardEl.getBoundingClientRect();
    const stickerTopLeftXonPage = pageX - dragOffsetX;
    const stickerTopLeftYonPage = pageY - dragOffsetY;
    
    const isAnimalBaseElement = draggedStickerElement.tagName === 'IMG';
    const itemIdentifier = isAnimalBaseElement ? (draggedStickerElement.alt || "a new friend") : draggedStickerElement.textContent;
    // const itemTypeForMerge = isAnimalBaseElement ? draggedStickerElement.dataset.animalType : null; // Already on draggedStickerElement

    const itemBgColor = isAnimalBaseElement ? 'transparent' : window.getComputedStyle(draggedStickerElement).backgroundColor;
    const itemTextColor = isAnimalBaseElement ? '#333' : window.getComputedStyle(draggedStickerElement).color;

    const itemWidth = draggedStickerElement.offsetWidth || parseInt(window.getComputedStyle(draggedStickerElement).width) || (isAnimalBaseElement ? 60 : 90);
    const itemHeight = draggedStickerElement.offsetHeight || parseInt(window.getComputedStyle(draggedStickerElement).height) || (isAnimalBaseElement ? 60 : 30);
    const itemCenterXonPage = stickerTopLeftXonPage + itemWidth / 2;
    const itemCenterYonPage = stickerTopLeftYonPage + itemHeight / 2;

    if (itemCenterXonPage >= boardRect.left &&
        itemCenterXonPage <= boardRect.right &&
        itemCenterYonPage >= boardRect.top &&
        itemCenterYonPage <= boardRect.bottom) {

        let elementToPlaceOnBoard = draggedStickerElement; 
        if (isAnimalBaseElement) {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.classList.add('placed-animal');
            // The clone (draggedStickerElement which is an img) already has its dataset.animalType
            wrapperDiv.appendChild(draggedStickerElement); 
            elementToPlaceOnBoard = wrapperDiv;
        } else {
             draggedStickerElement.classList.add('placed-sticker-text'); 
        }

        elementToPlaceOnBoard.style.left = (stickerTopLeftXonPage - boardRect.left) + 'px';
        elementToPlaceOnBoard.style.top = (stickerTopLeftYonPage - boardRect.top) + 'px';

        stickerBoardEl.appendChild(elementToPlaceOnBoard);
        makePlacedStickerInteractive(elementToPlaceOnBoard, stickerBoardEl);

        totalStickersPlaced++;
        availableStickerCredits--; 
        updateStickerSectionStatus(); 

        let mergeHappened = false;
        if (isAnimalBaseElement && difficultyLevel === 1) { 
            // Pass the type of the just-placed animal to avoid re-checking it if logic needs it,
            // though current checkForMerges re-scans the whole board.
            mergeHappened = checkForMerges(); 
        }

        if (!mergeHappened) { 
            if (personalizedMessageTimeout) { clearTimeout(personalizedMessageTimeout); }
            let personalizedText;

            if (isAnimalBaseElement && difficultyLevel === 1) {
                personalizedText = `Great job, ${playerName}! You collected ${itemIdentifier}! 🥳`;
                personalizedMessageEl.style.borderColor = '#2ECC40'; 
                personalizedMessageEl.style.color = (currentTheme === "videogame" && personalizedMessageEl.style.fontFamily.includes('Press Start 2P')) ? '' : '#2ECC40';
            } else if (!isAnimalBaseElement) { 
                const baseWord = itemIdentifier.replace('!', ''); 
                switch (itemIdentifier) { 
                    case "Star!": personalizedText = `${playerName}, you are a ${baseWord}! ⭐`; break;
                    case "Genius!": personalizedText = `${playerName}, you are a ${baseWord}! 🧠`; break;
                    case "Well Done!": personalizedText = `Well Done, ${playerName}! 👍`; break;
                    case "Way to Go!": personalizedText = `Way to Go, ${playerName}! 🚀`; break;
                    case "You Rock!": personalizedText = `${playerName}, you Rock! 🎸`; break;
                    case "Bravo!": personalizedText = `Bravo, ${playerName}! 👏`; break;
                    case "Wow!": personalizedText = `Wow, ${playerName}! That was amazing! ✨`; break;
                    default: personalizedText = `${playerName}, you are ${itemIdentifier}`; break;
                }
                personalizedMessageEl.style.borderColor = itemBgColor; 
                if (currentTheme === "videogame") {
                    personalizedMessageEl.style.color = ''; 
                } else {
                    if (itemTextColor === 'rgb(51, 51, 51)') { personalizedMessageEl.style.color = '#333'; } 
                    else { personalizedMessageEl.style.color = itemBgColor; }
                }
            }
            
            if (personalizedText) { 
                personalizedMessageEl.textContent = personalizedText;
                personalizedMessageEl.classList.add('visible');
                personalizedMessageTimeout = setTimeout(() => {
                    personalizedMessageEl.classList.remove('visible');
                    personalizedMessageEl.style.color = ''; 
                }, 2800);
            }
        }
    }
}

stickerBoardEl.addEventListener('dragover', (e) => e.preventDefault());
stickerBoardEl.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedStickerElement && !stickerGhost) {
         placeStickerOnBoard(e.clientX, e.clientY);
    }
    draggedStickerElement = null;
});

function handleDragEndTouch(e) {
    const touch = e.changedTouches[0];
    if (stickerGhost) {
        if (stickerGhost.parentNode) stickerGhost.parentNode.removeChild(stickerGhost);
        stickerGhost = null;
    }
    if (draggedStickerElement && touch) {
         placeStickerOnBoard(touch.clientX, touch.clientY);
    }
    draggedStickerElement = null;
    document.removeEventListener('touchmove', handleDragMoveTouch);
    document.removeEventListener('touchend', handleDragEndTouch);
}

function makePlacedStickerInteractive(sticker, container) { 
    let isDraggingPlaced = false;
    let interactionPointOffsetX, interactionPointOffsetY;

    function startDrag(e) {
        isDraggingPlaced = true;
        const clientX = e.clientX || e.targetTouches[0].clientX;
        const clientY = e.clientY || e.targetTouches[0].clientY;
        const stickerRect = sticker.getBoundingClientRect();

        interactionPointOffsetX = clientX - stickerRect.left;
        interactionPointOffsetY = clientY - stickerRect.top;

        sticker.style.cursor = 'grabbing';
        sticker.style.zIndex = (parseInt(window.getComputedStyle(sticker).zIndex || 10) + 10).toString();

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
        const containerRect = container.getBoundingClientRect();

        let newLeftOnPage = clientX - interactionPointOffsetX;
        let newTopOnPage = clientY - interactionPointOffsetY;
        let newLeftInContainer = newLeftOnPage - containerRect.left;
        let newTopInContainer = newTopOnPage - containerRect.top;

        const itemWidth = sticker.offsetWidth; 
        const itemHeight = sticker.offsetHeight;


        newLeftInContainer = Math.max(0, Math.min(newLeftInContainer, containerRect.width - itemWidth));
        newTopInContainer = Math.max(0, Math.min(newTopInContainer, containerRect.height - itemHeight));

        sticker.style.left = newLeftInContainer + 'px';
        sticker.style.top = newTopInContainer + 'px';
    }

    function endDrag(e) {
        isDraggingPlaced = false;
        sticker.style.cursor = 'move';
        if (e.type === 'mouseup') {
            document.removeEventListener('mousemove', moveDrag);
            document.removeEventListener('mouseup', endDrag);
        } else if (e.type === 'touchend') {
            document.removeEventListener('touchmove', moveDrag);
            document.removeEventListener('touchend', endDrag);
        }
    }

    sticker.addEventListener('mousedown', startDrag);
    sticker.addEventListener('touchstart', startDrag, { passive: false });
    sticker.ondragstart = () => false;
}

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

// Initial state setup
if(personalizedMessageEl) personalizedMessageEl.classList.remove('visible');
applyTheme(currentTheme); 
updateOperationVisibility(); 
updateScrollButtonStates();
