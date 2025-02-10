import React, { useState, useEffect } from "react";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { db,auth } from "../../firebase"; 
import { doc, getDoc, getDocs, collection,query,where } from "firebase/firestore"; // Correct Firestore functions
import { motion } from "framer-motion"; // Import motion for animations

const ServiceCard = ({ index, title, icon }) => (
  <motion.div
    className="w-full"
    initial={{ opacity: 0, y: 20 }} // Initial position and opacity
    animate={{ opacity: 1, y: 0 }}   // Final position and opacity
    transition={{ duration: 0.5, delay: index * 0.1 }} // Delay for staggered effect
  >
    <div className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card">
      <div className="bg-secondary/70 rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
        <img
          src={icon}
          alt="web-development"
          className="w-24 p-3 rounded-full bg-white h-24 object-contain"
        />
        <h3 className="text-white text-[20px] font-bold text-center">
          {title}
        </h3>
      </div>
    </div>
  </motion.div>
);

const About = () => {
  const [aboutText, setAboutText] = useState(''); // State to store About Text
  const [services, setServices] = useState([]);   // State to store services

  const currentUser = auth.currentUser; // Get the current authenticated user

  // Fetch About Text - User Specific
  useEffect(() => {
    const fetchAboutText = async () => {
      if (!currentUser) {
        console.log('User is not logged in.');
        return;
      }

      try {
        // Reference to the user's About Text document
        const aboutDocRef = doc(db, 'users', currentUser.uid, 'about', 'aboutText');
        const aboutDocSnap = await getDoc(aboutDocRef);   // Fetch the document

        if (aboutDocSnap.exists()) {
          setAboutText(aboutDocSnap.data().text); // Set the fetched About Text
        } else {
          console.log('No About Text document found!');
        }
      } catch (error) {
        console.error('Error fetching About Text:', error);
      }
    };

    fetchAboutText();
  }, [currentUser]); // Re-fetch if the user changes

  // Fetch Services - User Specific
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentUser) {
        console.log('User is not logged in.');
        return;
      }

      try {
        const servicesRef = query(collection(db, 'services'), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(servicesRef); // Fetch the services documents

        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServices(servicesList); // Set the fetched services data
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [currentUser]); // Re-fetch if the user changes
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} // Initial opacity
        animate={{ opacity: 1 }}  // Final opacity
        transition={{ duration: 0.5 }} // Transition duration for fade-in
      >
        <div>
          <p className={styles.sectionSubText}>Introduction</p>
          <h2 className={styles.sectionHeadText}>Overview.</h2>
        </div>

        {/* Display About Text with animation */}
        <motion.p
          className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }} // Fade-in effect for about text
        >
          {aboutText || "Loading..."} {/* Display the fetched About Text */}
        </motion.p>

        {/* Service Cards with animation */}
        <motion.div
          className="mt-20 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }} // Staggered fade-in for the service cards
        >
          {services.map((service, index) => (
            <ServiceCard key={service.id} index={index} {...service} />
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export default SectionWrapper(About, "about");
