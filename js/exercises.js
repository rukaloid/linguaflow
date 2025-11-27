// Exercises JavaScript

// Exercise data
const exerciseData = {
    multipleChoice: [
        {
            question: 'Выберите правильный перевод слова "house":',
            options: [
                { text: 'дом', correct: true },
                { text: 'кот', correct: false },
                { text: 'машина', correct: false },
                { text: 'книга', correct: false }
            ]
        },
        {
            question: 'Как переводится слово "book"?',
            options: [
                { text: 'ручка', correct: false },
                { text: 'стол', correct: false },
                { text: 'книга', correct: true },
                { text: 'окно', correct: false }
            ]
        },
        {
            question: 'Выберите правильный перевод фразы "I am a student":',
            options: [
                { text: 'Я учитель', correct: false },
                { text: 'Я студент', correct: true },
                { text: 'Я врач', correct: false },
                { text: 'Я инженер', correct: false }
            ]
        },
        {
            question: 'Какое слово означает "красный" на английском?',
            options: [
                { text: 'blue', correct: false },
                { text: 'green', correct: false },
                { text: 'red', correct: true },
                { text: 'yellow', correct: false }
            ]
        },
        {
            question: 'Выберите правильный перевод "My name is John":',
            options: [
                { text: 'Меня зовут Джон', correct: true },
                { text: 'Я Джон', correct: false },
                { text: 'Это Джон', correct: false },
                { text: 'Джон здесь', correct: false }
            ]
        }
    ],
    fillBlanks: [
        {
            question: 'Заполните пропуск в предложении: "The cat is ___ the table."',
            answer: 'on'
        },
        {
            question: 'Заполните пропуск: "I ___ to school every day."',
            answer: 'go'
        },
        {
            question: 'Заполните пропуск: "She ___ a book yesterday."',
            answer: 'read'
        },
        {
            question: 'Заполните пропуск: "We ___ watching TV now."',
            answer: 'are'
        },
        {
            question: 'Заполните пропуск: "They ___ from Spain."',
            answer: 'are'
        }
    ],
    matching: [
        {
            pairs: [
                { word: 'house', translation: 'дом' },
                { word: 'cat', translation: 'кот' },
                { word: 'book', translation: 'книга' },
                { word: 'water', translation: 'вода' }
            ]
        },
        {
            pairs: [
                { word: 'apple', translation: 'яблоко' },
                { word: 'dog', translation: 'собака' },
                { word: 'sun', translation: 'солнце' },
                { word: 'tree', translation: 'дерево' }
            ]
        },
        {
            pairs: [
                { word: 'car', translation: 'машина' },
                { word: 'friend', translation: 'друг' },
                { word: 'city', translation: 'город' },
                { word: 'school', translation: 'школа' }
            ]
        }
    ],
    listening: [
        {
            question: 'Прослушайте аудио и выберите правильный вариант:',
            audioText: 'I have a cat',
            options: [
                { text: 'I have a dog', correct: false },
                { text: 'I have a cat', correct: true },
                { text: 'I have a house', correct: false },
                { text: 'I have a car', correct: false }
            ]
        },
        {
            question: 'Прослушайте аудио и выберите, что вы услышали:',
            audioText: 'She is reading a book',
            options: [
                { text: 'She is reading a book', correct: true },
                { text: 'He is reading a book', correct: false },
                { text: 'She is writing a book', correct: false },
                { text: 'She is buying a book', correct: false }
            ]
        },
        {
            question: 'Что вы услышали в аудио?',
            audioText: 'We are going to the park',
            options: [
                { text: 'We are going to the park', correct: true },
                { text: 'We are going to the store', correct: false },
                { text: 'They are going to the park', correct: false },
                { text: 'We were going to the park', correct: false }
            ]
        }
    ]
};

// Exercise state
let exerciseState = {
    currentExercise: {
        multipleChoice: 0,
        fillBlanks: 0,
        matching: 0,
        listening: 0
    },
    scores: {
        multipleChoice: 0,
        fillBlanks: 0,
        matching: 0,
        listening: 0
    },
    answers: {
        multipleChoice: [],
        fillBlanks: [],
        matching: [],
        listening: []
    }
};

// DOM elements
const exerciseTabs = document.querySelectorAll('.exercise-tab');
const exerciseContents = document.querySelectorAll('.exercise-content');
const checkAnswerBtn = document.getElementById('check-answer');
const nextQuestionBtn = document.getElementById('next-question');
const checkBlankBtn = document.getElementById('check-blank');
const nextBlankBtn = document.getElementById('next-blank');
const checkMatchingBtn = document.getElementById('check-matching');
const nextMatchingBtn = document.getElementById('next-matching');
const checkListeningBtn = document.getElementById('check-listening');
const nextListeningBtn = document.getElementById('next-listening');
const playAudioBtn = document.getElementById('play-audio');
const completionModal = document.getElementById('completion-modal');
const reviewAnswersBtn = document.getElementById('review-answers');
const nextExerciseBtn = document.getElementById('next-exercise');

// Initialize exercises
function initExercises() {
    // Load exercise state from localStorage
    const savedState = localStorage.getItem('exerciseState');
    if (savedState) {
        exerciseState = JSON.parse(savedState);
    }
    
    // Set up event listeners
    setupExerciseEventListeners();
    
    // Load initial exercises
    loadMultipleChoiceExercise();
    loadFillBlanksExercise();
    loadMatchingExercise();
    loadListeningExercise();
    
    // Update progress bars
    updateProgressBars();
}

function setupExerciseEventListeners() {
    // Exercise tabs
    exerciseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchExerciseTab(tabId);
        });
    });
    
    // Multiple choice
    checkAnswerBtn.addEventListener('click', checkMultipleChoiceAnswer);
    nextQuestionBtn.addEventListener('click', nextMultipleChoiceQuestion);
    
    // Fill blanks
    checkBlankBtn.addEventListener('click', checkFillBlanksAnswer);
    nextBlankBtn.addEventListener('click', nextFillBlanksQuestion);
    
    // Matching
    checkMatchingBtn.addEventListener('click', checkMatchingAnswer);
    nextMatchingBtn.addEventListener('click', nextMatchingQuestion);
    
    // Listening
    checkListeningBtn.addEventListener('click', checkListeningAnswer);
    nextListeningBtn.addEventListener('click', nextListeningQuestion);
    playAudioBtn.addEventListener('click', playAudio);
    
    // Completion modal
    reviewAnswersBtn.addEventListener('click', reviewAnswers);
    nextExerciseBtn.addEventListener('click', nextExercise);
    
    // Option selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option')) {
            const optionsContainer = e.target.closest('.options');
            if (optionsContainer) {
                // Remove selected class from all options
                optionsContainer.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                e.target.classList.add('selected');
                
                // Enable check button if applicable
                const checkBtn = optionsContainer.closest('.exercise-content').querySelector('.btn-outline');
                if (checkBtn) {
                    checkBtn.disabled = false;
                }
            }
        }
    });
}

function switchExerciseTab(tabId) {
    // Update tabs
    exerciseTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
    
    // Update contents
    exerciseContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

// Multiple Choice Exercises
function loadMultipleChoiceExercise() {
    const currentIndex = exerciseState.currentExercise.multipleChoice;
    const exercise = exerciseData.multipleChoice[currentIndex];
    
    if (!exercise) {
        completeExercise('multipleChoice');
        return;
    }
    
    // Update question
    document.getElementById('multiple-choice-question').textContent = exercise.question;
    
    // Update options
    const optionsContainer = document.getElementById('multiple-choice-options');
    optionsContainer.innerHTML = '';
    
    exercise.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.innerHTML = `
            <input type="radio" name="multiple-choice" id="option-${index}">
            <label for="option-${index}">${option.text}</label>
        `;
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress
    document.getElementById('current-question').textContent = currentIndex + 1;
    document.getElementById('total-questions').textContent = exerciseData.multipleChoice.length;
    
    // Reset feedback and buttons
    document.getElementById('multiple-choice-feedback').className = 'exercise-feedback';
    checkAnswerBtn.disabled = true;
}

function checkMultipleChoiceAnswer() {
    const currentIndex = exerciseState.currentExercise.multipleChoice;
    const exercise = exerciseData.multipleChoice[currentIndex];
    const selectedOption = document.querySelector('#multiple-choice-options .option.selected');
    
    if (!selectedOption) {
        app.showNotification('Пожалуйста, выберите вариант ответа', 'error');
        return;
    }
    
    const selectedIndex = Array.from(document.querySelectorAll('#multiple-choice-options .option')).indexOf(selectedOption);
    const isCorrect = exercise.options[selectedIndex].correct;
    
    // Show feedback
    const feedback = document.getElementById('multiple-choice-feedback');
    feedback.textContent = isCorrect ? 'Правильно! Молодец!' : 'Неправильно. Попробуйте еще раз.';
    feedback.className = `exercise-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Update option styles
    document.querySelectorAll('#multiple-choice-options .option').forEach((option, index) => {
        if (exercise.options[index].correct) {
            option.classList.add('correct');
        } else if (option.classList.contains('selected') && !exercise.options[index].correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Record answer
    exerciseState.answers.multipleChoice[currentIndex] = {
        selected: selectedIndex,
        correct: isCorrect
    };
    
    // Update score
    if (isCorrect) {
        exerciseState.scores.multipleChoice++;
    }
    
    // Save state
    saveExerciseState();
    
    // Disable check button
    checkAnswerBtn.disabled = true;
}

function nextMultipleChoiceQuestion() {
    exerciseState.currentExercise.multipleChoice++;
    
    if (exerciseState.currentExercise.multipleChoice >= exerciseData.multipleChoice.length) {
        completeExercise('multipleChoice');
    } else {
        loadMultipleChoiceExercise();
        updateProgressBars();
    }
}

// Fill Blanks Exercises
function loadFillBlanksExercise() {
    const currentIndex = exerciseState.currentExercise.fillBlanks;
    const exercise = exerciseData.fillBlanks[currentIndex];
    
    if (!exercise) {
        completeExercise('fillBlanks');
        return;
    }
    
    // Update question
    document.getElementById('fill-blanks-question').textContent = exercise.question;
    
    // Clear input
    const input = document.getElementById('blank-input');
    input.value = '';
    input.className = '';
    
    // Update progress
    document.getElementById('current-blank').textContent = currentIndex + 1;
    document.getElementById('total-blanks').textContent = exerciseData.fillBlanks.length;
    
    // Reset feedback
    document.getElementById('fill-blanks-feedback').className = 'exercise-feedback';
}

function checkFillBlanksAnswer() {
    const currentIndex = exerciseState.currentExercise.fillBlanks;
    const exercise = exerciseData.fillBlanks[currentIndex];
    const input = document.getElementById('blank-input');
    const answer = input.value.trim().toLowerCase();
    
    if (!answer) {
        app.showNotification('Пожалуйста, введите ответ', 'error');
        return;
    }
    
    const isCorrect = answer === exercise.answer;
    
    // Show feedback
    const feedback = document.getElementById('fill-blanks-feedback');
    feedback.textContent = isCorrect ? 'Правильно! Молодец!' : `Неправильно. Правильный ответ: "${exercise.answer}"`;
    feedback.className = `exercise-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Update input style
    input.className = isCorrect ? 'correct' : 'incorrect';
    
    // Record answer
    exerciseState.answers.fillBlanks[currentIndex] = {
        answer: answer,
        correct: isCorrect
    };
    
    // Update score
    if (isCorrect) {
        exerciseState.scores.fillBlanks++;
    }
    
    // Save state
    saveExerciseState();
}

function nextFillBlanksQuestion() {
    exerciseState.currentExercise.fillBlanks++;
    
    if (exerciseState.currentExercise.fillBlanks >= exerciseData.fillBlanks.length) {
        completeExercise('fillBlanks');
    } else {
        loadFillBlanksExercise();
        updateProgressBars();
    }
}

// Matching Exercises
function loadMatchingExercise() {
    const currentIndex = exerciseState.currentExercise.matching;
    const exercise = exerciseData.matching[currentIndex];
    
    if (!exercise) {
        completeExercise('matching');
        return;
    }
    
    // Update matching pairs
    const pairsContainer = document.getElementById('matching-pairs');
    pairsContainer.innerHTML = '';
    
    // Shuffle pairs for the exercise
    const shuffledPairs = [...exercise.pairs].sort(() => Math.random() - 0.5);
    
    shuffledPairs.forEach(pair => {
        const pairElement = document.createElement('div');
        pairElement.className = 'matching-pair';
        pairElement.innerHTML = `
            <div class="matching-word">${pair.word}</div>
            <div class="matching-connector">→</div>
            <div class="matching-translation">
                <select class="matching-select">
                    <option value="">Выберите перевод</option>
                    ${exercise.pairs.map(p => `<option value="${p.translation}">${p.translation}</option>`).join('')}
                </select>
            </div>
        `;
        pairsContainer.appendChild(pairElement);
    });
    
    // Update progress
    document.getElementById('current-matching').textContent = currentIndex + 1;
    document.getElementById('total-matchings').textContent = exerciseData.matching.length;
    
    // Reset feedback
    document.getElementById('matching-feedback').className = 'exercise-feedback';
}

function checkMatchingAnswer() {
    const currentIndex = exerciseState.currentExercise.matching;
    const exercise = exerciseData.matching[currentIndex];
    const selectElements = document.querySelectorAll('.matching-select');
    
    let allCorrect = true;
    let answeredCount = 0;
    
    // Check each selection
    selectElements.forEach((select, index) => {
        const selectedValue = select.value;
        const correctTranslation = exercise.pairs[index].translation;
        
        if (selectedValue) {
            answeredCount++;
            
            if (selectedValue === correctTranslation) {
                select.classList.add('correct');
                select.classList.remove('incorrect');
            } else {
                select.classList.add('incorrect');
                select.classList.remove('correct');
                allCorrect = false;
            }
        } else {
            allCorrect = false;
        }
    });
    
    if (answeredCount < selectElements.length) {
        app.showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Show feedback
    const feedback = document.getElementById('matching-feedback');
    feedback.textContent = allCorrect ? 'Правильно! Молодец!' : 'Есть ошибки. Проверьте свои ответы.';
    feedback.className = `exercise-feedback ${allCorrect ? 'correct' : 'incorrect'}`;
    
    // Record answer
    exerciseState.answers.matching[currentIndex] = {
        answers: Array.from(selectElements).map(select => select.value),
        correct: allCorrect
    };
    
    // Update score
    if (allCorrect) {
        exerciseState.scores.matching++;
    }
    
    // Save state
    saveExerciseState();
}

function nextMatchingQuestion() {
    exerciseState.currentExercise.matching++;
    
    if (exerciseState.currentExercise.matching >= exerciseData.matching.length) {
        completeExercise('matching');
    } else {
        loadMatchingExercise();
        updateProgressBars();
    }
}

// Listening Exercises
function loadListeningExercise() {
    const currentIndex = exerciseState.currentExercise.listening;
    const exercise = exerciseData.listening[currentIndex];
    
    if (!exercise) {
        completeExercise('listening');
        return;
    }
    
    // Update question
    document.getElementById('listening-question').textContent = exercise.question;
    
    // Update options
    const optionsContainer = document.getElementById('listening-options');
    optionsContainer.innerHTML = '';
    
    exercise.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.innerHTML = `
            <input type="radio" name="listening" id="listening-option-${index}">
            <label for="listening-option-${index}">${option.text}</label>
        `;
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress
    document.getElementById('current-listening').textContent = currentIndex + 1;
    document.getElementById('total-listenings').textContent = exerciseData.listening.length;
    
    // Reset feedback and buttons
    document.getElementById('listening-feedback').className = 'exercise-feedback';
    checkListeningBtn.disabled = true;
    
    // Reset audio player
    const audioPlayer = document.querySelector('.audio-player');
    audioPlayer.classList.remove('playing');
    playAudioBtn.innerHTML = '<i class="fas fa-play"></i><span>Воспроизвести</span>';
}

function playAudio() {
    const audioPlayer = document.querySelector('.audio-player');
    const isPlaying = audioPlayer.classList.contains('playing');
    
    if (isPlaying) {
        // Stop audio
        audioPlayer.classList.remove('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-play"></i><span>Воспроизвести</span>';
    } else {
        // Play audio
        audioPlayer.classList.add('playing');
        playAudioBtn.innerHTML = '<i class="fas fa-pause"></i><span>Пауза</span>';
        
        // In a real app, this would play actual audio
        // For demo, we'll just simulate it
        app.showNotification('Аудио воспроизводится...', 'info');
    }
}

function checkListeningAnswer() {
    const currentIndex = exerciseState.currentExercise.listening;
    const exercise = exerciseData.listening[currentIndex];
    const selectedOption = document.querySelector('#listening-options .option.selected');
    
    if (!selectedOption) {
        app.showNotification('Пожалуйста, выберите вариант ответа', 'error');
        return;
    }
    
    const selectedIndex = Array.from(document.querySelectorAll('#listening-options .option')).indexOf(selectedOption);
    const isCorrect = exercise.options[selectedIndex].correct;
    
    // Show feedback
    const feedback = document.getElementById('listening-feedback');
    feedback.textContent = isCorrect ? 'Правильно! Вы хорошо расслышали.' : 'Неправильно. Попробуйте послушать еще раз.';
    feedback.className = `exercise-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Update option styles
    document.querySelectorAll('#listening-options .option').forEach((option, index) => {
        if (exercise.options[index].correct) {
            option.classList.add('correct');
        } else if (option.classList.contains('selected') && !exercise.options[index].correct) {
            option.classList.add('incorrect');
        }
    });
    
    // Record answer
    exerciseState.answers.listening[currentIndex] = {
        selected: selectedIndex,
        correct: isCorrect
    };
    
    // Update score
    if (isCorrect) {
        exerciseState.scores.listening++;
    }
    
    // Save state
    saveExerciseState();
    
    // Disable check button
    checkListeningBtn.disabled = true;
}

function nextListeningQuestion() {
    exerciseState.currentExercise.listening++;
    
    if (exerciseState.currentExercise.listening >= exerciseData.listening.length) {
        completeExercise('listening');
    } else {
        loadListeningExercise();
        updateProgressBars();
    }
}

// Common exercise functions
function updateProgressBars() {
    // Multiple choice
    const mcProgress = (exerciseState.currentExercise.multipleChoice / exerciseData.multipleChoice.length) * 100;
    document.getElementById('multiple-choice-progress').style.width = `${mcProgress}%`;
    
    // Fill blanks
    const fbProgress = (exerciseState.currentExercise.fillBlanks / exerciseData.fillBlanks.length) * 100;
    document.getElementById('fill-blanks-progress').style.width = `${fbProgress}%`;
    
    // Matching
    const mProgress = (exerciseState.currentExercise.matching / exerciseData.matching.length) * 100;
    document.getElementById('matching-progress').style.width = `${mProgress}%`;
    
    // Listening
    const lProgress = (exerciseState.currentExercise.listening / exerciseData.listening.length) * 100;
    document.getElementById('listening-progress').style.width = `${lProgress}%`;
}

function completeExercise(exerciseType) {
    // Calculate score
    const totalQuestions = exerciseData[exerciseType].length;
    const correctAnswers = exerciseState.scores[exerciseType];
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Update completion modal
    document.getElementById('completion-score').textContent = `${score}%`;
    document.getElementById('completion-time').textContent = '4:30'; // In a real app, this would be calculated
    document.getElementById('completion-xp').textContent = score * 2; // XP based on score
    
    // Show completion modal
    completionModal.classList.add('active');
    
    // Create confetti effect
    createConfetti();
    
    // Reset exercise state for next time
    exerciseState.currentExercise[exerciseType] = 0;
    exerciseState.scores[exerciseType] = 0;
    exerciseState.answers[exerciseType] = [];
    
    // Save state
    saveExerciseState();
    
    // Update dashboard if available
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

function createConfetti() {
    const colors = ['#4361ee', '#7209b7', '#f72585', '#4bb543', '#ffcc00'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 5}s`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

function reviewAnswers() {
    completionModal.classList.remove('active');
    // In a real app, this would show a review of all answers
    app.showNotification('Функция просмотра ответов в разработке', 'info');
}

function nextExercise() {
    completionModal.classList.remove('active');
    // Reload the first exercise of the current tab
    const activeTab = document.querySelector('.exercise-tab.active').getAttribute('data-tab');
    loadExerciseByType(activeTab);
}

function loadExerciseByType(exerciseType) {
    switch (exerciseType) {
        case 'multiple-choice':
            loadMultipleChoiceExercise();
            break;
        case 'fill-blanks':
            loadFillBlanksExercise();
            break;
        case 'matching':
            loadMatchingExercise();
            break;
        case 'listening':
            loadListeningExercise();
            break;
    }
}

function saveExerciseState() {
    localStorage.setItem('exerciseState', JSON.stringify(exerciseState));
}

// Make functions available globally
window.initExercises = initExercises;