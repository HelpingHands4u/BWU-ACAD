import {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
} from "./firebase";

declare global {
  interface Window {
    bwuFirebase: {
      auth: typeof auth;
      db: typeof db;
      signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
      signOut: typeof signOut;
      doc: typeof doc;
      getDoc: typeof getDoc;
    };
  }
}

window.bwuFirebase = {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
};

export {};