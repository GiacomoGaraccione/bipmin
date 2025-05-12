'use strict';

const express = require('express');
const morgan = require('morgan');
const session = require('express-session'); // session middleware
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;

const path = require('path');

const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao');
const { resourceUsage } = require('process');

// Initialize and configure passport
passport.use(new passportLocal.Strategy((username, password, done) => {
  // verification callback for authentication
  dao.getUser(username, password).then(user => {
    if (user)
      done(null, user);
    else
      done(null, false, { message: 'Incorrect username or password' });
  }).catch(err => {
    done(err);
  });
}));

// serialize and de-serialize the user (user object <-> session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  dao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json()); // parsing the body in JSON format - populate req.body

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'User not authenticated' });
}

// initialize and configure HTTP sessions
app.use(session({
  secret: 'our little secret',
  resave: false,
  saveUninitialized: false
}));

// tell passport to use session cookies
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



/*** APIs ***/

// GET /api/diagram/resources/<filename>
//app.get('/api/diagrams/:userId/:exerciseId', async (req, res) => {
app.get('/api/diagram/resources/:filename', async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId

  /*try {
    let diagram = await dao.getDiagram(userId, exerciseId)
    if (diagram.error) {
      res.status(404).json(diagram);
    } else {
      res.json(diagram);
    }
  } catch (err) {
    res.status(500).end();
  }*/
  const filename = '/resources/' + req.params.filename + '.bpmn';
  try {
    res.contentType('application/xml');
    res.sendFile(path.join(__dirname, filename)); //'/resources/starter.bpmn'));
  } catch (err) {
    res.status(500).end();
  }
});

// GET /resources/<filename>
app.get('/resources/:filename', async (req, res) => {
  const filename = '/resources/' + req.params.filename;
  try {
    res.contentType('image/svg+xml');
    res.sendFile(path.join(__dirname, filename));
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/exercise/<part>/<place>
app.get('/api/exercises/:exNum', async (req, res) => {
  const exNum = req.params.exNum
  try {
    let exercise = await dao.getExercise(exNum);
    if (exercise.error) {
      res.status(404).json(exercise);
    } else {
      res.json(exercise);
    }
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/exercises get all exercises
app.get('/api/exercises', async (req, res) => {
  dao.listExercises()
    .then(exercises => res.json(exercises))
    .catch((err) => { console.log(err); res.status(500).end() });
})

// POST /api/exercise
app.post('/api/exercise', [ //isLoggedIn, 
  check('part').isInt({ min: 1 }),
  check('place').isInt({ min: 1 }),
  check('title').isLength({ min: 1 }),
  check('description').isLength({ min: 1 }),
  check('diagram').isLength({ min: 1 }),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const exercise = {
    part: req.body.part,
    place: req.body.place,
    title: req.body.title,
    XP: req.body.XP,
    rewards: req.body.rewards,
    diagram: req.body.diagram,
    description: req.body.description,
    rules: req.body.rules
  };

  try {
    await dao.createExercise(exercise);
    res.status(201).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the creation of exercise ${exercise.title}.` });
  }
});

// PUT /api/exercise/<part>/<place>
app.put('/api/exercise/:part/:place', [
  check('title').isLength({ min: 1 }),
  check('description').isLength({ min: 1 }),
  check('diagram').isLength({ min: 1 }),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const part = parseInt(req.params.part);
  const place = parseInt(req.params.place);
  const exercise = {
    part: part,
    place: place,
    title: req.body.title,
    XP: req.body.XP,
    rewards: req.body.rewards,
    diagram: req.body.diagram,
    description: req.body.description,
    rules: req.body.rules
  };

  try {
    await dao.updateExercise(exercise);
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error during the update of exercise ${exercise.place}.` });
  }

});

/*** Progress APIs ***/

// GET /api/progress/<user>
app.get('/api/progress/:user', async (req, res) => {
  const user = req.params.user;
  try {
    let progress = await dao.getProgress(user);
    if (progress.error) {
      res.status(404).json(progress);
    } else {
      res.json(progress);
    }
  } catch (err) {
    res.status(500).end();
  }
});

// GET /api/progresses
app.get('/api/progresses', async (_, res) => {
  dao.listProgresses()
    .then(progressList => res.json(progressList))
    .catch((err) => { console.log(err); res.status(500).end() });
});

// PUT /api/progress/<user>
app.put('/api/progress/:user', [], async (req, res) => {

  const user = parseInt(req.params.user);
  const progress = {
    userid: user,
    tutorial: req.body.tutorial,
    competition: req.body.competition,
    rewards: req.body.rewards
  };

  try {
    await dao.updateProgress(progress);
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error during the progress update of user ${progress.user}.` });
  }

});

/*** Users APIs ***/

// GET /api/users
app.get('/api/users', async (_, res) => {
  dao.listUsers()
    .then(usersList => res.json(usersList))
    .catch((err) => { console.log(err); res.status(500).end() });
});

// GET /api/user/<user>
app.get('/api/user/:user', async (req, res) => {
  const userIn = req.params.user;
  try {
    let user = await dao.getUserById(userIn);
    if (user.error) {
      res.status(404).json(user);
    } else {
      res.json(user);
    }
  } catch (err) {
    res.status(500).end();
  }
});

// PUT /api/user/<user>
app.put('/api/user/:user', [], async (req, res) => {

  const id = parseInt(req.params.user);
  const user = {
    id: id,
    avatar: req.body.avatar
  };

  try {
    await dao.updateAvatar(user);
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error during the avatar update of user ${user.id}.` });
  }

});

// POST /api/user
app.post('/api/user', [], async (req, res) => {
  console.log(req.body)
  const user = {
    email: req.body.email,
    name: req.body.name,
    hash: req.body.hash
  };

  try {
    await dao.createUser(user);
    res.status(201).end();
  } catch (err) {
    console.log(err);
    res.status(503).json({ error: `Database error during the creation of user ${user.name}.` });
  }
});

app.get("/api/rules/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  try {
    let rules = await dao.getUserRules(userId, exerciseId)
    if (rules.error) {
      res.status(404).json(rules);
    } else {
      res.json(rules);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.get("/api/rules/:exerciseId", async (req, res) => {
  const exerciseId = req.params.exerciseId
  try {
    let rules = await dao.getRules(exerciseId)
    if (rules.error) {
      res.status(404).json(rules);
    } else {
      res.json(rules);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.put("/api/rules/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const progress = req.body.progress

  try {
    await dao.unlockRule(userId, exerciseId, progress)
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.put("/api/points/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const rule = req.body.rule

  try {
    let points = await dao.increasePoints(userId, exerciseId, rule)
    res.json(points);
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.put("/api/grades/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const penalty = req.body.penalty

  try {
    let points = await dao.reduceGrade(userId, exerciseId, penalty)
    res.json(points);
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.post("/api/attempts/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const body = req.body

  try {
    await dao.recordAttempt(userId, exerciseId, body)
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.get("/api/attempts/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId

  try {
    let attempt = await dao.getAttemptNumber(userId, exerciseId)
    if (attempt.error) {
      res.status(404).json(attempt);
    } else {
      res.json(attempt);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.put("/api/diagrams/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const diagram = req.body.diagram

  try {
    await dao.saveDiagram(userId, exerciseId, diagram)
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.get("/api/scores/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId

  try {
    let score = await dao.getScore(userId, exerciseId)
    if (score.error) {
      res.status(404).json(score);
    } else {
      res.json(score);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.put("/api/pieces/:userId/:exerciseId", async (req, res) => {
  const userId = req.params.userId
  const exerciseId = req.params.exerciseId
  const newSpent = req.body.newSpent
  const newScore = req.body.newScore

  try {
    await dao.buyPieces(userId, exerciseId, newSpent, newScore)
    res.status(200).end();
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.post("/api/timestamps/:userId", async (req, res) => {
  const exerciseNumber = req.body.exerciseNumber

  try {
    await dao.addTimestamp(req.params.userId, exerciseNumber)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.get("/api/timestamps/:userId/:exerciseNumber", async (req, res) => {
  try {
    let timeout = await dao.getTimeout(req.params.userId, req.params.exerciseNumber)
    if (timeout.error) {
      res.status(404).json(timeout);
    } else {
      res.json(timeout);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.post("/api/files", async (req, res) => {
  try {
    await dao.loadFile(req.body.content)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.get("/api/logs/scores", async (req, res) => {
  try {
    let scores = await dao.getScores()
    if (scores.error) {
      res.status(404).json(scores);
    } else {
      res.json(scores);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.get("/api/logs/rules", async (req, res) => {
  try {
    let rules = await dao.getRulesFound()
    if (rules.error) {
      res.status(404).json(rules);
    } else {
      res.json(rules);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.get("/api/logs/attempts", async (req, res) => {
  try {
    let attempts = await dao.getAttempts()
    if (attempts.error) {
      res.status(404).json(attempts);
    } else {
      res.json(attempts);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.get("/api/logs/timestamps", async (req, res) => {
  try {
    let timestamps = await dao.getTimestamps()
    if (timestamps.error) {
      res.status(404).json(timestamps);
    } else {
      res.json(timestamps);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.get("/api/participants", async (req, res) => {
  try {
    let participants = await dao.getParticipants()
    if (participants.error) {
      res.status(404).json(participants);
    } else {
      res.json(participants);
    }
  } catch (err) {
    res.status(500).end();
  }
})

app.post("/api/sizes", async (req, res) => {
  try {
    await dao.addSizes(req.body.username, req.body.exercise, req.body.mode, req.body.attempt, req.body.size)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.post("/api/syntax", async (req, res) => {
  try {
    await dao.addSyntax(req.body.username, req.body.exercise, req.body.mode, req.body.attempt, JSON.stringify(req.body.errors), req.body.errorCount)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.post("/api/errors", async (req, res) => {
  try {
    await dao.addErrors(req.body.username, req.body.exercise, req.body.mode, req.body.attempt, req.body.errors.errors, req.body.errors.checkedRules)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

app.post("/api/old", async (req, res) => {
  try {
    await dao.addOldErrors(req.body.username, req.body.exercise, req.body.errors, req.body.errorCount, req.body.found, req.body.foundCount)
    res.status(200).end()
  } catch (err) {
    console.log(err)
    res.status(503).json({ error: `Database error.` });
  }
})

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from dao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => res.end());
});

// GET /api/sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user.' });;
});