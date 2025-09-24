import QuizDB from './db.js';
import questionsData from './questions.json' assert { type: 'json' };

class MathQuiz {
    constructor() {
        this.db = new QuizDB();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedCategories = ['arithmetic'];
        this.questions = [];
        this.currentQuestion = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.db.init();
            await this.loadQuestions();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async loadQuestions() {
        // Store questions in IndexedDB on first load
        await this.db.storeQuestions(questionsData.questions);
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedCategories.push(e.target.value);
                } else {
                    this.selectedCategories = this.selectedCategories.filter(
                        cat => cat !== e.target.value
                    );
                }
            });
        });

        // Start quiz
        document.getElementById('start-quiz').addEventListener('click', () => {
            this.startQuiz();
        });

        // Next question
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Restart quiz
        document.getElementById('restart-quiz').addEventListener('click', () => {
            this.showScreen('category-selection');
        });
    }

    async startQuiz() {
        if (this.selectedCategories.length === 0) {
            alert('Please select at least one category');
            return;
        }

        this.questions = await this.db.getQuestionsByCategory(this.selectedCategories);
        
        if (this.questions.length === 0) {
            alert('No questions found for selected categories');
            return;
        }

        this.shuffleArray(this.questions);
        this.currentQuestionIndex = 0;
        this.score = 0;

        this.showScreen('quiz-screen');
        this.displayQuestion();
    }

    displayQuestion() {
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Update UI
        document.getElementById('question-number').textContent = 
            `Question ${this.currentQuestionIndex + 1}/${this.questions.length}`;
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('question').textContent = this.currentQuestion.question;

        // Prepare answers
        const allAnswers = [
            this.currentQuestion.correctAnswer,
            ...this.currentQuestion.incorrectAnswers
        ];
        this.shuffleArray(allAnswers);

        // Display answers
        const answersContainer = document.getElementById('answers');
        answersContainer.innerHTML = '';
        
        allAnswers.forEach(answer => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer';
            answerElement.textContent = answer;
            answerElement.addEventListener('click', () => this.selectAnswer(answer));
            answersContainer.appendChild(answerElement);
        });

        document.getElementById('next-question').style.display = 'none';
    }

    selectAnswer(selectedAnswer) {
        const answers = document.querySelectorAll('.answer');
        const correctAnswer = this.currentQuestion.correctAnswer;

        answers.forEach(answer => {
            answer.style.pointerEvents = 'none';
            
            if (answer.textContent === correctAnswer) {
                answer.classList.add('correct');
            } else if (answer.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
                answer.classList.add('incorrect');
            }

            if (answer.textContent === selectedAnswer) {
                answer.classList.add('selected');
            }
        });

        if (selectedAnswer === correctAnswer) {
            this.score++;
            document.getElementById('score').textContent = `Score: ${this.score}`;
        }

        document.getElementById('next-question').style.display = 'block';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.showScreen('results-screen');
        document.getElementById('final-score').textContent = 
            `Your score: ${this.score}/${this.questions.length}`;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathQuiz();
});