// services/firebase.ts

// MUDANÇA AQUI: Using v8 compat libraries to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { INITIAL_HABITS, INITIAL_PROJECTS, INITIAL_BOOKS, INITIAL_DEVELOPMENT_DATA, INITIAL_AGENDA_EVENTS, INITIAL_GOALS } from '../constants';
import { Project, Book, Goal, Habit } from '../types';

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBieYuvEOV5BFPtpfEglju_lKKVav7fHhI",
  authDomain: "nexus-app-7ecbc.firebaseapp.com",
  databaseURL: "https://nexus-app-7ecbc-default-rtdb.firebaseio.com",
  projectId: "nexus-app-7ecbc",
  storageBucket: "nexus-app-7ecbc.firebasestorage.app",
  messagingSenderId: "537560947111",
  appId: "1:537560947111:web:8c3ea6c07a712e98e0fe82"
};

// Variáveis para armazenar as instâncias do Firebase
let app: firebase.app.App;
let database: firebase.database.Database;
let auth: firebase.auth.Auth;
let firebaseAvailable = false;

try {
  // Initialize Firebase
  if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
  } else {
      app = firebase.app();
  }
  database = firebase.database();
  auth = firebase.auth();
  firebaseAvailable = true;
  console.log('✅ Firebase SDK inicializado com sucesso (v8 compat).');
} catch (e) {
  console.error('❌ Falha ao inicializar o Firebase. Verifique a configuração.', e);
}


export const getInitialEcosystemData = () => {
    const data: any = {
        habits: {}, habitHistory: {},
        projects: {}, tasks: {},
        library: {}, bookNotes: {},
        goals: {}, milestones: {},
        developmentGraph: { nodes: {}, edges: {} },
        calendarEvents: {},
        dailyCheckins: {}
    };

    INITIAL_HABITS.forEach((h: Habit) => {
        const { history, ...habitData } = h;
        data.habits[h.id] = habitData;
        data.habitHistory[h.id] = {};
        history.forEach(entry => { data.habitHistory[h.id][entry.date] = entry.completed; });
    });

    INITIAL_PROJECTS.forEach((p: Project) => {
        const { tasks, ...projectData } = p;
        data.projects[p.id] = projectData;
        tasks.forEach(t => { data.tasks[t.id] = { ...t, projectId: p.id }; });
    });

    INITIAL_BOOKS.forEach((b: Book) => {
        const { notes, ...bookData } = b;
        data.library[b.id] = bookData;
        data.bookNotes[b.id] = {};
        notes.forEach(n => { data.bookNotes[b.id][n.id] = n; });
    });

    INITIAL_GOALS.forEach((g: Goal) => {
        const { milestones, ...goalData } = g;
        data.goals[g.id] = goalData;
        data.milestones[g.id] = {};
        milestones.forEach(m => { data.milestones[g.id][m.id] = m; });
    });
    
    INITIAL_DEVELOPMENT_DATA.nodes.forEach(n => { data.developmentGraph.nodes[n.id] = n; });
    INITIAL_DEVELOPMENT_DATA.edges.forEach(e => { data.developmentGraph.edges[e.id] = e; });
    INITIAL_AGENDA_EVENTS.forEach(e => { data.calendarEvents[e.id] = e; });

    return data;
}


class DataService {
  private userId: string | null = null;
  private onReadyCallbacks: (() => void)[] = [];
  public isReady = false;

  constructor() {
    if (firebaseAvailable) {
      this.listenToAuthChanges();
    }
  }

  private listenToAuthChanges() {
    auth.onAuthStateChanged(async user => {
      if (user) {
        this.userId = user.uid;
        this.isReady = true;
        console.log(`✅ Usuário autenticado: ${this.userId}`);
        await this.checkAndCreateUserProfile();
        this.onReadyCallbacks.forEach(cb => cb());
        this.onReadyCallbacks = [];
      } else {
        this.userId = null;
        this.isReady = false;
        console.log('🚪 Usuário deslogado.');
      }
    });
  }

  private async checkAndCreateUserProfile() {
      if(!this.userId) return;
      const userRef = database.ref(`users/${this.userId}/profile`);
      const snapshot = await userRef.get();
      if(!snapshot.exists()) {
          console.log(`🌱 Novo usuário. Criando perfil inicial...`);
          const initialProfile = { 
              email: auth.currentUser?.email || 'dev@eixo.os',
              createdAt: new Date().toISOString(),
              onboardingCompleted: false
          };
          await this.setData('profile', initialProfile);
      }
  }
  
  private whenReady(callback: () => void) {
      if (this.isReady && this.userId) {
          callback();
      } else {
          this.onReadyCallbacks.push(callback);
      }
  }

  // --- MÉTODOS DE AUTENTICAÇÃO ---

  public onAuthStateChange(callback: (user: firebase.User | null) => void): () => void {
    if (!firebaseAvailable) return () => {};
    return auth.onAuthStateChanged(callback);
  }

  public async signUpWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return userCredential;
  }

  public async signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return auth.signInWithEmailAndPassword(email, password);
  }
  
  public async signInAnonymously(): Promise<firebase.auth.UserCredential> {
    return auth.signInAnonymously();
  }

  public async signOut(): Promise<void> {
    return auth.signOut();
  }

  // --- MÉTODOS DE DADOS EM TEMPO REAL ---

  public onDataChange(path: string, callback: (data: any) => void): () => void {
    if (!firebaseAvailable) return () => {};

    let dataRef: firebase.database.Reference;
    const listener = (snapshot: firebase.database.DataSnapshot) => {
        const data = snapshot.val();
        callback(data || null);
    };

    this.whenReady(() => {
        if (!this.userId) return;
        dataRef = database.ref(`users/${this.userId}/${path}`);
        dataRef.on('value', listener);
    });

    return () => {
        if(dataRef) {
            dataRef.off('value', listener);
        }
    };
  }

  // --- MÉTODOS DE ESCRITA (CRUD) ---

  public async getData(path: string): Promise<any> {
    return new Promise(resolve => {
        this.whenReady(async () => {
            if (!this.userId || !firebaseAvailable) {
                resolve(null);
                return;
            };
            const dataRef = database.ref(`users/${this.userId}/${path}`);
            const snapshot = await dataRef.get();
            resolve(snapshot.val());
        });
    });
  }

  public async setData(path: string, data: any) {
    this.whenReady(async () => {
        if (!this.userId || !firebaseAvailable) return;
        const dataRef = database.ref(`users/${this.userId}/${path}`);
        await dataRef.set(data);
    });
  }

  public async updateData(path: string, data: any) {
    this.whenReady(async () => {
        if (!this.userId || !firebaseAvailable) return;
        const dataRef = database.ref(`users/${this.userId}/${path}`);
        await dataRef.update(data);
    });
  }

  public getNewId(path: string) {
    if (!this.userId || !firebaseAvailable) return null;
    const listRef = database.ref(`users/${this.userId}/${path}`);
    return listRef.push().key;
  }

  public async addToList(path: string, data: any): Promise<string | null> {
    return new Promise<string | null>(resolve => {
        this.whenReady(async () => {
            if (!this.userId || !firebaseAvailable) {
                resolve(null);
                return;
            };
            const listRef = database.ref(`users/${this.userId}/${path}`);
            const newItemRef = listRef.push();
            const newId = newItemRef.key;
            await newItemRef.set({ ...data, id: newId });
            resolve(newId);
        });
    });
  }
  
  public async removeData(path: string) {
    this.whenReady(async () => {
        if (!this.userId || !firebaseAvailable) return;
        const dataRef = database.ref(`users/${this.userId}/${path}`);
        await dataRef.remove();
    });
  }
}

export const dataService = new DataService();

export const backupService = {
    async backupAll(): Promise<void> {
        console.warn("Backup feature not fully implemented for Firebase.");
        return Promise.resolve();
    },
    async restore(): Promise<any | null> {
        console.warn("Restore feature not fully implemented for Firebase.");
        return Promise.resolve(null);
    }
};