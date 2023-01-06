'use strict';
/* Data Access Object (DAO) module for accessing tasks */

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');
const { DateTime, Interval } = require("luxon")

// Open the database
const db = new sqlite.Database('data.db', (err) => {
  if (err) throw err;
});

exports.getDiagram = (userId, exerciseId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT diagram FROM diagrams WHERE userId = ? AND exerciseId = ?"
    db.get(sql, [userId, exerciseId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row["diagram"])
      }
    })
  })
}

// Exercise operations

// Add an exercise
exports.createExercise = (exercise) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO exercises(part, place, title, XP, rewards, diagram, description, rules) VALUES(?,?,?,?,?,?,?,?)";
    db.run(sql, [exercise.part, exercise.place, exercise.title, exercise.XP, exercise.rewards, exercise.diagram, exercise.description, exercise.rules], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

// Get an exercise
exports.getExercise = (exNum) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM exercises WHERE id=?';
    db.get(sql, [exNum], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      else if (row === undefined) {
        resolve(false);
      } else {
        resolve({
          part: row.part, place: row.place, title: row.title, XP: row.XP, rewards: row.rewards,
          diagram: row.diagram, description: row.description, rules: row.rules, id: row.id
        })
      }
      ;
    });
  });
}

// Update an exercise
exports.updateExercise = (exercise) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE exercises SET title=?, XP=?, rewards=?, diagram=?, description=?, rules=? WHERE part=? AND place=?";
    db.run(sql, [exercise.title, exercise.XP, exercise.rewards, exercise.diagram, exercise.description, exercise.rules, exercise.part, exercise.place], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// Get all exercises
exports.listExercises = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM exercises';
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err)
        reject(err);
        return;
      }
      const exercises = rows.map((ex) => ({
        part: ex.part, place: ex.place, title: ex.title, XP: ex.XP, rewards: ex.rewards,
        diagram: ex.diagram, description: ex.description, rules: ex.rules
      }));
      resolve(exercises);
    });
  });
};

// Progress operations
// Get users progress
exports.getProgress = (user) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM progress WHERE userid=?';
    db.get(sql, [user], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      else if (row === undefined) {
        resolve(false);
      } else {
        resolve({ userid: row.userid, tutorial: row.tutorial, competition: row.competition, rewards: row.rewards })
      }
      ;
    });
  });
}
// Update a users progress
exports.updateProgress = (progress) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE progress SET tutorial=?, competition=?, rewards=? WHERE userid=?";
    db.run(sql, [progress.tutorial, progress.competition, progress.rewards, progress.userid], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// Get all progresses for leaderboard
exports.listProgresses = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM progress';
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err)
        reject(err);
        return;
      }
      const progresses = rows.map((prg) => ({ userid: prg.userid, competition: prg.competition }));
      resolve(progresses);
    });
  });
};

// Get all users for leaderboard
exports.listUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.log(err)
        reject(err);
        return;
      }
      const users = rows.map((user) => ({ id: user.id, name: user.name, avatar: user.avatar }));
      resolve(users);
    });
  });
};

// Update a user avatar
exports.updateAvatar = (user) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET avatar=? WHERE id=?";
    db.run(sql, [user.avatar, user.id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// Creating user accounts - through server API only

exports.createUser = (user) => {
  return new Promise((resolve, reject) => {
    console.log(user)
    const sql = "INSERT INTO users(email, name, hash) VALUES(?,?,?)";
    db.run(sql, [user.email, user.name, user.hash], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};


// DAO operations for validating users

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err)
        reject(err); // DB error
      else if (row === undefined)
        resolve(false); // user not found
      else {
        bcrypt.compare(password, row.hash).then(result => {
          if (result) // password matches
            resolve({ id: row.id, username: row.email, name: row.name, avatar: row.avatar, version: row.version });
          else
            resolve(false); // password not matching
        })
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = { id: row.id, username: row.email, name: row.name, avatar: row.avatar, version: row.version }
        resolve(user);
      }
    });
  });
};

exports.getUserRules = (userId, exerciseId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM userRules WHERE userId = ? AND exerciseId = ?"
    db.get(sql, [userId, exerciseId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

exports.unlockRule = (userId, exerciseId, progress) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE userRules SET progress = ? WHERE userId = ? AND exerciseId = ?"
    db.run(sql, [progress, userId, exerciseId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    })
  })
}

exports.increasePoints = (userId, exerciseId, rule) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE scores SET points = points + (SELECT reward FROM rules WHERE exerciseId = ? AND rule=?) WHERE exerciseId = ? AND userId = ?"
    db.run(sql, [exerciseId, rule, exerciseId, userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        const sqlGet = "SELECT points FROM scores WHERE userId = ? AND exerciseId = ?"
        db.get(sqlGet, [userId, exerciseId], (errGet, rowGet) => {
          if (errGet) {
            reject(errGet)
          } else {
            resolve(rowGet["points"])
          }
        })
      }
    })
  })
}

exports.reduceGrade = (userId, exerciseId, penalty) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE scores SET grade = grade -? WHERE exerciseId = ? AND userId = ?"
    db.run(sql, [penalty, exerciseId, userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}


exports.recordAttempt = (userId, exerciseId, body) => {
  return new Promise((resolve, reject) => {
    const sqlMax = "SELECT MAX(attempt) as max FROM attempts WHERE userId = ? AND exerciseId = ? AND mode = ?"
    db.get(sqlMax, [userId, exerciseId, body.mode], (errMax, rowMax) => {
      if (errMax) {
        reject(errMax)
      } else {
        let attempt = rowMax["max"] ? rowMax["max"] + 1 : 1
        const sql = "INSERT INTO attempts(userId, exerciseId, attempt, mode, errors, rules, diagram, success, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        db.run(sql, [userId, exerciseId, attempt, body.mode, body.errors, body.rules, body.diagram, body.success, DateTime.now().setLocale('it-IT').toLocaleString(DateTime.DATETIME_FULL)], (err, row) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

exports.getRules = (exerciseId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM rules WHERE exerciseId = ? AND reward IS NOT NULL"
    db.all(sql, [exerciseId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

exports.getScore = (userId, exerciseId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT points, spent, grade FROM scores WHERE userId = ? AND exerciseId = ?"
    db.get(sql, [userId, exerciseId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

exports.buyPieces = (userId, exerciseId, newSpent, newScore) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE scores SET points = ?, spent = ? WHERE userId = ? AND exerciseId = ?"
    db.run(sql, [newScore, newSpent, userId, exerciseId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve([])
      }
    })
  })
}

exports.saveDiagram = (userId, exerciseId, diagram) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE diagrams SET diagram = ? WHERE userId = ? AND exerciseId = ?"
    db.run(sql, [diagram, userId, exerciseId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

exports.getAttemptNumber = (userId, exerciseId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT MAX(attempt) AS max FROM attempts WHERE userId = ? AND exerciseId = ? AND mode = ?"
    db.get(sql, [userId, exerciseId, "correctness"], (err, row) => {
      if (err) {
        reject(err)
      } else {
        let attempt = row["max"] ? row["max"] : 0
        resolve(attempt)
      }
    })
  })
}

exports.addTimestamp = (userId, exerciseNumber) => {
  return new Promise((resolve, reject) => {
    const sqlGet = "SELECT * FROM timestamps WHERE userId = ? AND exerciseNumber = ?"
    db.get(sqlGet, [userId, exerciseNumber], (errGet, rowGet) => {
      if (errGet) {
        reject(errGet)
      } else {
        if (!rowGet) {
          const sql = "INSERT INTO timestamps(userId, exerciseNumber, timestamp) VALUES(?, ?, ?)"
          db.run(sql, [userId, exerciseNumber, DateTime.now().toISO()], (err, row) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        } else {
          resolve()
        }
      }
    })
  })
}

exports.getTimeout = (userId, exerciseNumber) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM timestamps WHERE userId = ? AND exerciseNumber = ?"
    db.get(sql, [userId, exerciseNumber], (err, row) => {
      if (err) {
        reject(err)
      } else {
        let ret = false
        if (row) {
          if (row["timestamp"]) {
            let timestamp = row["timestamp"]
            //{{DateTime.fromISO('2019-06-23').diff(DateTime.fromISO('2019-05-23'), 'months').toObject()}}
            let minutes = DateTime.now().diff(DateTime.fromISO(timestamp), "minutes").toObject()["minutes"]
            ret = minutes > 45.0
          }
        }
        resolve(ret)
      }
    })
  })
}

exports.loadFile = (content) => {
  return new Promise((resolve, reject) => {
    let sqlUsers = "INSERT INTO users(email, name, hash, version) VALUES"
    let rows = content.split("\r\n")
    for (let i = 0; i < rows.length - 1; i++) {
      sqlUsers += "(?, ?, ?, ?), "
    }
    sqlUsers += "(?, ?, ?, ?)"
    let params = []
    for (let row of rows) {
      let values = row.split(",")
      params.push(values[0] + "@studenti.polito.it", values[1] + " " + values[4], values[2], values[3])
    }
    db.run(sqlUsers, params, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}