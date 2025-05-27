# Arithmetic & Counting Fun! 🌈👾🐾

Welcome to "Arithmetic & Counting Fun!" – a bright and engaging game designed to help kids learn to count and sharpen their math skills in a playful way. With multiple themes, difficulty levels, and fun rewards, learning becomes an adventure!

## Purpose 🎯

The main goal of this application is to provide a **fun and educational tool** for children, particularly those in preschool through 5th grade. We aim to make learning and practicing basic counting and arithmetic (addition, subtraction, multiplication, division) an enjoyable experience, reinforcing foundational math concepts through interactive gameplay and positive encouragement.

---

## Features ✨

* **Multiple Game Modes:**
    * **Preschool Counting:** Focuses on counting 1-10 shapes, with a special animal merging reward system.
    * **Arithmetic Practice:** Covers addition, subtraction, multiplication, and division.
* **Adjustable Difficulty Levels:**
    * Preschool (Counting)
    * 2nd Grade
    * 3rd Grade (Default for arithmetic)
    * 4th Grade
    * 5th Grade
    * *Problem complexity scales with the selected grade level for each operation.*
* **Engaging Themes:** Choose from three visual themes to keep the game fresh!
    * **Rainbow Theme 🌈** (Default)
    * **Videogame Theme 👾**
    * **Animals Theme 🐾**
* **Personalized Experience:** Players can enter their name for personalized messages.
* **Reward System:**
    * **Preschool:** After each correct counting answer, players collect an animal image. If compatible animals are on the reward board, they can merge into exciting new creatures!
    * **Arithmetic Grades:** For every 10 correct answers, players earn a credit to choose a fun "word sticker" (like "Awesome!", "Super!") to place on their reward board.
* **Interactive Reward Board:** Drag and place collected animal images or word stickers anywhere on a dedicated board.
* **Encouraging Feedback:**
    * Immediate feedback for correct/incorrect answers.
    * Special congratulatory pop-up messages for placing rewards and creating merged animals.
* **Mobile-Friendly Design:** The game is designed to be responsive and playable on various screen sizes, with touch-friendly controls for dragging items and scrolling lists.
* **Extended Play:** The game offers up to 1000 questions per session for extended practice.
* **Easy Navigation:** Includes a "Main Menu" button to easily restart or change settings.

---

## How to Play 🎮

1.  **Start Menu:**
    * Enter your name.
    * Choose your desired **Grade Level**.
    * If you selected 2nd-5th grade, choose an **Operation Type** (Multiplication, Addition, Subtraction, or Division). This option is hidden for Preschool.
    * Select your favorite **Theme**.
    * Click "Start Game"!
2.  **Gameplay:**
    * **Counting (Preschool):** Count the shapes displayed on the screen and enter your answer.
    * **Arithmetic (Grades 2-5):** Solve the math problem shown and enter your answer.
    * Click "Submit Answer".
3.  **Rewards:**
    * **Preschool:** After a correct answer, you'll get to pick an animal! Drag it to your reward board. If you place compatible animals, they might merge into a new creature!
    * **Arithmetic:** After every 10 correct answers, you'll earn a sticker credit. The sticker list will appear, allowing you to drag a fun word sticker to your board.
4.  **Reward Board:** Drag and drop your collected animals or word stickers anywhere you like on your personal reward board.
5.  **Main Menu:** Click the "Main Menu" button at any time to return to the start screen, change settings, or start a new game.

---

## Running the Game 🚀

This game is a single HTML file that includes all necessary CSS and JavaScript.

1.  **Download/Save:** Make sure you have the main HTML file for the game.
2.  **Image Assets (Crucial for Preschool Mode):**
    * Create a folder named `images` in the same directory as your HTML file.
    * Inside the `images` folder, create two more folders:
        * `animals`
        * `merged_animals`
    * **Place your base animal images** (e.g., `cat.png`, `dog.png`, `bear.png`, `lion.png`, `panda.png`) into the `images/animals/` folder.
    * **Create and place your merged animal images** (e.g., `bearcat.png`, `catdog.png`, ..., `bearcatdoglionpanda.png` – a total of 26 for all direct base animal combinations, or more if you've implemented additive merging with unique intermediate visuals) into the `images/merged_animals/` folder. *The JavaScript code expects specific filenames based on the alphabetical concatenation of the base animal names.*
3.  **Open in Browser:** Simply open the HTML file in a modern web browser (like Chrome, Firefox, Edge, Safari).

---

## Development Note 🛠️

This "Arithmetic & Counting Fun" game was conceptualized and its code was entirely generated through an iterative process with **Google's Gemini language model**. The development involved prompting for features, explaining requirements, debugging, and refining the HTML, CSS, and JavaScript interactively with AI assistance.

---

## Future Ideas (Possible Enhancements) 💡

* Sound effects for correct/incorrect answers and sticker placement.
* More complex merging logic or visual effects for merges (if not already fully implemented).
* A "sticker book" or "collection page" to save and view all collected rewards.
* User accounts or progress saving (would require backend or more advanced LocalStorage usage).
* More varied shapes and visual elements for the counting game.
* Different types of rewards or mini-games unlocked by progress.

---

We hope this game provides a delightful and effective learning experience!