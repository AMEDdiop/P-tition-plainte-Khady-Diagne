import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, increment, setDoc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let db: any = null;
let auth: any = null;
let isFirebaseEnabled = false;

const initFirebase = () => {
  try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "" && getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      auth = getAuth(app);
      isFirebaseEnabled = true;
    }
  } catch (e) {
    console.warn("Firebase init skip:", e);
  }
};

initFirebase();

export const getCounter = (callback: (count: number) => void) => {
  if (!isFirebaseEnabled || !db) {
    callback(0);
    return () => {};
  }

  const counterRef = doc(db, 'counters', 'supports');
  return onSnapshot(counterRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().count);
    } else {
      setDoc(counterRef, { count: 0 }).catch(console.error);
    }
  }, (error) => {
    console.error("Firestore Listen Error:", error);
    callback(0);
  });
};

async function hashEmail(email: string) {
  const msgUint8 = new TextEncoder().encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const checkEmailExists = async (email: string) => {
  if (!isFirebaseEnabled || !db) return false;
  const hashedId = await hashEmail(email);
  const supportRef = doc(db, 'supports', hashedId);
  const snap = await getDoc(supportRef);
  return snap.exists();
};

export const recordSupportWithEmail = async (email: string) => {
  if (!isFirebaseEnabled || !db) return { success: false, error: 'Serveur non configuré' };
  
  const cleanEmail = email.toLowerCase().trim();
  const hashedId = await hashEmail(cleanEmail);
  const supportRef = doc(db, 'supports', hashedId);
  const counterRef = doc(db, 'counters', 'supports');
  
  try {
    const snap = await getDoc(supportRef);
    if (snap.exists()) return { success: false, error: 'Cet email a déjà été utilisé.' };

    const batch = writeBatch(db);
    batch.set(supportRef, {
      email: cleanEmail,
      createdAt: serverTimestamp()
    });
    batch.update(counterRef, {
      count: increment(1)
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Support recording error:", error);
    return { success: false, error: 'Erreur de base de données. Veuillez réessayer.' };
  }
};

export { db, auth, isFirebaseEnabled };
