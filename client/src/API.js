/**
 * All the API calls
 */
let baseURL = "https://softeng.polito.it/bipmin-server/" // /api/

//GET /api/diagram/resources/<filename>
async function getDiagram(filename/*userId, exerciseId*/) {
  const response = await fetch(baseURL + `diagram/resources/${filename}`)
  //const response = await fetch(`/api/diagrams/${userId}/${exerciseId}`);
  if (!response.ok)
    throw new Error(response.statusText);
  const diagram = await response.text();
  return diagram;
}

async function getExercise(exNum) {
  const response = await fetch(baseURL + `exercises/${exNum}`);
  if (!response.ok)
    throw new Error(response.statusText);
  const exercise = await response.json();
  return exercise;
}

async function listExercises() {
  const response = await fetch(baseURL + 'exercises');
  if (!response.ok)
    throw new Error(response.statusText);
  const exercises = await response.json();
  return exercises;
}

async function getProgress(user) {
  const response = await fetch(baseURL + `progress/${user}`);
  if (!response.ok)
    throw new Error(response.statusText);
  const progress = await response.json();
  return progress;
}

async function listProgresses() {
  const response = await fetch(baseURL + 'progresses');
  if (!response.ok)
    throw new Error(response.statusText);
  const progresses = await response.json();
  return progresses;
}

async function getUserRules(userId, exerciseId) {
  const response = await fetch(baseURL + `rules/${userId}/${exerciseId}`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const rules = await response.json()
  return rules
}

async function unlockRule(userId, exerciseId, progress) {
  let response = await fetch(baseURL + `rules/${userId}/${exerciseId}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ progress: progress })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function increasePoints(userId, exerciseId, rule) {
  let response = await fetch(baseURL + `points/${userId}/${exerciseId}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rule: rule })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
  const points = await response.json();
  return points;
}

async function recordAttempt(userId, exerciseId, mode, errors, rules, diagram, success) {
  let response = await fetch(baseURL + `attempts/${userId}/${exerciseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ mode: mode, errors: errors, rules: rules, diagram: diagram, success: success })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function getAttemptNumber(userId, exerciseId) {
  const response = await fetch(baseURL + `attempts/${userId}/${exerciseId}`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const attempt = await response.json()
  return attempt
}

async function getRules(exerciseId) {
  const response = await fetch(baseURL + `rules/${exerciseId}`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const rules = await response.json()
  return rules
}

async function getScore(userId, exerciseId) {
  const response = await fetch(baseURL + `scores/${userId}/${exerciseId}`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const score = await response.json()
  return score
}

async function buyPieces(userId, exerciseId, newSpent, newScore) {
  let response = await fetch(baseURL + `pieces/${userId}/${exerciseId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newSpent: newSpent, newScore: newScore }),
  });
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function reduceGrade(userId, exerciseId, penalty) {
  let response = await fetch(baseURL + `grades/${userId}/${exerciseId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ penalty: penalty }),
  });
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function saveDiagram(userId, exerciseId, diagram) {
  let response = await fetch(baseURL + `diagrams/${userId}/${exerciseId}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ diagram: diagram })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function updateProgress(progress) {
  let response = await fetch(baseURL + `progress/${progress.userid}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(progress),
  });
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function listUsers() {
  const response = await fetch(baseURL + 'users');
  if (!response.ok)
    throw new Error(response.statusText);
  const users = await response.json();
  return users;
}

async function getUser(ui) {
  const response = await fetch(baseURL + `user/${ui}`);
  if (!response.ok)
    throw new Error(response.statusText);
  const user = await response.json();
  return user;
}

async function updateAvatar(user) {
  let response = await fetch(baseURL + `user/${user.id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function addTimestamp(userId, exerciseNumber) {
  let response = await fetch(baseURL + `timestamps/${userId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ exerciseNumber: exerciseNumber })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function getTimeout(userId, exerciseNumber) {
  const response = await fetch(baseURL + `timestamps/${userId}/${exerciseNumber}`)
  if (!response.ok)
    throw new Error(response.statusText);
  const timeout = await response.json();
  return timeout;
}

async function loadFile(content) {
  let response = await fetch(baseURL + "files", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: content })
  })
  if (!response.ok) {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

/**
 * Login APIs
 */

async function logIn(credentials) {
  let response = await fetch(baseURL + `sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch(baseURL + 'sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch(baseURL + 'sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

const API = {
  getDiagram, getExercise, listExercises, getProgress, updateProgress, listProgresses,
  listUsers, getUser, updateAvatar, logIn, logOut, getUserInfo,
  getUserRules, unlockRule, getRules, getScore, buyPieces, increasePoints, reduceGrade, saveDiagram,
  recordAttempt, getAttemptNumber, addTimestamp, getTimeout, loadFile
}
export default API;