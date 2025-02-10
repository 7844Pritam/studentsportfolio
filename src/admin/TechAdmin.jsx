import React, { useState, useEffect } from "react";
import { SectionWrapper } from "../hoc";
import { db, storage,auth } from "../../firebase"; // Import Firebase instance
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore"; // Firebase functions
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage functions

const Tech = () => {
  const [technologies, setTechnologies] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [techName, setTechName] = useState("");
  const [techIcon, setTechIcon] = useState(null); // This will store the file object

  // Fetch Technologies from Firestore
  const currentUser = auth.currentUser; // Get current authenticated user

  // Fetch technologies specific to the current user
  const fetchTechnologies = async () => {
    if (!currentUser) {
      console.log('User is not logged in.');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'technologies'));
      const fetchedTechnologies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTechnologies(fetchedTechnologies);
    } catch (error) {
      console.error('Error fetching technologies: ', error);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, [currentUser]); // Refetch when the user changes or logs in

  // Handle File Selection for the technology icon
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTechIcon(file); // Store the file object
    }
  };

  // Handle Add/Edit Technology (submit form)
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (techIcon) {
      const storageRef = ref(storage, `technologies/${techIcon.name}`);
      const uploadTask = uploadBytesResumable(storageRef, techIcon);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // You can monitor the upload progress here
        },
        (error) => {
          console.error('Error uploading image: ', error);
        },
        async () => {
          // Once the upload is complete, get the image URL
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Proceed with adding or updating the technology
          await saveTechnology(imageUrl);
        }
      );
    } else {
      // If no new image, just proceed with saving
      await saveTechnology(imageUrl);
    }
  };

  // Save technology to Firestore (either add or update)
  const saveTechnology = async (imageUrl) => {
    if (selectedTech) {
      // Edit Technology
      const techRef = doc(db, 'users', currentUser.uid, 'technologies', selectedTech.id);
      await updateDoc(techRef, {
        name: techName,
        icon: imageUrl || selectedTech.icon, // Keep old icon if no new image
      });
    } else {
      // Add New Technology
      await addDoc(collection(db, 'users', currentUser.uid, 'technologies'), {
        name: techName,
        icon: imageUrl,
      });
    }

    // Close popup and refresh data
    setShowPopup(false);
    fetchTechnologies();
    setTechName('');
    setTechIcon(null);
  };

  // Handle Edit Technology
  const handleEdit = (technology) => {
    setSelectedTech(technology);
    setTechName(technology.name);
    setTechIcon(null); // Reset tech icon in case of editing
    setShowPopup(true);
  };

  // Handle Delete Technology
  const handleDelete = async (id) => {
    try {
      const techRef = doc(db, 'users', currentUser.uid, 'technologies', id);
      await deleteDoc(techRef);
      fetchTechnologies();
    } catch (error) {
      console.error('Error deleting technology: ', error);
    }
  };

  return (
    <div>
      {/* Technologies Display */}
      <div className="flex flex-row flex-wrap justify-center gap-10">
        {technologies.map((technology) => (
          <div className="w-28 h-28 flex flex-col items-center" key={technology.id}>
            <img
              src={technology.icon}
              alt={technology.name}
              className="w-full h-full object-contain"
            />
            <div className="text-white text-center mt-2">{technology.name}</div>
            <button onClick={() => handleEdit(technology)} className="mt-2 text-sm bg-blue-500 text-white py-1 px-2 rounded">
              Edit
            </button>
            <button onClick={() => handleDelete(technology.id)} className="mt-2 text-sm bg-red-500 text-white py-1 px-2 rounded">
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Button to Open Popup */}
      <button onClick={() => setShowPopup(true)} className="mt-5 bg-green-500 text-white py-2 px-4 rounded">
        Add Technology
      </button>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-xl mb-4">{selectedTech ? "Edit Technology" : "Add Technology"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="techName" className="block text-sm font-medium text-gray-700">Technology Name</label>
                <input
                  type="text"
                  id="techName"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="techIcon" className="block text-sm font-medium text-gray-700">Upload Icon</label>
                <input
                  type="file"
                  id="techIcon"
                  onChange={handleFileChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setShowPopup(false)} className="bg-gray-400 text-white py-1 px-4 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white py-1 px-4 rounded">
                  {selectedTech ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionWrapper(Tech, "tech");
