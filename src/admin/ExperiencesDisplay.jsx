import React, { useState, useEffect } from "react";
import { db, storage,auth } from "../../firebase"; 
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdWork, MdEdit, MdDelete, MdAdd } from "react-icons/md"; 
import "react-vertical-timeline-component/style.min.css";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";

// ExperienceFormModal Component
const ExperienceFormModal = ({ isOpen, closeModal, experienceToEdit }) => {
  const [experience, setExperience] = useState({
    title: "",
    company_name: "",
    date: "",
    points: ["", "", "", ""],
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);

  const currentUser = auth.currentUser; // Get the current authenticated user

  // Sync the form state with the experienceToEdit prop
  useEffect(() => {
    if (experienceToEdit) {
      setExperience(experienceToEdit);
    }
  }, [experienceToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExperience({ ...experience, [name]: value });
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...experience.points];
    newPoints[index] = value;
    setExperience({ ...experience, points: newPoints });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to add or edit experiences.");
      return;
    }

    let imageUrl = experience.image;

    // Upload image if a new one is selected
    if (imageFile) {
      const storageRef = ref(storage, `users/${currentUser.uid}/experiences/${Date.now()}-${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(uploadResult.ref); // Get the image URL after uploading
    }

    if (experienceToEdit) {
      // Editing an existing experience
      const experienceRef = doc(db, "users", currentUser.uid, "experiences", experienceToEdit.id);
      await updateDoc(experienceRef, { ...experience, image: imageUrl });
      alert("Experience updated successfully!");
    } else {
      // Adding a new experience
      await addDoc(collection(db, "users", currentUser.uid, "experiences"), { ...experience, image: imageUrl });
      alert("Experience added successfully!");
    }

    closeModal();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? "block" : "hidden"}`}>
      <div className="bg-white p-6 rounded-md w-96">
        <h3 className="text-2xl font-bold mb-4">{experienceToEdit ? "Edit Experience" : "Add Experience"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block">Title</label>
            <input
              type="text"
              name="title"
              value={experience.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={experience.company_name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block">Date</label>
            <input
              type="text"
              name="date"
              value={experience.date}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block">Points</label>
            {experience.points.map((point, index) => (
              <input
                key={index}
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                placeholder={`Point ${index + 1}`}
              />
            ))}
          </div>
          <div className="mb-4">
            <label className="block">Company Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {imageFile && <p className="mt-2 text-sm text-gray-500">{imageFile.name}</p>}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              {experienceToEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ExperiencesDisplay Component
const ExperiencesDisplay = () => {
  const [experiences, setExperiences] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState(null);

  const currentUser = auth.currentUser; // Get the current authenticated user

  // Fetch experiences specific to the current user
  useEffect(() => {
    const fetchExperiences = async () => {
      if (!currentUser) {
        console.log("User is not logged in.");
        return;
      }

      const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "experiences"));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setExperiences(data);
    };

    fetchExperiences();
  }, [currentUser]); // Refetch when the user changes or logs in

  // Handle delete experience
  const handleDelete = async (id) => {
    if (!currentUser) {
      alert("You must be logged in to delete experiences.");
      return;
    }

    await deleteDoc(doc(db, "users", currentUser.uid, "experiences", id));
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  // Handle edit experience
  const handleEdit = (experience) => {
    setExperienceToEdit(experience);
    setIsModalOpen(true);
  };

  // Handle add new experience
  const handleAdd = () => {
    setExperienceToEdit(null); // Clear the form for adding a new experience
    setIsModalOpen(true);
  };
  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">Work Experience</h2>
      <div className="text-right mb-4">
        <button
          onClick={handleAdd}
          className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          <MdAdd size={30} />
        </button>
      </div>
      <VerticalTimeline>
        {experiences.map((experience) => (
          <VerticalTimelineElement
            key={experience.id}
            date={experience.date}
            iconStyle={{ background: "#61B8D8", color: "#fff" }}
            icon={<MdWork />}
          >
            <h3 className="text-lg font-bold">{experience.title}</h3>
            <p className="text-sm text-gray-500">{experience.company_name}</p>
            
            {experience.image && (
              <img src={experience.image} alt="Company Logo" className="mt-2 w-16 h-16 object-cover rounded-full" />
            )}

            <ul className="mt-3 space-y-2">
              {experience.points.map((point, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {point}
                </li>
              ))}
            </ul>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(experience)}
                className="flex items-center text-sm text-blue-500 hover:text-blue-600"
              >
                <MdEdit className="mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDelete(experience.id)}
                className="flex items-center text-sm text-red-500 hover:text-red-600"
              >
                <MdDelete className="mr-1" /> Delete
              </button>
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

      {/* Modal for adding/editing experiences */}
      <ExperienceFormModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        experienceToEdit={experienceToEdit}
      />
    </div>
  );
};

export default ExperiencesDisplay;
