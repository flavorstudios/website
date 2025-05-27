// Placeholder Firebase configuration
// This is a stub file to satisfy import requirements
// Actual Firebase implementation is handled separately by the backend team

// Placeholder database export to satisfy import requirements
export const db = {
  // Placeholder object - actual Firebase implementation handled separately
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: "placeholder" }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
    orderBy: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
    limit: () => ({
      get: () => Promise.resolve({ docs: [] }),
    }),
  }),
}

// Placeholder auth export if needed
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
}

// Placeholder app export if needed
export const app = {
  name: "placeholder-app",
}

export default {
  db,
  auth,
  app,
}
