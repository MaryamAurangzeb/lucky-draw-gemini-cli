const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// API to register a participant
app.post('/register', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const sql = `INSERT INTO participants (name, email) VALUES (?, ?)`;
    db.run(sql, [name, email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ success: false, message: 'Email already registered' });
            }
            return res.status(500).json({ success: false, message: 'Database error.', error: err.message });
        }
        res.status(201).json({ success: true, message: 'Successfully registered!', participantId: this.lastID });
    });
});

// API to get all participants
app.get('/participants', (req, res) => {
    const sql = `SELECT * FROM participants ORDER BY registered_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.', error: err.message });
        }
        res.json({ success: true, participants: rows });
    });
});

// API to draw a winner
app.post('/draw', (req, res) => {
    // Subquery to find participants who have not won yet
    const sql = `
        SELECT id, name, email FROM participants 
        WHERE id NOT IN (SELECT participant_id FROM winners)
        ORDER BY RANDOM() LIMIT 1
    `;

    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: 'No eligible participants to draw from.' });
        }

        const winner = row;
        const insertWinnerSql = `INSERT INTO winners (participant_id) VALUES (?)`;
        db.run(insertWinnerSql, [winner.id], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to record winner.', error: err.message });
            }
            res.json({ success: true, winner });
        });
    });
});

// API to get all winners
app.get('/winners', (req, res) => {
    const sql = `
        SELECT p.name, p.email, w.draw_time 
        FROM winners w
        JOIN participants p ON w.participant_id = p.id
        ORDER BY w.draw_time DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.', error: err.message });
        }
        res.json({ success: true, winners: rows });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Run "node db.js" to initialize the database if you haven\'t already.');
});
