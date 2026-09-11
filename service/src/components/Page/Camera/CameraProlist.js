import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CameraProList.css';

const CameraProList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    image: null,
  });
  const [searchQuery, setSearchQuery] = useState(''); // State สำหรับคำค้นหา

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/projects`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewProject({ ...newProject, image: e.target.files[0] });
  };

  const handleAddProject = async () => {
    const formData = new FormData();
    formData.append('name', newProject.name);
    formData.append('description', newProject.description);
    formData.append('image', newProject.image);

    try {
      await axios.post(`${process.env.REACT_APP_API}/projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewProject({ name: '', description: '', image: null });
      setIsModalOpen(false);
      const response = await axios.get(`${process.env.REACT_APP_API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleImageClick = (projectId) => {
    navigate(`/projects/${projectId}/sites`);
  };

  // ฟังก์ชันสำหรับกรองโปรเจคตามชื่อที่ค้นหา
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="camera-pro-list">
      <div className='img-add'>
        <a href='/'>
          <img src="/imagenakub/home.png" alt="Home" />
        </a>
      </div>
      <center> <h2>Projects Intrusion</h2></center>

      {/* Input สำหรับค้นหา */}
      <center><input
        type="text"
        placeholder="Search by project name "
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      /> </center>

      <button className="add-project-button" onClick={() => setIsModalOpen(true)}>
        Add Project
      </button>

      <div className="project-container">
        {/* ใช้ filteredProjects แทน projects */}
        {filteredProjects.map((project) => (
          <div className="project-card" key={project._id}>
            <img
              src={`${process.env.REACT_APP_BASE_URL}/${project.imageUrl}`}
              alt={project.name}
              onClick={() => handleImageClick(project._id)}
            />
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Add New Project</h2>
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={newProject.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newProject.description}
              onChange={handleInputChange}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button onClick={handleAddProject}>Add Project</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraProList;
