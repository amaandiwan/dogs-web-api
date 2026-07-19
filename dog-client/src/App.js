import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/dogs';

function App() {
  const [dogs, setDogs] = useState([]);
  const [newBreed, setNewBreed] = useState('');
  const [subBreedsInput, setSubBreedsInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      const response = await axios.get(API_URL);
      setDogs(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBreed.trim()) return;

    const subBreedsArray = subBreedsInput
      ? subBreedsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      await axios.post(API_URL, { name: newBreed, subBreeds: subBreedsArray });
      setNewBreed('');
      setSubBreedsInput('');
      fetchDogs();
    } catch (error) {
      console.error('Error creating breed:', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { name: editName });
      setEditingId(null);
      fetchDogs();
    } catch (error) {
      console.error('Error updating breed:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this breed?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchDogs();
      } catch (error) {
        console.error('Error deleting breed:', error);
      }
    }
  };

  return (
    <div className="container">
      <h1> Dog Breeds Management Panel</h1>

      <form onSubmit={handleCreate} className="breed-form">
        <h3>Add New Breed</h3>
        <input 
          type="text" 
          placeholder="Breed Name (e.g., Terrier)" 
          value={newBreed} 
          onChange={(e) => setNewBreed(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Sub-breeds (comma separated: toy, yorkshire)" 
          value={subBreedsInput} 
          onChange={(e) => setSubBreedsInput(e.target.value)} 
        />
        <button type="submit">Add Breed</button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Breed</th>
              <th>Sub-Breeds</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map((dog) => (
              <tr key={dog.id}>
                <td>
                  {editingId === dog.id ? (
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                    />
                  ) : (
                    <strong className="breed-title">{dog.name}</strong>
                  )}
                </td>
                <td>
                  {dog.subBreeds.length > 0 ? (
                    <div className="tags">
                      {dog.subBreeds.map((sb, index) => (
                        <span key={index} className="tag">{sb}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="none">-</span>
                  )}
                </td>
                <td>
                  {editingId === dog.id ? (
                    <>
                      <button className="btn-save" onClick={() => handleUpdate(dog.id)}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-edit" onClick={() => { setEditingId(dog.id); setEditName(dog.name); }}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(dog.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;