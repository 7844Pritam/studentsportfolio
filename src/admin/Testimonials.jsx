import React, { useState, useEffect } from 'react';
import { db, storage,auth } from '../../firebase'; // Import Firebase
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Testimonials = () => {
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    testimonial: '',
    name: '',
    designation: '',
    company: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  
  // Fetch testimonials from Firestore
  const currentUser = auth.currentUser; // Get current authenticated user

  // Fetch testimonials specific to the current user
  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!currentUser) {
        console.log('User is not logged in.');
        return;
      }

      const querySnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'testimonials'));
      const testimonialsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestimonialsList(testimonialsData);
    };

    fetchTestimonials();
  }, [currentUser]); // Refetch when the user changes or logs in

  // Handle image file change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Upload image to Firebase Storage
  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `testimonials/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
      );
    });
  };

  // Add testimonial to Firestore
  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (newTestimonial.testimonial && newTestimonial.name && imageFile) {
      try {
        // Upload image and get the URL
        const imageUrl = await uploadImage(imageFile);

        // Add testimonial data to Firestore
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'testimonials'), {
          ...newTestimonial,
          image: imageUrl,
        });

        setTestimonialsList([...testimonialsList, { id: docRef.id, ...newTestimonial, image: imageUrl }]);
        setShowModal(false);
        setNewTestimonial({
          testimonial: '',
          name: '',
          designation: '',
          company: '',
          image: '',
        });
        setImageFile(null);
      } catch (error) {
        console.error('Error adding testimonial: ', error);
      }
    }
  };

  // Edit testimonial
  const handleEditTestimonial = async (e) => {
    e.preventDefault();
    if (newTestimonial.testimonial && newTestimonial.name) {
      try {
        const updatedData = { ...newTestimonial };
        if (imageFile) {
          const imageUrl = await uploadImage(imageFile);
          updatedData.image = imageUrl;
        }

        const projectRef = doc(db, 'users', currentUser.uid, 'testimonials', testimonialsList[editTestimonial].id);
        await updateDoc(projectRef, updatedData);

        setTestimonialsList(
          testimonialsList.map((testimonial, index) =>
            index === editTestimonial ? { ...testimonial, ...updatedData } : testimonial
          )
        );

        setShowModal(false);
        setNewTestimonial({
          testimonial: '',
          name: '',
          designation: '',
          company: '',
          image: '',
        });
        setImageFile(null);
        setEditTestimonial(null);
      } catch (error) {
        console.error('Error updating testimonial: ', error);
      }
    }
  };

  // Handle Delete
  const handleDeleteTestimonial = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'testimonials', id));
      setTestimonialsList(testimonialsList.filter((testimonial) => testimonial.id !== id));
    } catch (error) {
      console.error('Error deleting testimonial: ', error);
    }
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTestimonial({ ...newTestimonial, [name]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">Testimonials</h2>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonialsList.map((testimonial, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-md relative">
            <button
              onClick={() => handleDeleteTestimonial(testimonial.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setEditTestimonial(index);
                setNewTestimonial(testimonial);
                setShowModal(true);
              }}
              className="absolute top-2 right-20 text-yellow-500 hover:text-yellow-700"
            >
              Edit
            </button>

            <img
              src={testimonial.image}
              alt="User"
              className="w-16 h-16 rounded-full mx-auto"
            />
            <h3 className="text-xl font-semibold text-center mt-4">{testimonial.name}</h3>
            <p className="text-center text-gray-600">{testimonial.designation}</p>
            <p className="text-center text-gray-600">{testimonial.company}</p>
            <p className="text-center mt-4">{testimonial.testimonial}</p>
          </div>
        ))}
      </div>

      {/* Add New Testimonial Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
        >
          Add Testimonial
        </button>
      </div>

      {/* Modal for Add/Edit Testimonial */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              X
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editTestimonial !== null ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>
            <form
              onSubmit={editTestimonial !== null ? handleEditTestimonial : handleAddTestimonial}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Testimonial</label>
                <textarea
                  name="testimonial"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTestimonial.testimonial}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTestimonial.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTestimonial.designation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Company</label>
                <input
                  type="text"
                  name="company"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newTestimonial.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Image</label>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                  {editTestimonial !== null ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
