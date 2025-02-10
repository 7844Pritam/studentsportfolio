import React, { useState, useEffect } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";
import { db ,auth} from "../../firebase"; // Import firebase configuration
import { collection, getDocs } from "firebase/firestore"; // Firestore methods

import "react-vertical-timeline-component/style.min.css";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";

const ExperienceCard = ({ experience }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
      }}
      contentArrowStyle={{ borderRight: "7px solid  #232631" }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      icon={
        <div className='flex justify-center items-center w-full h-full'>
          <img
            src={experience.image} // Ensure this is the correct image URL or path from Firestore
            alt={experience.company_name}
            className='w-[60%] h-[60%] object-contain'
          />
        </div>
      }
    >
      <div>
        <h3 className='text-white text-[24px] font-bold'>{experience.title}</h3>
        <p
          className='text-secondary text-[16px] font-semibold'
          style={{ margin: 0 }}
        >
          {experience.company_name}
        </p>
      </div>

      <ul className='mt-5 list-disc ml-5 space-y-2'>
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className='text-white-100 text-[14px] pl-1 tracking-wider'
          >
            {point}
          </li>
        ))}
      </ul>
    </VerticalTimelineElement>
  );
};

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser; // Get the current authenticated user

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!currentUser) {
        console.log('User is not logged in.');
        setLoading(false); // Stop loading if the user is not logged in
        return;
      }

      try {
        // Reference to the user's experiences collection
        const experiencesRef = collection(db, 'users', currentUser.uid, 'experiences');
        const querySnapshot = await getDocs(experiencesRef);

        const experiencesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExperiences(experiencesData); // Set the fetched experiences data
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false); // Set loading to false after the fetch operation is done
      }
    };

    fetchExperiences();
  }, [currentUser]); // Re-fetch when the currentUser changes

  if (loading) {
    return <div>Loading...</div>; // Display loading text or spinner while fetching
  }


  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>
          What I have done so far
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Work Experience.
        </h2>
      </motion.div>

      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <div className='mt-20 flex flex-col'>
          <VerticalTimeline>
            {experiences.map((experience) => (
              <ExperienceCard
                key={`experience-${experience.id}`}
                experience={experience}
              />
            ))}
          </VerticalTimeline>
        </div>
      )}
    </>
  );
};

export default SectionWrapper(Experience, "work");
