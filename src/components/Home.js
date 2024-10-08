import React, { useState, useContext, useEffect } from 'react';
import '../css/Home.css';
import Note from './Notes'; // Import Note component
import Alert from './Alert'; // Import Alert component
import NoteContext from '../context/notes/noteContext'; 
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const { notes, deleteNote } = useContext(NoteContext); // Get notes and deleteNote from context
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [alert, setAlert] = useState(null); // State to control the alert
  const [username, setUsername] = useState(''); // State for username
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status

  // Show alert with a message and type (success or error)
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // Auto dismiss after 3 seconds
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false); // If no token, user is not logged in
      return;
    }

    try {
      const response = await axios.post('https://inotebook-vusl.onrender.com/api/auth/getuser', {}, {
        headers: {
          'auth-token': token
        }
      });
      setUsername(response.data.name); // Assuming response contains user object with name property
      setIsLoggedIn(true); // User is logged in
    } catch (error) {
      console.error("Error fetching user details:", error);
      setIsLoggedIn(false); // If error occurs, user is not logged in
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Fetch username when the component mounts
  }, []);

  // Define filteredNotes by filtering notes based on searchQuery
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteClick = (index) => {
    setSelectedNoteIndex(index);
  };

  const handleDeleteNote = (id) => {
    deleteNote(id); // Use deleteNote from context
    showAlert('Note deleted successfully', 'error'); // Trigger delete alert
    if (selectedNoteIndex !== null && notes[selectedNoteIndex]._id === id) {
      setSelectedNoteIndex(null);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="home-container">
      {/* Display Alert */}
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
        <h3 className="list-title">{username ? `${username}'s Notes` : 'Your Notes'}</h3> {/* Display the username */}
        <div className="search-container">
          <FontAwesomeIcon className="search-icon" icon={faSearch} />
          <input
            className="search-input"
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredNotes.length === 0 ? (
          <p className="no-notes-message">No notes found</p>
        ) : (
          <ul className="notes-list">
            {filteredNotes.map((note, index) => (
              <li
                key={note._id}
                className={`note-item ${selectedNoteIndex === index ? 'selected-note' : ''}`}
                onClick={() => handleNoteClick(index)}
              >
                <div className="note-header">
                  <span className="note-title">
                    {note.title.length > 20 ? `${note.title.slice(0, 17)}...` : note.title || 'Untitled'}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id); // Use the note's ID for deletion
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <span className="note-tag">{note.tag}</span>{/* Display tag */}
                <span className="note-date">{note.date}</span> {/* Display date */}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`notes-section ${sidebarVisible ? '' : 'expanded'}`}>
        <Note
          selectedNoteIndex={selectedNoteIndex}
          setSelectedNoteIndex={setSelectedNoteIndex}
          showAlert={showAlert} // Pass showAlert to Note
          toggleSidebar={toggleSidebar} // Pass toggleSidebar to Note
          isLoggedIn={isLoggedIn} // Pass isLoggedIn to Note
        />
      </div>
    </div>
  );
};

export default Home;
