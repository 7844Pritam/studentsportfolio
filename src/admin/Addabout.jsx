import React, { useState, useEffect } from 'react';
import { db, storage,auth } from '../../firebase';  
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc,query,where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const AdminPanel = () => {
  const [aboutText, setAboutText] = useState('');
  const [services, setServices] = useState([{ title: '', icon: null }]);
  const [existingServices, setExistingServices] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [message, setMessage] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [newTitle, setNewTitle] = useState(''); // Title input for the modal
  const [newIcon, setNewIcon] = useState(null); // File input for the modal


  // Fetch About Text and Existing Services
  useEffect(() => {
    const fetchAboutTextAndServices = async () => {
      try {
        const currentUser = auth.currentUser;
    
        if (!currentUser) {
          console.log("No user is currently logged in.");
          return;
        }
  
        // Fetch About Text (same as before)
        const aboutDocRef = doc(db, 'users', currentUser.uid, 'about', 'aboutText');
        const aboutDocSnap = await getDoc(aboutDocRef);
        if (aboutDocSnap.exists()) {
          setAboutText(aboutDocSnap.data().text);
        }
  
        // Fetch Services specific to current user
        const servicesQuery = query(
          collection(db, 'services'), 
          where("userId", "==", currentUser.uid) // Filter by userId
        );
        const servicesQuerySnapshot = await getDocs(servicesQuery);
        const servicesList = servicesQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        setExistingServices(servicesList);
      } catch (error) {
        console.error('Error fetching About Text or Services:', error);
      }
    };
  
    fetchAboutTextAndServices();
  }, []);
  


  const handleAboutTextChange = (e) => {
    setAboutText(e.target.value);
  };

  const handleTitleChange = (index, value) => {
    const updatedServices = [...services];
    updatedServices[index].title = value;
    setServices(updatedServices);
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    const updatedServices = [...services];
    updatedServices[index].icon = file;
    setServices(updatedServices);
  };



  const handleAddService = () => {
    setServices([...services, { title: '', icon: null }]);
  };




  const handleSave = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      setMessage("User is not authenticated.");
      return;
    }
  
    if (aboutText.trim() !== '') {
      try {
        const aboutDocRef = doc(db, 'users', user.uid, 'about', 'aboutText');
        await setDoc(aboutDocRef, { text: aboutText }, { merge: true });
      } catch (error) {
        console.error('Error saving About Text:', error);
        setMessage('Error saving About Text.');
        return;
      }
    }
  
    for (const service of services) {
      if (service.title.trim() === '' || !service.icon) {
        setMessage('Please fill in all fields for each service.');
        return;
      }
  
      try {
        const storageRef = ref(storage, `service_icons/${service.icon.name}`);
        const uploadTask = uploadBytesResumable(storageRef, service.icon);
  
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Error uploading image:', error);
            setMessage('Error uploading icon.');
          },
          async () => {
            const iconURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'services'), {
              title: service.title,
              icon: iconURL,
              userId: user.uid,  // Associate the service with the current user
            });
  
            const servicesQuery = await getDocs(collection(db, 'services'));
            const servicesList = servicesQuery.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
  
            setMessage('Service saved successfully!');
          }
        );
      } catch (error) {
        console.error('Error saving service:', error);
        setMessage('Error saving service.');
      }
    }
  };
  


  const handleEditService = (service) => {
    setEditingService(service);
    setNewTitle(service.title); // Set initial title in the modal
    setNewIcon(null); // Reset file input
    setShowModal(true);
  };

  const handleUpdateService = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      setMessage("User is not authenticated.");
      return;
    }
  
    try {
      const serviceDocRef = doc(db, 'services', editingService.id);
      const serviceDocSnap = await getDoc(serviceDocRef);
  
      if (!serviceDocSnap.exists()) {
        setMessage("Service not found.");
        return;
      }
  
      const serviceData = serviceDocSnap.data();
  
      // Ensure the service is owned by the current user
      if (serviceData.userId !== user.uid) {
        setMessage("You don't have permission to update this service.");
        return;
      }
  
      let iconURL = serviceData.icon; // If no new icon is uploaded, keep the current one
      if (newIcon) {
        const storageRef = ref(storage, `service_icons/${newIcon.name}`);
        const uploadTask = uploadBytesResumable(storageRef, newIcon);
  
        await uploadTask;
        iconURL = await getDownloadURL(uploadTask.snapshot.ref());
  
        // Delete old icon from Firebase Storage
        const oldIconRef = ref(storage, serviceData.icon);
        await deleteObject(oldIconRef);
      }
  
      // Update service in Firestore
      await setDoc(serviceDocRef, { title: newTitle, icon: iconURL }, { merge: true });
  
      const updatedServices = existingServices.map((service) =>
        service.id === editingService.id ? { ...service, title: newTitle, icon: iconURL } : service
      );
      setExistingServices(updatedServices);
  
      setMessage('Service updated successfully!');
    } catch (error) {
      console.error('Error updating service:', error);
      setMessage('Error updating service.');
    }
  };
  
  

  const handleDeleteService = async (serviceId, iconURL) => {
    const user = auth.currentUser;
  
    if (!user) {
      setMessage("User is not authenticated.");
      return;
    }
  
    try {
      // Get the service from Firestore to ensure it belongs to the current user
      const serviceDocRef = doc(db, 'services', serviceId);
      const serviceDocSnap = await getDoc(serviceDocRef);
  
      if (serviceDocSnap.exists()) {
        const serviceData = serviceDocSnap.data();
        if (serviceData.userId === user.uid) {
          // Only delete if the current user is the owner of the service
          const iconRef = ref(storage, iconURL);
          await deleteObject(iconRef);
  
          await deleteDoc(serviceDocRef);
  
          const updatedServices = existingServices.filter((service) => service.id !== serviceId);
          setExistingServices(updatedServices);
  
          setMessage('Service deleted successfully!');
        } else {
          setMessage("You don't have permission to delete this service.");
        }
      } else {
        setMessage("Service not found.");
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      setMessage('Error deleting service.');
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-5">
      <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Admin Panel</h2>

        {/* About Text Section */}
        <div className="mb-6">
          <textarea
            value={aboutText}
            onChange={handleAboutTextChange}
            disabled={!isEditable}
            className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={6}
            placeholder="Enter About Text"
          />
        </div>

        {/* Services Section */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Services</h3>
        {services.map((service, index) => (
          <div key={index} className="mb-6">
            <input
              type="text"
              value={service.title}
              onChange={(e) => handleTitleChange(index, e.target.value)}
              disabled={!isEditable}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              placeholder="Enter Service Title"
            />
            <input
              type="file"
              onChange={(e) => handleFileChange(index, e)}
              disabled={!isEditable}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        ))}

        <div className="mb-6">
          <button
            onClick={handleAddService}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
          >
            Add Another Service
          </button>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
          >
            Save All Changes
          </button>
          <button
            onClick={() => setIsEditable(!isEditable)}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none"
          >
            {isEditable ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Existing Services List */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Services</h3>
          {existingServices.length > 0 ? (
            <div>
              {existingServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="w-12 h-12 object-cover rounded-full mr-4"
                    />
                    <span className="text-lg font-semibold">{service.title}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id, service.icon)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No services found.</p>
          )}
        </div>

        {/* Feedback Message */}
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>

      {/* Modal for Editing Service */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Service</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              placeholder="Enter Service Title"
            />
            <input
              type="file"
              onChange={(e) => setNewIcon(e.target.files[0])}
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleUpdateService}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
              >
                Update Service
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
