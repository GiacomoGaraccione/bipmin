import '../App.css';
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap"
import Modeler from 'bpmn-js/lib/Modeler'
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import lintModule from 'bpmn-js-bpmnlint';
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
//import bpmnlintConfig from './.bpmnlintrc';
import * as bpmnlintConfig from '../bundled-config';
import Footer from './Footer';
import API from '../API'
import Sidebar from './Sidebar';
import Heading from './Heading';
import { propTypes } from 'react-bootstrap/esm/Image';

function Exercise(props) {
    const [lintState, setLintState] = useState(false);
    const [linting, setLinting] = useState();
    const [exercise, setExercise] = useState();
    const [mod, setModeler] = useState();
    const [exerciseCorrect, setExerciseCorrect] = useState(false);
    const [userProgress, setUserProgress] = useState();
    const [updatePart, setUpdatePart] = useState(false);
    const [modifiedDiagram, setModifiedDiagram] = useState(false);
    const [respectedRules, setRespectedRules] = useState(0)
    const [userRules, setUserRules] = useState([])
    const [unlockedRules, setUnlockedRules] = useState([])
    const [score, setScore] = useState(0)
    const [spent, setSpent] = useState(0)
    const [grade, setGrade] = useState(0)

    const reduceGrade = (penalty) => {
        let newGrade = grade - penalty
        setGrade(newGrade)
    }

    const updateUnlockedRules = (rule) => {
        setUnlockedRules((prev) => [...prev, rule])
    }

    useEffect(() => {
        const container = document.getElementById("container");
        const modeler = new Modeler({
            container,
            keyboard: {
                bindTo: document
            },
            additionalModules: [
                lintModule
            ]
        });
        setLinting(modeler.get('linting'));
        const linter = modeler.get('linting');
        linter.setLinterConfig(bpmnlintConfig);
        linter.toggle(false)
        modeler.on('element.changed', (event) => {
            setModifiedDiagram(true)
        })
        let exNum = 0
        switch (props.user.version) {
            case 1:
                props.exNum === 1 ? exNum = 1 : exNum = 2
                break
            case 2:
                props.exNum === 1 ? exNum = 1 : exNum = 2
                break
            case 3:
                props.exNum === 1 ? exNum = 2 : exNum = 1
                break
            case 4:
                props.exNum === 1 ? exNum = 2 : exNum = 1
                break
            default:
                break
        }
        API.getExercise(exNum).then((ex) => {
            API.getDiagram(ex.diagram/*props.user.id, ex.id*/).then(diag => {
                console.log(diag)
                modeler.importXML(diag);
            }).catch(err => {
                console.error(err);
            })
        })
        setModeler(modeler)
    }, []);

    useEffect(() => {
        const user = props.user.id
        if (user) {
            API.getProgress(user).then(prog => {
                setUserProgress(prog);
            }).catch(err => {
                console.error(err)
            })
            let exNum = 0
            switch (props.user.version) {
                case 1:
                    //versione A: primo esercizio vanilla / secondo gamified
                    //versione A: primo esercizio testo 1 / secondo testo 2
                    props.exNum === 1 ? exNum = 1 : exNum = 2
                    break
                case 2:
                    //versione B: primo esercizio gamified / secondo vanilla
                    //versione B: primo esercizio testo 1 / secondo testo 2
                    props.exNum === 1 ? exNum = 1 : exNum = 2
                    break
                case 3:
                    //versione C: primo esercizio vanilla / secondo gamified
                    //versione C: primo esercizio testo 2 / secondo testo 1
                    props.exNum === 1 ? exNum = 2 : exNum = 1
                    break
                case 4:
                    //versione D: primo esercizio gamified / secondo vanilla
                    //versione A: primo esercizio testo 2 / secondo testo 1
                    props.exNum === 1 ? exNum = 2 : exNum = 1
                    break
                default:
                    break
            }
            API.getExercise(exNum).then(ex => {
                setExercise(ex);
                API.getScore(props.user.id, ex.id).then(score => {
                    setScore(parseFloat(score["points"]))
                    setSpent(score["spent"])
                    setGrade(parseFloat(score["grade"]))
                })
                API.getUserRules(props.user.id, ex.id).then(rules => {
                    setUserRules(JSON.parse(rules.progress))
                    let r = []
                    API.getRules(ex.id).then((values) => {
                        console.log(values)
                        for (let rule of JSON.parse(rules.progress)) {
                            let val = values.filter((ev) => { return ev.rule === rule })[0]
                            let foundRule = "<li>"
                            foundRule += `Correctly described the following part of the problem: <b style="color:${val.color}">` + rule.split("_")[1] + "</b> - worth " + val.reward + " point"
                            if (val.reward !== 1) foundRule += "s"
                            r.push(foundRule)
                        }
                        setUnlockedRules(r)
                    })
                })
            }).catch(err => {
                console.error(err);
            })

            /*setInterval(() => {
                API.getTimeout(props.user.id, props.exNum).then((timeout) => {
                    if (timeout) {
                        alert("Timeout reached. Please submit your final attempt.")
                    }
                })
            }, 60000)*/
        }
    }, [props.user]);

    return (
        <Row>
            <Col xs={3} className="ms-4">
                <Sidebar modeler={mod} setExercise={setExercise} exercise={exercise} exerciseCorrect={exerciseCorrect}
                    userProgress={userProgress} updatePart={updatePart} setUpdatePart={setUpdatePart}
                    modifiedDiagram={modifiedDiagram} setModifiedDiagram={setModifiedDiagram} tutorial={props.tutorial} user={props.user}
                    respectedRules={respectedRules} score={score} setScore={setScore} spent={spent} setSpent={setSpent} userRules={unlockedRules}
                    grade={grade} exNum={props.exNum} />
            </Col>
            <Col xs={8}>
                <Row className='m-2 mt-3' >
                    <Heading exercise={exercise} style={{ display: 'flex', justifyContent: 'left' }} />
                </Row>
                <Row >
                    <div
                        id="container"
                        style={{
                            border: "1px solid #000000",
                            height: "77vh",
                        }}
                    ></div>
                </Row>
                <Row className="m-3">
                    <Footer modeler={mod} lintState={lintState} setLintState={setLintState} linting={linting}
                        exercise={exercise} setExerciseCorrect={setExerciseCorrect} exerciseCorrect={exerciseCorrect}
                        userProgress={userProgress} setUserProgress={setUserProgress} user={props.user}
                        modifiedDiagram={modifiedDiagram} setModifiedDiagram={setModifiedDiagram} tutorial={props.tutorial}
                        respectedRules={respectedRules} setRespectedRules={setRespectedRules} userRules={userRules} setUserRules={setUserRules}
                        score={score} setScore={setScore} grade={grade} reduceGrade={reduceGrade} setUnlockedRules={updateUnlockedRules} exNum={props.exNum} setMode={props.setMode} />
                </Row>
            </Col>
        </Row>
    );
}

export default Exercise