import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email?: string | null;
  role?: string | null;
  verified: boolean;
  blocked: boolean;
  createdAt?: any;
}

export const createProfile = async (userData: {
  id: string
  full_name?: string
  phone?: string
  email?: string
  role?: string
}): Promise<{ error: any }> => {
  try {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      full_name: userData.full_name || null,
      phone: userData.phone || null,
      email: userData.email || null,
      role: userData.role || 'user',
      verified: false,
      blocked: false,
      createdAt: serverTimestamp()
    }, { merge: true });

    return { error: null }
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return { error }
  }
}

export const getProfile = async (userId: string): Promise<{ data: Profile | null, error: any }> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { data: { id: userDoc.id, ...userDoc.data() } as Profile, error: null };
    }
    return { data: null, error: 'Profile not found' };
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<{ error: any }> => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    return { error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error }
  }
}
