// merge.js

const mergeRecipes = [
    // --- Tier 6 - Supermaximal Merge (1 recipe) ---
    { 
        components: [
            "Bearcatdoglionpanda", "Bearcatdoglionpanda", "Bearcatdoglionpanda", 
            "Bearcatdoglionpanda", "Bearcatdoglionpanda"
        ].sort(), // Sorting components for consistent matching if order doesn't matter
        resultName: "Supermaximal", 
        resultImage: "supermaximal.png", 
        tier: 6 
    },

    // --- Tier 5 (1 result, multiple paths to get it) ---
    { components: ["Bearcatdoglion", "Panda"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    { components: ["Bearcatdogpanda", "Lion"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    { components: ["Bearcatlionpanda", "Dog"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    { components: ["Beardoglionpanda", "Cat"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    { components: ["Catdoglionpanda", "Bear"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },
    { components: ["Bear", "Cat", "Dog", "Lion", "Panda"].sort(), resultName: "Bearcatdoglionpanda", resultImage: "bearcatdoglionpanda.png", tier: 5 },

    // --- Tier 4 (5 results, multiple paths to each) ---
    // Bearcatdoglion
    { components: ["Bearcatdog", "Lion"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    { components: ["Bearcatlion", "Dog"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    { components: ["Beardoglion", "Cat"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    { components: ["Catdoglion", "Bear"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    { components: ["Bear", "Cat", "Dog", "Lion"].sort(), resultName: "Bearcatdoglion", resultImage: "bearcatdoglion.png", tier: 4 },
    // Bearcatdogpanda
    { components: ["Bearcatdog", "Panda"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    { components: ["Bearcatpanda", "Dog"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    { components: ["Beardogpanda", "Cat"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    { components: ["Catdogpanda", "Bear"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    { components: ["Bear", "Cat", "Dog", "Panda"].sort(), resultName: "Bearcatdogpanda", resultImage: "bearcatdogpanda.png", tier: 4 },
    // Bearcatlionpanda
    { components: ["Bearcatlion", "Panda"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    { components: ["Bearcatpanda", "Lion"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    { components: ["Bearlionpanda", "Cat"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    { components: ["Catlionpanda", "Bear"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    { components: ["Bear", "Cat", "Lion", "Panda"].sort(), resultName: "Bearcatlionpanda", resultImage: "bearcatlionpanda.png", tier: 4 },
    // Beardoglionpanda
    { components: ["Beardoglion", "Panda"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    { components: ["Beardogpanda", "Lion"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    { components: ["Bearlionpanda", "Dog"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    { components: ["Doglionpanda", "Bear"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    { components: ["Bear", "Dog", "Lion", "Panda"].sort(), resultName: "Beardoglionpanda", resultImage: "beardoglionpanda.png", tier: 4 },
    // Catdoglionpanda
    { components: ["Catdoglion", "Panda"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },
    { components: ["Catdogpanda", "Lion"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },
    { components: ["Catlionpanda", "Dog"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },
    { components: ["Doglionpanda", "Cat"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },
    { components: ["Cat", "Dog", "Lion", "Panda"].sort(), resultName: "Catdoglionpanda", resultImage: "catdoglionpanda.png", tier: 4 },

    // --- Tier 3 (10 results, 3 base animals each) ---
    // Bearcatdog
    { components: ["Bearcat", "Dog"].sort(), resultName: "Bearcatdog", resultImage: "bearcatdog.png", tier: 3 },
    { components: ["Beardog", "Cat"].sort(), resultName: "Bearcatdog", resultImage: "bearcatdog.png", tier: 3 },
    { components: ["Catdog", "Bear"].sort(), resultName: "Bearcatdog", resultImage: "bearcatdog.png", tier: 3 },
    { components: ["Bear", "Cat", "Dog"].sort(), resultName: "Bearcatdog", resultImage: "bearcatdog.png", tier: 3 },
    // Bearcatlion
    { components: ["Bearcat", "Lion"].sort(), resultName: "Bearcatlion", resultImage: "bearcatlion.png", tier: 3 },
    { components: ["Bearlion", "Cat"].sort(), resultName: "Bearcatlion", resultImage: "bearcatlion.png", tier: 3 },
    { components: ["Catlion", "Bear"].sort(), resultName: "Bearcatlion", resultImage: "bearcatlion.png", tier: 3 },
    { components: ["Bear", "Cat", "Lion"].sort(), resultName: "Bearcatlion", resultImage: "bearcatlion.png", tier: 3 },
    // Bearcatpanda
    { components: ["Bearcat", "Panda"].sort(), resultName: "Bearcatpanda", resultImage: "bearcatpanda.png", tier: 3 },
    { components: ["Bearpanda", "Cat"].sort(), resultName: "Bearcatpanda", resultImage: "bearcatpanda.png", tier: 3 },
    { components: ["Catpanda", "Bear"].sort(), resultName: "Bearcatpanda", resultImage: "bearcatpanda.png", tier: 3 },
    { components: ["Bear", "Cat", "Panda"].sort(), resultName: "Bearcatpanda", resultImage: "bearcatpanda.png", tier: 3 },
    // Beardoglion
    { components: ["Beardog", "Lion"].sort(), resultName: "Beardoglion", resultImage: "beardoglion.png", tier: 3 },
    { components: ["Bearlion", "Dog"].sort(), resultName: "Beardoglion", resultImage: "beardoglion.png", tier: 3 },
    { components: ["Doglion", "Bear"].sort(), resultName: "Beardoglion", resultImage: "beardoglion.png", tier: 3 },
    { components: ["Bear", "Dog", "Lion"].sort(), resultName: "Beardoglion", resultImage: "beardoglion.png", tier: 3 },
    // Beardogpanda
    { components: ["Beardog", "Panda"].sort(), resultName: "Beardogpanda", resultImage: "beardogpanda.png", tier: 3 },
    { components: ["Bearpanda", "Dog"].sort(), resultName: "Beardogpanda", resultImage: "beardogpanda.png", tier: 3 },
    { components: ["Dogpanda", "Bear"].sort(), resultName: "Beardogpanda", resultImage: "beardogpanda.png", tier: 3 },
    { components: ["Bear", "Dog", "Panda"].sort(), resultName: "Beardogpanda", resultImage: "beardogpanda.png", tier: 3 },
    // Bearlionpanda
    { components: ["Bearlion", "Panda"].sort(), resultName: "Bearlionpanda", resultImage: "bearlionpanda.png", tier: 3 },
    { components: ["Bearpanda", "Lion"].sort(), resultName: "Bearlionpanda", resultImage: "bearlionpanda.png", tier: 3 },
    { components: ["Lionpanda", "Bear"].sort(), resultName: "Bearlionpanda", resultImage: "bearlionpanda.png", tier: 3 },
    { components: ["Bear", "Lion", "Panda"].sort(), resultName: "Bearlionpanda", resultImage: "bearlionpanda.png", tier: 3 },
    // Catdoglion
    { components: ["Catdog", "Lion"].sort(), resultName: "Catdoglion", resultImage: "catdoglion.png", tier: 3 },
    { components: ["Catlion", "Dog"].sort(), resultName: "Catdoglion", resultImage: "catdoglion.png", tier: 3 },
    { components: ["Doglion", "Cat"].sort(), resultName: "Catdoglion", resultImage: "catdoglion.png", tier: 3 },
    { components: ["Cat", "Dog", "Lion"].sort(), resultName: "Catdoglion", resultImage: "catdoglion.png", tier: 3 },
    // Catdogpanda
    { components: ["Catdog", "Panda"].sort(), resultName: "Catdogpanda", resultImage: "catdogpanda.png", tier: 3 },
    { components: ["Catpanda", "Dog"].sort(), resultName: "Catdogpanda", resultImage: "catdogpanda.png", tier: 3 },
    { components: ["Dogpanda", "Cat"].sort(), resultName: "Catdogpanda", resultImage: "catdogpanda.png", tier: 3 },
    { components: ["Cat", "Dog", "Panda"].sort(), resultName: "Catdogpanda", resultImage: "catdogpanda.png", tier: 3 },
    // Catlionpanda
    { components: ["Catlion", "Panda"].sort(), resultName: "Catlionpanda", resultImage: "catlionpanda.png", tier: 3 },
    { components: ["Catpanda", "Lion"].sort(), resultName: "Catlionpanda", resultImage: "catlionpanda.png", tier: 3 },
    { components: ["Lionpanda", "Cat"].sort(), resultName: "Catlionpanda", resultImage: "catlionpanda.png", tier: 3 },
    { components: ["Cat", "Lion", "Panda"].sort(), resultName: "Catlionpanda", resultImage: "catlionpanda.png", tier: 3 },
    // Doglionpanda
    { components: ["Doglion", "Panda"].sort(), resultName: "Doglionpanda", resultImage: "doglionpanda.png", tier: 3 },
    { components: ["Dogpanda", "Lion"].sort(), resultName: "Doglionpanda", resultImage: "doglionpanda.png", tier: 3 },
    { components: ["Lionpanda", "Dog"].sort(), resultName: "Doglionpanda", resultImage: "doglionpanda.png", tier: 3 },
    { components: ["Dog", "Lion", "Panda"].sort(), resultName: "Doglionpanda", resultImage: "doglionpanda.png", tier: 3 },

    // --- Tier 2: 2-Animal Merges (10) ---
    { components: ["Bear", "Cat"].sort(), resultName: "Bearcat", resultImage: "bearcat.png", tier: 2 },
    { components: ["Bear", "Dog"].sort(), resultName: "Beardog", resultImage: "beardog.png", tier: 2 },
    { components: ["Bear", "Lion"].sort(), resultName: "Bearlion", resultImage: "bearlion.png", tier: 2 },
    { components: ["Bear", "Panda"].sort(), resultName: "Bearpanda", resultImage: "bearpanda.png", tier: 2 },
    { components: ["Cat", "Dog"].sort(), resultName: "Catdog", resultImage: "catdog.png", tier: 2 },
    { components: ["Cat", "Lion"].sort(), resultName: "Catlion", resultImage: "catlion.png", tier: 2 },
    { components: ["Cat", "Panda"].sort(), resultName: "Catpanda", resultImage: "catpanda.png", tier: 2 },
    { components: ["Dog", "Lion"].sort(), resultName: "Doglion", resultImage: "doglion.png", tier: 2 },
    { components: ["Dog", "Panda"].sort(), resultName: "Dogpanda", resultImage: "dogpanda.png", tier: 2 },
    { components: ["Lion", "Panda"].sort(), resultName: "Lionpanda", resultImage: "lionpanda.png", tier: 2 }
];

function checkForMerges() {
    // This function relies on global variables from script.js:
    // stickerBoardEl, totalStickersPlaced, makePlacedStickerInteractive,
    // personalizedMessageTimeout, personalizedMessageEl, playerName, currentTheme.

    const placedItemElements = Array.from(stickerBoardEl.children);

    // 1. Get all identifiable items currently on the board with their type ('id') and element
    const itemsOnBoard = placedItemElements.map(wrapper => {
        let id = null;
        if (wrapper.dataset.mergedName) { // This is an already merged creature
            id = wrapper.dataset.mergedName;
        } else if (wrapper.classList.contains('placed-animal') && wrapper.querySelector('img')?.dataset.animalType) { // This is a base animal
            id = wrapper.querySelector('img').dataset.animalType;
        }
        return id ? { id: id, element: wrapper } : null;
    }).filter(item => item !== null);

    const minComponentsForAnyRecipe = Math.min(...mergeRecipes.map(r => r.components.length), 2); 
    if (itemsOnBoard.length < minComponentsForAnyRecipe) return null; // Return null if no merge

    // 2. Sort recipes: by tier (desc), then by number of direct components (desc) for tie-breaking.
    const sortedRecipes = [...mergeRecipes].sort((a, b) => {
        if (b.tier !== a.tier) {
            return b.tier - a.tier;
        }
        // If tiers are equal, prefer recipes with more components (more specific)
        if (b.components.length !== a.components.length) {
             return b.components.length - a.components.length;
        }
        // Fallback to sort by name if all else is equal, for deterministic behavior
        return a.resultName.localeCompare(b.resultName);
    });

    for (const recipe of sortedRecipes) {
        if (itemsOnBoard.length < recipe.components.length) {
            continue; 
        }

        let availableItemsForRecipeCheck = [...itemsOnBoard]; // Create a mutable copy for this recipe iteration
        const itemsToConsumeElements = []; // Stores the actual DOM element wrappers to remove

        let canMakeRecipe = true;
        // For each component ID required by the recipe
        for (const requiredComponentId of recipe.components) { 
            // Find an item on the board that matches this component ID
            const foundItemIndex = availableItemsForRecipeCheck.findIndex(
                itemOnBoard => itemOnBoard.id === requiredComponentId
            );

            if (foundItemIndex !== -1) {
                itemsToConsumeElements.push(availableItemsForRecipeCheck[foundItemIndex].element);
                availableItemsForRecipeCheck.splice(foundItemIndex, 1); // "Consume" from the temp list
            } else {
                canMakeRecipe = false; // Required component not found on board
                break;
            }
        }

        if (canMakeRecipe) { // All components for this recipe were found as distinct items on the board
            // --- A merge is possible! ---
            const firstConsumedElementRect = itemsToConsumeElements[0].getBoundingClientRect();
            const boardRect = stickerBoardEl.getBoundingClientRect();

            itemsToConsumeElements.forEach(element => element.remove());
            totalStickersPlaced -= (itemsToConsumeElements.length -1) ; // Net change in items on board

            const mergedCreatureWrapper = document.createElement('div');
            mergedCreatureWrapper.classList.add('placed-animal', `merged-tier-${recipe.tier}`);
            mergedCreatureWrapper.dataset.mergedName = recipe.resultName; // This is its new ID

            const mergedImgEl = document.createElement('img');
            mergedImgEl.src = `images/merged_animals/${recipe.resultImage}`;
            mergedImgEl.alt = recipe.resultName;
            
            mergedCreatureWrapper.appendChild(mergedImgEl);

            let newLeft = firstConsumedElementRect.left - boardRect.left;
            let newTop = firstConsumedElementRect.top - boardRect.top;
            const mergedImageDisplayWidth = 60; // Assuming placed merged animals are also 60px
            newLeft += (firstConsumedElementRect.offsetWidth / 2) - (mergedImageDisplayWidth / 2); // Try to center

            mergedCreatureWrapper.style.left = newLeft + 'px';
            mergedCreatureWrapper.style.top = newTop + 'px';

            stickerBoardEl.appendChild(mergedCreatureWrapper);
            makePlacedStickerInteractive(mergedCreatureWrapper, stickerBoardEl); 

            if (personalizedMessageTimeout) clearTimeout(personalizedMessageTimeout);
            personalizedMessageEl.textContent = `${playerName}, you've created a ${recipe.resultName}! Incredible! ✨`;
            
            personalizedMessageEl.style.borderColor = '#FFD700'; // Gold for any merge success
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

            return recipe.resultName; // A merge happened, return the name of the new creature
        }
    }
    return null; // No merge happened in this pass
}