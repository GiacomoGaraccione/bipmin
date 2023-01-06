import './App.css';
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row, Alert } from "react-bootstrap"
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
import NavBar from './Components/NavBar';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
//import ProgressVersion from './Components/legacy/ProgressVersion';
//import CompetitionVersion from './Components/CompetitionVersion';
//import RewardVersion from './Components/RewardVersion';
import LoginForm from './Components/LoginPage';
import API from './API';
import Exercise from './Components/Exercise';
import AdminPage from './Components/AdminPage';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [timeout1, setTimeout1] = useState(false)
  const [timeout2, setTimeout2] = useState(false)

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.getUserInfo().then(u => {
          setUser(u)
          setLoggedIn(true);
          API.getTimeout(u.id, 1).then((timeout) => {
            setTimeout1(timeout)
          })
          API.getTimeout(u.id, 2).then((timeout) => {
            setTimeout2(timeout)
          })
        }).catch(err => {
          console.error(err);
        });
      } catch (err) {
        console.error(err.error);
      }
    };
    if (!loggedIn) {
      checkAuth();
    }
  }, [loggedIn]);


  // Login function
  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setApiErrorMessage("");
    } catch (err) {
      throw err; // Error caught in LoginPage.js
    }
  }

  // Logout function
  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
  }

  return (
    <Router>
      <Row className="App">
        <NavBar loggedIn={loggedIn} logout={doLogOut} user={user} />
        {apiErrorMessage ? <Alert variant='danger' className="mt-2">{apiErrorMessage}</Alert> :
          <Routes basename="https://softeng.polito.it/bipmin/bipmin">

            <Route exact path="/" element={
              <>{loggedIn ?
                <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', }}>

                  <Col xs={6}>
                    <Button variant="outline-dark" href="/exercise1" component={Link} onClick={() => API.addTimestamp(user.id, 1)} disabled={timeout1}>
                      Exercise 1</Button>
                  </Col>
                  <Col xs={6}>
                    <Button variant="outline-dark" href="/exercise2" component={Link} onClick={() => API.addTimestamp(user.id, 2)} disabled={timeout2} >
                      Exercise 2</Button>
                  </Col>
                </Container>
                : <Navigate to="/login" />
              }</>
            } />
            <Route exact path="/login" element={
              <>{loggedIn ? <Navigate to="/" /> : <LoginForm login={doLogIn} />}</>
            } />
            <Route exact path="/exercise1" element={<Exercise user={user} exNum={1}></Exercise>} />
            <Route exact path="/exercise2" element={<Exercise user={user} exNum={2}></Exercise>} />
            <Route exact path="/admin" element={<AdminPage user={user}></AdminPage>} />
          </Routes>
        }
      </Row>
    </Router>
  );
}

/**
 * 
            <Route exact path="/version1" element={
              <>
                {//loggedIn ? 
                  <ProgressVersion loggedIn={loggedIn} tutorial={true} user={user} />
                  //: <Navigate to="/login" />
                }</>
            } />
            <Route exact path="/version2" element={
              <>{//loggedIn ? 
                <CompetitionVersion competition={true} user={user} />
                //: <Navigate to="/login" />
              }</>
            } />
            <Route exact path="/version3" element={
              <>{//loggedIn ? 
                <RewardVersion rewards={true} user={user} />
                //: <Navigate to="/login" />
              }</>
            } />
 */

export default App;
