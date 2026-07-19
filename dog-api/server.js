const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/dogs', (req, res) => {
    const query = `
        SELECT b.id AS breed_id, b.name AS breed_name, s.name AS sub_breed_name
        FROM breeds b
        LEFT JOIN sub_breeds s ON b.id = s.breed_id
        ORDER BY b.name, s.name
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const dogMap = {};
        results.forEach(row => {
            if (!dogMap[row.breed_id]) {
                dogMap[row.breed_id] = { id: row.breed_id, name: row.breed_name, subBreeds: [] };
            }
            if (row.sub_breed_name) {
                dogMap[row.breed_id].subBreeds.push(row.sub_breed_name);
            }
        });
        
        res.json(Object.values(dogMap));
    });
});

app.post('/api/dogs', (req, res) => {
    const { name, subBreeds } = req.body;
    if (!name) return res.status(400).json({ error: 'Breed name is required' });

    db.query('INSERT INTO breeds (name) VALUES (?)', [name.toLowerCase()], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const breedId = result.insertId;

        if (subBreeds && subBreeds.length > 0) {
            const subBreedValues = subBreeds.map(sb => [breedId, sb.toLowerCase()]);
            db.query('INSERT INTO sub_breeds (breed_id, name) VALUES ?', [subBreedValues], (subErr) => {
                if (subErr) return res.status(500).json({ error: subErr.message });
                res.status(201).json({ id: breedId, name, subBreeds });
            });
        } else {
            res.status(201).json({ id: breedId, name, subBreeds: [] });
        }
    });
});

app.put('/api/dogs/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    db.query('UPDATE breeds SET name = ? WHERE id = ?', [name.toLowerCase(), id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Breed updated successfully' });
    });
});

app.delete('/api/dogs/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM breeds WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Breed deleted successfully' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));