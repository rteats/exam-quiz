class QuizDB {
    constructor() {
        this.dbName = 'MathQuizDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('questions')) {
                    db.createObjectStore('questions', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async storeQuestions(questions) {
        const transaction = this.db.transaction(['questions'], 'readwrite');
        const store = transaction.objectStore('questions');
        
        questions.forEach(question => {
            store.put(question);
        });

        return new Promise((resolve) => {
            transaction.oncomplete = () => resolve();
        });
    }

    async getQuestionsByCategory(categories) {
        const transaction = this.db.transaction(['questions'], 'readonly');
        const store = transaction.objectStore('questions');
        const request = store.getAll();

        return new Promise((resolve) => {
            request.onsuccess = () => {
                const questions = request.result.filter(q => 
                    categories.includes(q.category)
                );
                resolve(questions);
            };
        });
    }
}

export default QuizDB;