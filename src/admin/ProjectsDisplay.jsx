import React, { useEffect, useState } from "react";
import { db,auth } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { MdClose } from "react-icons/md"; // Import React Icon

const ProjectsDisplay = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    githubLink: "",
    liveDemoLink: "",
    tags: [], // Add tags field as an array
    imageUrl: "", // For storing image URL
  });
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [imageFile, setImageFile] = useState(null); // To store the selected image file
  const [tagInput, setTagInput] = useState(""); // To handle tag input field
  const storage = getStorage(); // Initialize Firebase Storage

  const currentUser = auth.currentUser; // Get the current authenticated user

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      if (currentUser) {
        const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "projects"));
        const projectsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProjects(projectsData);
      }
    };

    fetchProjects();
  }, [currentUser]);

  // Handle image upload to Firebase Storage
  const handleImageUpload = async () => {
    if (!imageFile) return;

    const storageRef = ref(storage, `project-screenshots/${currentUser.uid}/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  };

  // Handle form submission for adding a project
  const handleAddProject = async (e) => {
    e.preventDefault();

    if (newProject.name && newProject.description) {
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await handleImageUpload();
      }

      const docRef = await addDoc(collection(db, "users", currentUser.uid, "projects"), { ...newProject, imageUrl });
      setProjects([...projects, { id: docRef.id, ...newProject, imageUrl }]);
      setNewProject({ name: "", description: "", githubLink: "", liveDemoLink: "", tags: [], imageUrl: "" });
      setImageFile(null); // Reset the image file
      setTagInput(""); // Reset the tag input
      setShowModal(false);
    }
  };

  // Handle form submission for editing a project
  const handleEditProject = async (e) => {
    e.preventDefault();

    if (editProject.name && editProject.description) {
      let imageUrl = editProject.imageUrl;

      if (imageFile) {
        imageUrl = await handleImageUpload(); // Upload new image if provided
      }

      const projectRef = doc(db, "users", currentUser.uid, "projects", editProject.id);
      await updateDoc(projectRef, { ...editProject, imageUrl });

      setProjects(projects.map((project) => (project.id === editProject.id ? { ...editProject, imageUrl } : project)));
      setEditProject(null);
      setImageFile(null); // Reset image file
      setTagInput(""); // Reset tag input
      setShowModal(false);
    }
  };

  // Handle delete project
  const handleDeleteProject = async (id) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "projects", id));
    setProjects(projects.filter((project) => project.id !== id));
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !newProject.tags.includes(tagInput.trim())) {
      setNewProject({ ...newProject, tags: [...newProject.tags, tagInput.trim()] });
      setTagInput(""); // Reset the tag input after adding
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag) => {
    setNewProject({ ...newProject, tags: newProject.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">Projects</h2>

      {/* Plus Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all"
        >
          +
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="p-4 bg-white rounded-lg shadow-md relative">
            <button
              onClick={() => handleDeleteProject(project.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setEditProject(project);
                setShowModal(true);
              }}
              className="absolute top-2 right-20 text-yellow-500 hover:text-yellow-700"
            >
              Edit
            </button>
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-gray-600">{project.description}</p>

            {/* Display tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">Tags: </span>
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4">
              <a
                href={project.githubLink}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Link
              </a>
              <br />
              <a
                href={project.liveDemoLink}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo
              </a>
            </div>

            {/* Display screenshot image */}
            {project.imageUrl && (
              <img src={project.imageUrl} alt="Project Screenshot" className="mt-4 w-full h-48 object-cover rounded-md" />
            )}
          </div>
        ))}
      </div>

      {/* Modal for Add/Edit Project */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">{editProject ? "Edit Project" : "Add New Project"}</h3>
            <form onSubmit={editProject ? handleEditProject : handleAddProject}>
              <div className="mb-4">
                <label className="block text-gray-700">Project Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editProject ? editProject.name : newProject.name}
                  onChange={(e) =>
                    editProject
                      ? setEditProject({ ...editProject, name: e.target.value })
                      : setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editProject ? editProject.description : newProject.description}
                  onChange={(e) =>
                    editProject
                      ? setEditProject({ ...editProject, description: e.target.value })
                      : setNewProject({ ...newProject, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">GitHub Link</label>
                <input
                  type="url"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editProject ? editProject.githubLink : newProject.githubLink}
                  onChange={(e) =>
                    editProject
                      ? setEditProject({ ...editProject, githubLink: e.target.value })
                      : setNewProject({ ...newProject, githubLink: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Live Demo Link</label>
                <input
                  type="url"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editProject ? editProject.liveDemoLink : newProject.liveDemoLink}
                  onChange={(e) =>
                    editProject
                      ? setEditProject({ ...editProject, liveDemoLink: e.target.value })
                      : setNewProject({ ...newProject, liveDemoLink: e.target.value })
                  }
                />
              </div>

              {/* Tags Input */}
              <div className="mb-4">
                <label className="block text-gray-700">Tags</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-500 text-white p-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2">
                  {newProject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="mb-4">
                <label className="block text-gray-700">Upload Screenshot</label>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                  {editProject ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDisplay;
