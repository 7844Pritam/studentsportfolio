


import { getAuth } from "firebase/auth";  // Import Firebase Authentication

// Controller function to get the current user's ID
const getCurrentUserId = () => {
  const auth = getAuth();  // Get the Firebase authentication instance
  const user = auth.currentUser;  // Get the currently authenticated user

  if (user) {
    // If user is authenticated, return the user ID
    return user.uid;
  } else {
    // If no user is authenticated, return an error message or null
    console.log("No user is currently logged in.");
    return null;  // Or handle as needed (e.g., return a default value or throw an error)
  }
};

export default getCurrentUserId;
