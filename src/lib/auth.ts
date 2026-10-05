import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase";

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  department?: string;
  semester?: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function registerUser(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = credential.user;

  await setDoc(doc(db, "users", user.uid), {
    ...profile,
    uid: user.uid,
    email: user.email ?? email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return credential.user;
}

export async function getUserProfile(
  user: User,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", user.uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export function subscribeToAuth(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}

export async function logoutUser() {
  await signOut(auth);
}