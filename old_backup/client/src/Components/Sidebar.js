import { Accordion, Col, Button, Modal, Row, ProgressBar, Container, Tabs, Tab } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { Check, LockFill, Puzzle, PuzzleFill } from 'react-bootstrap-icons';
import API from '../API'
import ModifiedWarningModal from "./ModifiedWarningModal";
//import Leaderboard from "./Leaderboard";
//import UserProfile from "./UserProfile";
import Rewards from "./Rewards";
import Rules from "./Rules";


function Sidebar(props) {
  const [exerciseList, setExerciseList] = useState([]);
  const [exercise, setExercise] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [prog, setProg] = useState(0);
  //const [active, setActive] = useState("1");
  const [completedList, setCompletedList] = useState();
  const [reload, setReload] = useState(false)
  const [numCompleted, setNumCompleted] = useState(0)
  //const [numberOfPart, setNumberOfParts] = useState(0); // Number set manually

  let levels = ["Noob", "Padawan", "Genius", "Grandmaster"]

  useEffect(() => {
    setExercise(props.exercise)
    if (props.userProgress) {
      let progress
      if (props.tutorial) {
        progress = JSON.parse(props.userProgress.tutorial)
      } else if (props.competition) {
        progress = JSON.parse(props.userProgress.competition)
      } else if (props.rewards) {
        progress = JSON.parse(props.userProgress.rewards)
      }
      setCompletedList(progress)
      let completedExercises = 0
      for (let part in progress) { completedExercises += progress[part].length }
      setNumCompleted(completedExercises)
      setProg(completedExercises / exerciseList.length * 100)
    }
  }, [props]);

  useEffect(() => {
    API.listExercises()
      .then(exercises => {
        setExerciseList(() => exercises);
      }).catch(err => {
        //setApiErrorMessage("Unable to load exercises. Please try again later.")
        console.error(err);
      })
  }, []);

  return <div>
    <Tabs defaultActiveKey="descr">
      <Tab eventKey="descr" title="Description">
        <ExerciseBody exercise={props.exercise} setModalShow={props.setModalShow} tutorial={props.tutorial} />
      </Tab>
      {((props.user.version % 2 === 1 && props.exNum === 2) ||
        (props.user.version % 2 === 0 && props.exNum === 1)
      ) && <Tab eventKey="scores" title="Scores">
          <Rewards spent={props.spent} setSpent={props.setSpent} respectedRules={props.respectedRules}
            score={props.score} setScore={props.setScore} user={props.user} exercise={props.exercise} grade={props.grade} />
        </Tab>}
      {((props.user.version % 2 === 1 && props.exNum === 2) ||
        (props.user.version % 2 === 0 && props.exNum === 1)
      ) && <Tab eventKey="rules" title="Rules">
          <Rules exercise={props.exercise} user={props.user} userRules={props.userRules} />
        </Tab>}
    </Tabs>
    <DescriptionModal exercise={exercise} show={modalShow} onHide={() => setModalShow(false)} />
  </div>
}

function ExerciseBody(props) {

  return <>
    <Row >
      <p style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: 1.7, marginBlock: 2, overflowY: "scroll", height: "600px" }}
        dangerouslySetInnerHTML={{ __html: props.exercise ? props.exercise.description : "" }} >
      </p>
    </Row>
  </>
}

function DescriptionModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Exercise description
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{props.exercise ? props.exercise.title : "loading"}</h4>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {props.exercise ? props.exercise.description : "loading"}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}



export default Sidebar;