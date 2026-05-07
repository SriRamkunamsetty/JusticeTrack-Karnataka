import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export let adminAuth: any = null;
export let adminDb: any = null;
export let adminStorage: any = null;

try {
    if (!getApps().length) {
        if (process.env.FIREBASE_PROJECT_ID) {
            initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        } else {
            // Fallback for development if no service account provided
            initializeApp();
        }
    }
    adminAuth = getAuth();
    adminDb = getFirestore();
    adminStorage = getStorage();
} catch (error) {
    console.warn("Firebase Admin Initialization Warning:", error);
    // Provide a mocked error-throwing auth context to allow the server to start safely
    adminAuth = {
        verifyIdToken: async () => { throw new Error("Firebase Admin not configured yet."); }
    };
}
