import React, { useEffect, useState } from "react";
import { SectionWrapper } from "../hoc";
import { db,auth } from "../../firebase"; // Import your Firebase configuration
import { collection, getDocs } from "firebase/firestore"; // Firebase Firestore functions

const Tech = () => {
  const [technologies, setTechnologies] = useState([]); // State to store technologies
  const [loading, setLoading] = useState(true); // Loading state for fetching data
 const currentUser = auth.currentUser; // Get the current authenticated user
  // Fetch technologies from Firestore
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
                // const experiencesRef = collection(db, 'users', currentUser.uid, 'experiences');
        
        const querySnapshot = await getDocs(collection(db,'users',currentUser.uid, "technologies",));
        const fetchedTechnologies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTechnologies(fetchedTechnologies); // Set the fetched technologies in state
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching technologies: ", error);
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchTechnologies(); // Call the function to fetch data
  }, []); // Empty dependency array to run this only once

  // Display loading message while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((technology) => (
        <div className="w-28 h-28 flex flex-col items-center" key={technology.id}>
          <img
            src={technology.icon} // Use the icon URL for each technology
            alt={technology.name}  // Alt text based on the technology's name
            className="w-full h-full object-contain" // Ensures image fits well
          />
          <div className="text-white text-center mt-2">{technology.name}</div> {/* Display the technology's name */}
        </div>
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "");
