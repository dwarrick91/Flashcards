// merge.js

const mergeRecipes = [
    // Tier 5: 5-Animal Merge (1)
    { animalsInvolved: ["Bear", "Cat", "Dog", "Lion", "Panda"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    // Tier 4: 4-Animal Merges (5)
    { animalsInvolved: ["Bear", "Cat", "Dog", "Lion"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    { animalsInvolved: ["Bear", "Cat", "Dog", "Panda"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    { animalsInvolved: ["Bear", "Cat", "Lion", "Panda"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    { animalsInvolved: ["Bear", "Dog", "Lion", "Panda"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    { animalsInvolved: ["Cat", "Dog", "Lion", "Panda"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },
    // Tier 3: 3-Animal Merges (10)
    { animalsInvolved: ["Bear", "Cat", "Dog"].sort(), resultName: "Bearcatdog", resultImage: "bearcatdog.png", tier: 3 },
    { animalsInvolved: ["Bear", "Cat", "Lion"].sort(), resultName: "Bearcatlion", resultImage: "bearcatlion.png", tier: 3 },
    { animalsInvolved: ["Bear", "Cat", "Panda"].sort(), resultName: "Bearcatpanda", resultImage: "bearcatpanda.png", tier: 3 },
    { animalsInvolved: ["Bear", "Dog", "Lion"].sort(), resultName: "Beardoglion", resultImage: "beardoglion.png", tier: 3 },
    { animalsInvolved: ["Bear", "Dog", "Panda"].sort(), resultName: "Beardogpanda", resultImage: "beardogpanda.png", tier: 3 },
    { animalsInvolved: ["Bear", "Lion", "Panda"].sort(), resultName: "Bearlionpanda", resultImage: "bearlionpanda.png", tier: 3 },
    { animalsInvolved: ["Cat", "Dog", "Lion"].sort(), resultName: "Catdoglion", resultImage: "catdoglion.png", tier: 3 },
    { animalsInvolved: ["Cat", "Dog", "Panda"].sort(), resultName: "Catdogpanda", resultImage: "catdogpanda.png", tier: 3 },
    { animalsInvolved: ["Cat", "Lion", "Panda"].sort(), resultName: "Catlionpanda", resultImage: "catlionpanda.png", tier: 3 },
    { animalsInvolved: ["Dog", "Lion", "Panda"].sort(), resultName: "Doglionpanda", resultImage: "doglionpanda.png", tier: 3 },
    // Tier 2: 2-Animal Merges (10)
    { animalsInvolved: ["Bear", "Cat"].sort(), resultName: "Bearcat", resultImage: "bearcat.png", tier: 2 },
    { animalsInvolved: ["Bear", "Dog"].sort(), resultName: "Beardog", resultImage: "beardog.png", tier: 2 },
    { animalsInvolved: ["Bear", "Lion"].sort(), resultName: "Bearlion", resultImage: "bearlion.png", tier: 2 },
    { animalsInvolved: ["Bear", "Panda"].sort(), resultName: "Bearpanda", resultImage: "bearpanda.png", tier: 2 },
    { animalsInvolved: ["Cat", "Dog"].sort(), resultName: "Catdog", resultImage: "catdog.png", tier: 2 },
    { animalsInvolved: ["Cat", "Lion"].sort(), resultName: "Catlion", resultImage: "catlion.png", tier: 2 },
    { animalsInvolved: ["Cat", "Panda"].sort(), resultName: "Catpanda", resultImage: "catpanda.png", tier: 2 },
    { animalsInvolved: ["Dog", "Lion"].sort(), resultName: "Doglion", resultImage: "doglion.png", tier: 2 },
    { animalsInvolved: ["Dog", "Panda"].sort(), resultName: "Dogpanda", resultImage: "dogpanda.png", tier: 2 },
    { animalsInvolved: ["Lion", "Panda"].sort(), resultName: "Lionpanda", resultImage: "lionpanda.png", tier: 2 }
];

function checkForMerges() {
    // Relies on global variables from script.js:
    // stickerBoardEl, totalStickersPlaced, makePlacedStickerInteractive,
    // personalizedMessageTimeout, personalizedMessageEl, playerName, currentTheme.

    const placedItems = Array.from(stickerBoardEl.children);
    const baseAnimalsOnBoardWrappers = placedItems.filter(item =>
        item.classList.contains('placed-animal') && 
        item.querySelector('img')?.dataset.animalType &&
        !item.dataset.mergedName 
    );

    if (baseAnimalsOnBoardWrappers.length < 2) return false;

    const sortedRecipes = [...mergeRecipes].sort((a, b) => b.tier - a.tier);

    for (const recipe of sortedRecipes) {
        if (baseAnimalsOnBoardWrappers.length < recipe.animalsInvolved.length) {
            continue; 
        }

        const requiredTypesInRecipe = [...recipe.animalsInvolved]; 
        let availableAnimalsForCurrentRecipeCheck = [...baseAnimalsOnBoardWrappers]; 
        const animalsToConsumeForThisRecipe = []; 

        let canMakeRecipe = true;
        for (const reqType of requiredTypesInRecipe) {
            const foundAnimalIndex = availableAnimalsForCurrentRecipeCheck.findIndex(
                wrapper => wrapper.querySelector('img').dataset.animalType === reqType
            );

            if (foundAnimalIndex !== -1) {
                animalsToConsumeForThisRecipe.push(availableAnimalsForCurrentRecipeCheck[foundAnimalIndex]);
                availableAnimalsForCurrentRecipeCheck.splice(foundAnimalIndex, 1); 
            } else {
                canMakeRecipe = false;
                break; 
            }
        }

        if (canMakeRecipe && animalsToConsumeForThisRecipe.length === requiredTypesInRecipe.length) {
            const firstConsumedAnimalRect = animalsToConsumeForThisRecipe[0].getBoundingClientRect();
            const boardRect = stickerBoardEl.getBoundingClientRect();

            animalsToConsumeForThisRecipe.forEach(wrapper => wrapper.remove());
            totalStickersPlaced -= (animalsToConsumeForThisRecipe.length -1) ; 

            const mergedCreatureWrapper = document.createElement('div');
            mergedCreatureWrapper.classList.add('placed-animal', `merged-tier-${recipe.tier}`);
            mergedCreatureWrapper.dataset.mergedName = recipe.resultName;

            const mergedImgEl = document.createElement('img');
            mergedImgEl.src = `images/merged_animals/${recipe.resultImage}`;
            mergedImgEl.alt = recipe.resultName;
            
            mergedCreatureWrapper.appendChild(mergedImgEl);

            let newLeft = firstConsumedAnimalRect.left - boardRect.left;
            let newTop = firstConsumedAnimalRect.top - boardRect.top;
            const mergedImageWidth = 60; 
            newLeft += (firstConsumedAnimalRect.width / 2) - (mergedImageWidth / 2);

            mergedCreatureWrapper.style.left = newLeft + 'px';
            mergedCreatureWrapper.style.top = newTop + 'px';

            stickerBoardEl.appendChild(mergedCreatureWrapper);
            makePlacedStickerInteractive(mergedCreatureWrapper, stickerBoardEl); 

            if (personalizedMessageTimeout) clearTimeout(personalizedMessageTimeout);
            personalizedMessageEl.textContent = `${playerName}, you've created a ${recipe.resultName}! WOW! 🌟`;
            
            personalizedMessageEl.style.borderColor = '#FFD700'; 
            if (currentTheme === "videogame") {
                personalizedMessageEl.style.color = ''; 
            } else if (currentTheme === "animals") {
                 personalizedMessageEl.style.color = '#4CAF50';
            } else { 
                personalizedMessageEl.style.color = '#DAA520'; 
            }
            
            personalizedMessageEl.classList.add('visible');
            personalizedMessageTimeout = setTimeout(() => {
                personalizedMessageEl.classList.remove('visible');
                personalizedMessageEl.style.color = '';
            }, 3500);

            return true; 
        }
    }
    return false; 
}