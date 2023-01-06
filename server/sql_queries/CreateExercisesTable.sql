-- SQLite
-- Create exercise table
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part INTEGER,
    place INTEGER, 
    title TEXT NOT NULL, 
    XP INTEGER,
    rewards INTEGER,
    diagram TEXT NOT NULL, 
    description TEXT NOT NULL,
    rules TEXT)

-- DROP TABLE exercises

 -- DELETE from exercises WHERE id=7
