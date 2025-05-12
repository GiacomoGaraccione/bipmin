import { Button, Col, Row, Modal } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import API from '../API'
import ModifiedWarningModal from "./ModifiedWarningModal";
import CongratulationsModal from "./CongratulationsModal";

function Footer(props) {
    const [rules, setRules] = useState();
    const [errors, setErrors] = useState([]);
    const [lintingErrors, setLintingErrors] = useState();
    const [modalShow, setModalShow] = useState(false);
    const [warningModalShow, setWarningModalShow] = useState(false);
    const [congratulationsModalShow, setCongratulationsModalShow] = useState(false);
    const [proceedAction, setProceedAction] = useState();
    const [correct, setCorrect] = useState(false);
    const [unlockedRules, setUnlockedRules] = useState([])
    const [failedRules, setFailedRules] = useState([])
    const [syntaxErrors, setSyntaxErrors] = useState([])
    const [showSyntaxModal, setShowSyntaxModal] = useState(false)
    const [xml, setXml] = useState("")
    const [success, setSuccess] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [noNames, setNoNames] = useState(false)

    const updateFailedRules = (error) => {
        setFailedRules((prev) => [...prev, error])
    }

    //CHECK regole no deadlock dei gateway: per ogni tipologia di gateway di ciascuna pool deve valere
    //U - (T-1) = I
    //U: flussi in uscita
    //T: flussi in ingresso nelle terminazioni
    //I: flussi in ingresso
    const updateUnlockedRules = (rule) => {
        setUnlockedRules((prev) => [...prev, rule])
    }

    useEffect(() => {
        setRules(props.exercise ? JSON.parse(props.exercise.rules) : "")
    }, [props.exercise]);

    useEffect(() => {
        if (props.user && props.exercise) {
            API.getAttemptNumber(props.user.id, props.exercise.id).then((attempt) => {
                setAttempt(attempt)
            })
        }
    }, [props.user, props.exercise])


    function checkLinting() {
        return new Promise(resolve => {
            var errorList
            if (props.modeler) {
                props.modeler.on('linting.completed', function (event) {
                    console.log(event)
                    setLintingErrors(Object.keys(event.issues));
                    errorList = Object.keys(event.issues);
                    resolve(errorList)
                });
            }
        })
    };

    const checkSyntax = async () => {
        let errorFlag = false
        setNoNames(false)

        props.linting.toggle(true)
        if (!lintingErrors) {
            let result = await checkLinting()
            if (result.length > 0) {
                errorFlag = true;
            }
            setSyntaxErrors(result)
        } else if (lintingErrors.length > 0) {
            setSyntaxErrors(lintingErrors)
            errorFlag = true;
        } else {
            setSyntaxErrors([])
        }
        if (props.modeler.get('elementRegistry').getAll().filter((e) => e.type !== "bpmn:Process" && e.type !== "bpmn:Collaboration" && e.type.indexOf("Flow") < 0).filter((e) => !e.businessObject.name || e.businessObject.name === "").length > 0) {
            setNoNames(true)
            errorFlag = true
        }
        try {
            const result = await props.modeler.saveXML({ format: true })
            const { xml } = result
            API.recordAttempt(props.user.id, props.exercise.id, "syntax", null, null, xml, errorFlag ? "no" : "yes")
        } catch (err) {
            console.error(err)
        }
        setShowSyntaxModal(true)
    }

    const evaluateElementConditions = (element, conditions, elementRegistry) => {
        let elementsOfCondition = elementRegistry.filter((e) => e.type === "bpmn:" + element)
        if (conditions["Label"]) {
            const filterElementLabels = (event) => {
                const match = conditions["Label"].find((el) => {
                    if (event.businessObject.name) {
                        if (event.businessObject.name.toLowerCase().includes(el)) {
                            return true
                        }
                    } else return undefined
                })
                return match !== undefined
            }
            elementsOfCondition = elementsOfCondition.filter(filterElementLabels)
        }
        if (conditions["EventDefinition"]) {
            elementsOfCondition = elementsOfCondition.filter((e) => e.businessObject.eventDefinitions && e.businessObject.eventDefinitions[0].id.split("_")[0] === conditions["EventDefinition"])
        }
        if (conditions["Pool"]) {
            const filterPool = (event) => {
                const match = conditions["Pool"].find((el) => {
                    if (event.parent) {
                        if (event.parent.businessObject.name) {
                            if (event.parent.businessObject.name.toLowerCase().includes(el) && event.parent.type === "bpmn:Participant") {
                                return true
                            }
                        } else return undefined
                    } else return undefined
                })
                return match !== undefined
            }
            elementsOfCondition = elementsOfCondition.filter(filterPool)
        }
        for (let target of Object.keys(conditions).filter((e) => e.includes("Target") && e.indexOf("Message") < 0)) {
            const checkEvent = (ev) => {
                return conditions[target]["EventDefinition"] ? ev.target.businessObject.eventDefinitions && ev.target.businessObject.eventDefinitions[0].id.split("_")[0] === conditions[target]["EventDefinition"] : true
            }
            if (conditions[target]["Label"]) {
                const filterTarget = (event) => {
                    const match = conditions[target]["Label"].find((el) => {
                        if (event.target.businessObject.name.toLowerCase().includes(el) && event.target.type === "bpmn:" + conditions[target]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)) {
                            return true
                        }
                    })
                    return match !== undefined
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.outgoing.filter(filterTarget).length > 0)
            } else {
                const filterTarget = (event) => {
                    return event.source.type === "bpmn:" + conditions[target]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.outgoing.filter(filterTarget).length > 0)
            }
        }
        for (let messageTarget of Object.keys(conditions).filter((e) => e.includes("MessageTarget"))) {
            const checkEvent = (ev) => {
                return conditions[messageTarget]["EventDefinition"] ? ev.target.businessObject.eventDefinitions && ev.target.businessObject.eventDefinitions[0].id.split("_")[0] === conditions[messageTarget]["EventDefinition"] : true
            }
            if (conditions[messageTarget]["Label"]) {
                const filterMessageTarget = (event) => {
                    const match = conditions[messageTarget]["Label"].find((el) => {
                        if (event.target.businessObject.name.toLowerCase().includes(el) && event.target.type === "bpmn:" + conditions[messageTarget]["Element"] && event.type === "bpmn:MessageFlow" && checkEvent(event)) {
                            return true
                        }
                    })
                    return match !== undefined
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.outgoing.filter(filterMessageTarget).length > 0)
            } else {
                const filterMessageTarget = (event) => {
                    return event.target.type === "bpmn:" + messageTarget && event.type === "bpmn:MessageFlow" && checkEvent(event)
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.outgoing.filter(filterMessageTarget).length > 0)
            }
        }
        for (let messageSender of Object.keys(conditions).filter((e) => e.includes("MessageSender"))) {
            const checkEvent = (ev) => {
                return conditions[messageSender]["EventDefinition"] ? ev.source.businessObject.eventDefinitions && ev.source.businessObject.eventDefinitions[0].id.split("_")[0] === conditions[messageSender]["EventDefinition"] : true
            }
            if (conditions[messageSender]["Label"]) {
                const filterMessageSender = (event) => {
                    const match = conditions[messageSender]["Label"].find((el) => {
                        if (event.source.businessObject.name.toLowerCase().includes(el) && event.source.type === "bpmn:" + conditions[messageSender]["Element"] && event.type === "bpmn:MessageFlow" && checkEvent(event)) {
                            return true
                        }
                    })
                    return match !== undefined
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.incoming.filter(filterMessageSender).length > 0)
            } else {
                const filterMessageSender = (event) => {
                    return event.target.type === "bpmn:" + messageSender && event.type === "bpmn:MessageFlow" && checkEvent(event)
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.incoming.filter(filterMessageSender).length > 0)
            }
        }
        for (let parent of Object.keys(conditions).filter((e) => e.includes("Parent"))) {
            const checkEvent = (ev) => {
                return conditions[parent]["EventDefinition"] ? ev.source.businessObject.eventDefinitions && ev.source.businessObject.eventDefinitions[0].id.split("_")[0] === conditions[parent]["EventDefinition"] : true
            }
            if (conditions[parent]["Label"]) {
                const filterParent = (event) => {
                    const match = conditions[parent]["Label"].find((el) => {
                        if (event.source.businessObject.name.toLowerCase().includes(el) && event.source.type === "bpmn:" + conditions[parent]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)) {
                            return true
                        }
                    })
                    return match !== undefined
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.incoming.filter(filterParent).length > 0)
            } else {
                const filterParent = (event) => {
                    return event.source.type === "bpmn:" + conditions[parent]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)
                }
                elementsOfCondition = elementsOfCondition.filter((e) => e.incoming.filter(filterParent).length > 0)
            }
        }
        if (conditions["BoundedEvent"]) {
            const filterBoundedEvents = (event) => {
                let type = event.type === "bpmn:BoundaryEvent"
                let name = true
                if (conditions["BoundedEvent"]["Label"]) {
                    const match = conditions["BoundedEvent"]["Label"].find((el) => {
                        if (event.businessObject.name.toLowerCase().includes(el)) return true
                    })
                    name = match ? true : false
                }
                let def = event.businessObject.eventDefinitions ? event.businessObject.eventDefinitions[0].id.split("_")[0] === conditions["BoundedEvent"]["EventDefinition"] : false
                let interrupting = conditions["BoundedEvent"]["Interrupting"] === event.businessObject.cancelActivity
                return type && name && def && interrupting
            }
            elementsOfCondition = elementsOfCondition.filter((e) => e.attachers.filter(filterBoundedEvents).length > 0)
        }
        if (conditions["BoundingElement"]) {
            const filterHost = (event) => {
                let type = event.host.type === "bpmn:" + conditions["BoundingElement"]["Element"]
                let name = true
                if (conditions["BoundingElement"]["Label"]) {
                    const match = conditions["BoundingElement"]["Label"].find((el) => {
                        if (event.host.businessObject.name.toLowerCase().includes(el)) return true
                    })
                    name = match ? true : false
                }
                let interrupting = conditions["Interrupting"] === event.businessObject.cancelActivity
                return type && name && interrupting
            }
            elementsOfCondition = elementsOfCondition.filter(filterHost)
        }
        return elementsOfCondition[0]
    }

    const checkRules = async () => {
        //Clear errors
        setErrors([])
        setFailedRules([])
        setUnlockedRules([])
        let penalty = 0
        let errorFlag = false
        API.getRules(props.exercise.id).then(async (values) => {
            const elementRegistry = props.modeler.get('elementRegistry').getAll();
            let respectedRules = 0
            for (let rule in rules) {
                let val = values.filter((ev) => { return ev.rule === rule })[0]
                if (rule.split("_")[0] === "GroupRules") {
                    let solutionFound = false
                    let solutionOptions = rules[rule]
                    let color = ""
                    for (let option of solutionOptions) {
                        let wrongElements = 0
                        let correctElements = []
                        for (let element in option) {
                            let conditions = option[element]
                            let correctEl = evaluateElementConditions(element, conditions, elementRegistry)
                            if (correctEl) {
                                correctElements.push({ element: correctEl, color: conditions["Color"] })
                            } else {
                                wrongElements++
                            }
                        }
                        if (wrongElements === 0) {
                            solutionFound = true
                            for (let el of correctElements) {
                                if (el.color) {
                                    let modeling = props.modeler.get("modeling")
                                    modeling.setColor(el.element, {
                                        stroke: "black",
                                        fill: el.color
                                    })
                                    color = el.color
                                }
                            }
                            break
                        }
                    }
                    if (!solutionFound) {
                        errorFlag = true;
                        setErrors((prev) => [...prev, "<li>Your diagram does not describe correctly the following part of the problem: <b>" + rule.split("_")[1] + "</b>. This condition involves multiple elements - " + val.reward + " point(s) lost"])
                        updateFailedRules(rule)
                        penalty += parseFloat(val.reward)

                    } else {
                        updateProgress(rule, color)
                        respectedRules++

                    }
                } else {
                    let correctEl = evaluateElementConditions(rule.split("_")[0], rules[rule], elementRegistry)
                    if (correctEl) {
                        if (rules[rule]["Color"]) {
                            let modeling = props.modeler.get("modeling")
                            modeling.setColor(correctEl, {
                                stroke: "black",
                                fill: rules[rule]["Color"]
                            })
                        }
                        updateProgress(rule, rules[rule]["Color"])
                        respectedRules++
                    } else {
                        errorFlag = true;
                        setErrors((prev) => [...prev, "<li>Your diagram does not describe correctly the following part of the problem: <b>" + rule.split("_")[1] + "</b> - " + val.reward + " point(s) lost"])
                        updateFailedRules(rule)
                        penalty += parseFloat(val.reward)
                    }
                }
            }
            let ruleCount = Object.keys(rules).filter((key) => key.indexOf("_Strict") < 0)

            props.setRespectedRules(respectedRules * 100 / (ruleCount.length))

            try {
                const result = await props.modeler.saveXML({ format: true })
                const { xml } = result
                setXml(xml)
            } catch (err) {
                console.error(err)
            }

            setAttempt(attempt + 1)
            setSuccess(errorFlag)
            if (errorFlag) {
                setModalShow(true);
                setCorrect(false)
                props.reduceGrade(penalty)
                API.reduceGrade(props.user.id, props.exercise.id, penalty)
            } else {
                setLintingErrors(undefined)
                setCorrect(true)
                setCongratulationsModalShow(true)
                props.setExerciseCorrect(true)
            }
        })
    }

    const updateProgress = (rule, color) => {
        let ursP = props.userRules
        if (ursP.indexOf(rule) < 0) {
            ursP.push(rule)
            props.setUserRules(ursP)
            API.unlockRule(props.user.id, props.exercise.id, JSON.stringify(props.userRules))
            API.increasePoints(props.user.id, props.exercise.id, rule).then((points) => {
                props.setScore(points)
            })
            API.getRules(props.exercise.id).then((values) => {
                let val = values.filter((ev) => { return ev.rule === rule })[0]
                let foundRule = "<li>"
                foundRule += `Correctly described the following part of the problem: <b style="color:${color}">` + rule.split("_")[1] + "</b> - worth " + val.reward + " point"
                if (val.reward !== 1) foundRule += "s"
                updateUnlockedRules(foundRule)
                props.setUnlockedRules(foundRule)
            })
        } else {
            props.setUserRules(ursP)
        }
    }

    const returnHome = async () => {
        try {
            const result = await props.modeler.saveXML({ format: true })
            const { xml } = result
            API.recordAttempt(props.user.id, props.exercise.id, "final", [], null, xml, "-")
        } catch (err) {
            console.error(err)
        }
    }

    return (<>
        <Row>
            <Col>
            </Col>
            <Col>
                <Button variant={correct ? "outline-dark" : "success"} onClick={() => { /*checkRules()*/checkSyntax() }}>Check syntax</Button>
            </Col>
            <Col>
                <Button variant={"success"} onClick={() => {
                    returnHome()
                    props.setMode("")
                }}>Return home</Button>
            </Col>
        </Row>

        <ErrorModal errors={errors} rules={unlockedRules} show={modalShow} onHide={() => setModalShow(false)} onShow={() => API.recordAttempt(props.user.id, props.exercise.id, "correctness", failedRules, null, xml, "no")} />
        <ModifiedWarningModal proceedaction={proceedAction} show={warningModalShow} onHide={() => setWarningModalShow(false)} />
        <CongratulationsModal show={congratulationsModalShow} onHide={() => setCongratulationsModalShow(false)} exercise={props.exercise}
            competition={props.competition} rewards={props.rewards} tutorial={props.tutorial} onShow={() => API.recordAttempt(props.user.id, props.exercise.id, "correctness", failedRules, null, xml, "yes")} />
        <SyntaxErrorModal attempt={attempt} syntaxErrors={syntaxErrors} show={showSyntaxModal} onSuccessG={() => {
            setShowSyntaxModal(false)
            checkRules()
        }} onSuccess={() => setShowSyntaxModal(false)} onFailure={() => setShowSyntaxModal(false)} user={props.user} exNum={props.exNum} noNames={noNames} />

    </>
    );
}

function SyntaxErrorModal(props) {
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton className="ms-3">
                <Modal.Title id="contained-modal-title-vcenter">
                    Syntax check of your diagram
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="ms-3 me-3">
                {props.syntaxErrors.length === 0 && !props.noNames && <>
                    <h5>Your diagram is syntactically correct. Congratulations!</h5>
                    {(((props.user.version % 2 === 1 && props.exNum === 2) ||
                        (props.user.version % 2 === 0 && props.exNum === 1))
                    ) && <h5>You can now check the semantic correctness of your diagram</h5>}
                </>}
                {props.syntaxErrors.length > 0 && <>
                    <h5>Your diagram contains some syntactic errors.</h5>
                    <h5>Please review the highlighted errors on the diagram before checking again.</h5>
                    {props.noNames && <h5>Moreover, ensure that <b>every element</b> in your diagram has a name.</h5>}
                </>}
                {props.noNames && props.syntaxErrors.length === 0 && <h5>Ensure that <b>every element</b> in your diagram has a name.</h5>}
            </Modal.Body>
            <Modal.Footer>
                {props.syntaxErrors.length === 0 && ((props.user.version % 2 === 1 && props.exNum === 2) ||
                    (props.user.version % 2 === 0 && props.exNum === 1)
                ) && !props.noNames && <>
                        <Button variant="success" onClick={props.onSuccessG}>Check correctness</Button>
                    </>}
                {((props.syntaxErrors.length === 0 && !((props.user.version % 2 === 1 && props.exNum === 2) ||
                    (props.user.version % 2 === 0 && props.exNum === 1)
                ))) && !props.noNames && <Button variant="success" onClick={props.onSuccess}>Close</Button>}
                {(props.syntaxErrors.length > 0 || props.noNames) && <Button variant="success" onClick={props.onFailure}>Close</Button>}
            </Modal.Footer>
        </Modal>
    )
}

function ErrorModal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton className="ms-3">
                <Modal.Title id="contained-modal-title-vcenter">
                    Incorrect, please try again.
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="ms-3 me-3">
                <h5>Please fix the following issues then submit again:</h5>
                <p style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: props.errors }}>

                </p>
                {props.rules.length > 0 && <>
                    <h5>You have unlocked the following rules:</h5>
                    <p style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: props.rules }}></p>
                </>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}



export default Footer;