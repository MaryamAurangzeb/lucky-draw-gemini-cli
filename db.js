const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./luckydraw.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the luckydraw database.');
});

const setupDatabase = () => {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating participants table:", err.message);
            } else {
                console.log("Participants table created or already exists.");
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS winners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant_id INTEGER NOT NULL,
            draw_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (participant_id) REFERENCES participants (id)
        )`, (err) => {
            if (err) {
                console.error("Error creating winners table:", err.message);
            } else {
                console.log("Winners table created or already exists.");
            }
        });
    });
};

// If this file is run directly, set up the database.
if (require.main === module) {
    setupDatabase();
    setTimeout(() => db.close(), 1000);
}


module.exports = db;
