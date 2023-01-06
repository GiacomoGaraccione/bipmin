-- SQLite
-- Create user table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    name TEXT NOT NULL, 
    hash TEXT NOT NULL, 
    avatar TEXT)


INSERT INTO users (id, email, name, hash)
-- VALUES (1, "john.doe@polito.it", "John","$2b$10$nHLAdGNSlomYH61JO6clH.kZeY7LPlNeuDY1yThhzoEipjJI3YYdW","resources/sheep.svg");
-- VALUES (2, "jane.doe@polito.it", "Jane", "$2a$10$GORD5RCzwim26jrigW864eDb7IxriI2YSAsfzBOVoOyPcwFMAiy9a","resources/cow.svg");
VALUES (4, "mathew.kelson@polito.it", "Mathew K", "$2a$12$jqlZ6KDIjaBqcu4MPppNpuBR56iLofCNAvHoX0b.a.b8jHYreMx6u");

DELETE FROM users WHERE id = 4

DROP TABLE users