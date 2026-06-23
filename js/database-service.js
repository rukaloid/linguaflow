import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

class DatabaseService {
    constructor() {
        this.currentUser = null;
        this.auth = auth;
        this.db = db;
    }

    // Регистрация
    async registerUser(email, password, name, selectedLanguage) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            const userData = {
                uid: user.uid,
                email: email,
                name: name,
                selectedLanguage: selectedLanguage,
                registeredAt: new Date().toISOString(),
                stats: {
                    streakDays: 0,
                    accuracy: 0,
                    wordsLearned: 0,
                    currentLevel: 'A1',
                    totalPoints: 0,
                    lastActive: new Date().toISOString()
                },
                settings: { notifications: true, theme: 'light', dailyGoal: 15 },
                banned: false,
                role:'user'
            };
            await setDoc(doc(this.db, 'users', user.uid), userData);
            
            const progressData = {
                userId: user.uid,
                exercises: {
                    multipleChoice: { completed: 0, correct: 0, lastScore: 0 },
                    fillBlanks: { completed: 0, correct: 0, lastScore: 0 },
                    matching: { completed: 0, correct: 0, lastScore: 0 },
                    listening: { completed: 0, correct: 0, lastScore: 0 }
                },
                vocabulary: [],
                activities: [],
                updatedAt: new Date().toISOString()
            };
            await setDoc(doc(this.db, 'userProgress', user.uid), progressData);
            
            const achievementsData = {
                userId: user.uid,
                earnedAchievements: [],
                totalPoints: 0,
                lastAchievementAt: null
            };
            await setDoc(doc(this.db, 'achievements', user.uid), achievementsData);
            
            this.currentUser = user;
            return { success: true, user };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }

    // Вход
    async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            this.currentUser = userCredential.user;
            const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
            const progressDoc = await getDoc(doc(this.db, 'userProgress', this.currentUser.uid));
            const achievementsDoc = await getDoc(doc(this.db, 'achievements', this.currentUser.uid));
            return {
                success: true,
                user: userDoc.data(),
                progress: progressDoc.data(),
                achievements: achievementsDoc.data()
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Выход
    async logoutUser() {
        try {
            await signOut(this.auth);
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Сохранение прогресса упражнения
    async saveExerciseProgress(exerciseType, score, isCorrect, timeSpent) {
        if (!this.currentUser) return { success: false, error: 'Not logged in' };
        try {
            const progressRef = doc(this.db, 'userProgress', this.currentUser.uid);
            const progressDoc = await getDoc(progressRef);
            const current = progressDoc.data();
            const oldStats = current.exercises[exerciseType];
            const newCompleted = oldStats.completed + 1;
            const newCorrect = oldStats.correct + (isCorrect ? 1 : 0);
            const updatedExercises = { ...current.exercises, [exerciseType]: { completed: newCompleted, correct: newCorrect, lastScore: score } };
            const newActivity = { type: 'exercise', exerciseType, score, isCorrect, timestamp: new Date().toISOString(), timeSpent };
            const updatedActivities = [newActivity, ...(current.activities || [])].slice(0, 50);
            await updateDoc(progressRef, { exercises: updatedExercises, activities: updatedActivities, updatedAt: new Date().toISOString() });
            
            // Обновить общую статистику пользователя
            await this.updateUserStats(isCorrect, score);
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }

    async updateUserStats(isCorrect, score) {
        const userRef = doc(this.db, 'users', this.currentUser.uid);
        const userDoc = await getDoc(userRef);
        const data = userDoc.data();
        const newAccuracy = data.stats.accuracy === 0 ? score : Math.round((data.stats.accuracy + score) / 2);
        const lastActive = new Date(data.stats.lastActive);
        const today = new Date();
        const diff = Math.floor((today - lastActive) / (1000*60*60*24));
        let newStreak = data.stats.streakDays;
        if (diff === 1) newStreak++;
        else if (diff === 0) {}
        else newStreak = 1;
        await updateDoc(userRef, { 'stats.accuracy': newAccuracy, 'stats.streakDays': newStreak, 'stats.lastActive': today.toISOString() });
    }

    async getUserData() {
        if (!this.currentUser) return null;
        const userDoc = await getDoc(doc(this.db, 'users', this.currentUser.uid));
        const progressDoc = await getDoc(doc(this.db, 'userProgress', this.currentUser.uid));
        const achievementsDoc = await getDoc(doc(this.db, 'achievements', this.currentUser.uid));
        return { user: userDoc.data(), progress: progressDoc.data(), achievements: achievementsDoc.data() };
    }

    // Административные методы
    async isAdmin(uid) {
        const adminDoc = await getDoc(doc(this.db, 'admins', uid));
        return adminDoc.exists();
    }

    async getAllUsers() {
        const q = query(collection(this.db, 'users'), orderBy('registeredAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

export default DatabaseService;