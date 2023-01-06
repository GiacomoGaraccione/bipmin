-- SQLite
-- Create progress table
CREATE TABLE progress (
    -- id INTEGER  AUTOINCREMENT,
    userid INTEGER UNIQUE PRIMARY KEY, 
    tutorial TEXT, 
    competition TEXT, 
    rewards TEXT)

-- DROP TABLE progress

INSERT INTO progress (userid) VALUES (16)
