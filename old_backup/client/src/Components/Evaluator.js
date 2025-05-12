import '../App.css';
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Table, Button } from "react-bootstrap"
import Modeler from 'bpmn-js/lib/Modeler'
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import lintModule from 'bpmn-js-bpmnlint';
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';
//import bpmnlintConfig from '../.bpmnlintrc';
import * as bpmnlintConfig from '../bundled-config';
import Footer from './Footer';
import API from '../API'
import Sidebar from './Sidebar';
import Heading from './Heading';


function Evaluator(props) {
    const [lintState, setLintState] = useState(false);
    const [linting, setLinting] = useState();
    const [exercise, setExercise] = useState();
    const [rulesEx1, setRulesEx1] = useState([])
    const [rulesEx2, setRulesEx2] = useState([])
    const [mod, setModeler] = useState();
    const [files, setFiles] = useState([])
    const [fileIndex, setFileIndex] = useState(0)
    const [diagram, setDiagram] = useState(false)
    const [filename, setFilename] = useState("")
    const [output, setOutput] = useState([])

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
        setModeler(modeler)
        API.getExercise(1).then((ex1) => {
            setRulesEx1(JSON.parse(ex1.rules))
            API.getExercise(2).then((ex2) => {
                setRulesEx2(JSON.parse(ex2.rules))
            })
        })
    }, [])

    const onChange = (e) => {
        setFiles(e.target.files)
        setFileIndex(0)
    }

    const setNextDiagram = () => {
        let file = files[fileIndex]
        let fileData = new FileReader();
        setFilename(file.name)
        fileData.onloadend = (e) => {
            mod.importXML(e.target.result)
        };
        fileData.readAsText(file);
        setDiagram(true)
    }

    function checkLinting() {
        return new Promise((resolve) => {
            mod.on('linting.completed', (event) => {
                let obj = event.issues
                for (let prop in obj) {
                    obj[prop] = obj[prop].filter(item => item.rule !== "label-required");
                    if (obj[prop].length === 0) {
                        delete obj[prop];
                    }
                }
                resolve(obj)
            })
        })
    }

    const verifyRules = () => {
        let errors = []
        let checkedRules = []
        const verifyPoolNumber = (elementRegistry) => {
            return (elementRegistry.filter((e) => e.collapsed === false).length > 1)
        }
        const verifyOnlyTask = (elementRegistry) => {
            let elements = elementRegistry.filter((e) =>
                e.type !== "bpmn:Collaboration" &&
                e.type.indexOf("Flow") < 0 &&
                e.type !== "label" &&
                e.type !== "bpmn:Participant" &&
                e.type !== "bpmn:Lane" &&
                e.type !== "bpmn:StartEvent" &&
                e.type !== "bpmn:EndEvent")
            let ret = false
            elements.forEach((e) => {
                if (e.type !== "bpmn:Task" && e.type !== "bpmn:UserTask") ret = true
            })
            if (elements.length === 0) ret = true
            return ret
        }
        const verifyEndEventFlow = (elementRegistry) => {
            let elements = elementRegistry.filter((e) =>
                e.type !== "bpmn:Collaboration" &&
                e.type.indexOf("Flow") < 0 &&
                e.type !== "label" &&
                e.type !== "bpmn:Participant" &&
                e.type !== "bpmn:Lane" &&
                e.type !== "bpmn:EndEvent")
            let err = false
            if (elements.filter((e) => e.outgoing.filter((f) => f.type === "bpmn:SequenceFlow").length <= 0).length > 0) err = true
            return err
        }
        const verifyMessageThrowTask = (elementRegistry) => {
            return (elementRegistry.filter((e) => e.outgoing.filter((flow) => flow.type === "bpmn:MessageFlow").length <= 0).length <= 0)
        }
        const verifyMessageCatchTask = (elementRegistry) => {
            return (elementRegistry.filter((e) => e.incoming.filter((flow) => flow.type === "bpmn:MessageFlow").length <= 0).length <= 0)
        }
        const verifyMessageFlow = (elementRegistry) => {
            const eventDefinition = (e) => {
                if (e.type !== "bpmn:IntermediateThrowEvent" && e.type !== "bpmn:EndEvent") {
                    return true
                } else {
                    if (!e.businessObject.eventDefinitions) {
                        return true
                    } else {
                        return e.businessObject.eventDefinitions[0].id.split("_")[0] !== "MessageEventDefinition"
                    }
                }

            }
            return (elementRegistry.filter((e) => e.source.type !== "bpmn:Participant" && e.source.type !== "bpmn:SendTask" && e.source.type !== "bpmn:ServiceTask" && eventDefinition(e.source)).length > 0)
        }
        const verifyTimerEventPresence = (elementRegistry) => {
            if (elementRegistry.length <= 0) {
                return true
            } else {
                let ret = true
                elementRegistry.forEach((e) => {
                    if (e.businessObject.eventDefinitions) {
                        if (e.businessObject.eventDefinitions[0].id.split("_")[0] === "TimerEventDefinition") ret = false
                    }
                })
                return ret
            }
        }
        let elementRegistry = mod.get('elementRegistry').getAll()

        let poolNumber = verifyPoolNumber(elementRegistry.filter((e) => e.type === "bpmn:Participant"))
        checkedRules.push("PoolNumber")
        if (!poolNumber) errors.push("PoolNumber")
        let onlyTask = verifyOnlyTask(elementRegistry)
        checkedRules.push("OnlyTask")
        if (!onlyTask) errors.push("OnlyTask")
        checkedRules.push("TaskPresence")
        if (elementRegistry.filter((e) => e.type === "bpmn:Task" || e.type === "bpmn:UserTask").length <= 0) errors.push("TaskPresence")
        checkedRules.push("ManualTaskPresence")
        if (elementRegistry.filter((e) => e.type === "bpmn:ManualTask").length > 0) errors.push("ManualTaskPresence")
        if (elementRegistry.filter((e) => e.type === "bpmn:SendTask").length > 0) {
            let messageThrowTask = verifyMessageThrowTask(elementRegistry.filter((e) => e.type === "bpmn:SendTask"))
            checkedRules.push("MessageThrowTask")
            if (!messageThrowTask) errors.push("MessageThrowTask")
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:ReceiveTask").length > 0) {
            let messageCatchTask = verifyMessageCatchTask(elementRegistry.filter((e) => e.type === "bpmn:ReceiveTask"))
            checkedRules.push("MessageCatchTask")
            if (!messageCatchTask) errors.push("MessageCatchTask")
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateThrowEvent" || e.type === "bpmn:IntermediateCatchEvent").length > 0) {
            checkedRules.push("BlankEvent")
            if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateThrowEvent" || e.type === "bpmn:IntermediateCatchEvent").filter((e) => !e.businessObject.eventDefinitions).length > 0) {
                errors.push("BlankEvent")
            }
            if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateThrowEvent").length > 0) {
                checkedRules.push("MessageThrowEvent")
                if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateThrowEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").filter((e) => e.outgoing.filter((flow) => flow.type === "bpmn:MessageFlow").length <= 0).length > 0) errors.push("MessageThrowEvent")
            }
            if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateCatchEvent" && e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").length > 0) {
                checkedRules.push("MessageCatchEvent")
                if (elementRegistry.filter((e) => e.type === "bpmn:IntermediateCatchEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").filter((e) => e.incoming.filter((flow) => flow.type === "bpmn:MessageFlow").length <= 0).length > 0) errors.push("MessageCatchEvent")
            }
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:StartEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").length > 0) {
            if (!checkedRules.includes("MessageCatchEvent")) checkedRules.push("MessageCatchEvent")
            if (elementRegistry.filter((e) => e.type === "bpmn:StartEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").filter((e) => e.incoming.filter((f) => f.type === "bpmn:MessageFlow").length <= 0).length > 0) {
                if (!errors.includes("MessageCatchEvent")) errors.push("MessageCatchEvent")
            }
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:EndEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").length > 0) {
            if (!checkedRules.includes("MessageThrowEvent")) checkedRules.push("MessageThrowEvent")
            if (elementRegistry.filter((e) => e.type === "bpmn:EndEvent").filter((e) => e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "MessageEventDefinition").filter((e) => e.outgoing.filter((f) => f.type === "bpmn:MessageFlow").length <= 0).length > 0) {
                if (!errors.includes("MessageThrowEvent")) errors.push("MessageThrowEvent")
            }
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:MessageFlow").length > 0) {
            let messageFlow = verifyMessageFlow(elementRegistry.filter((e) => e.type === "bpmn:MessageFlow"))
            checkedRules.push("MessageFlow")
            if (messageFlow) errors.push("MessageFlow")
        }
        if (elementRegistry.filter((e) => e.type === "bpmn:BoundaryEvent").length > 0) {
            let boundaryEvents = elementRegistry.filter((e) => e.type === "bpmn:BoundaryEvent")
            let err = false
            const reachEnd = (el) => {
                if (el.type === "bpmn:EndEvent") {
                    return true
                } else {
                    if (el.outgoing[0]) {
                        return (reachEnd(el.outgoing[0].target))
                    } else {
                        return false
                    }
                }
            }
            boundaryEvents.forEach((e) => {
                if (e.outgoing[0]) {
                    if (!reachEnd(e.outgoing[0].target)) err = true
                } else {
                    err = true
                }
            })
            checkedRules.push("BoundaryEventFlow")
            if (err) errors.push("BoundaryEventFlow")
            checkedRules.push("BoundTaskFlow")
            if (elementRegistry.filter((e) => e.type === "bpmn:BoundaryEvent").filter((e) => e.host).filter((e) => e.host.outgoing.filter((f) => f.type === "bpmn:SequenceFlow").length <= 0).length > 0) errors.push("BoundTaskFlow")
            checkedRules.push("ServiceTaskBoundaryEvent")
            if (elementRegistry.filter((e) => e.type === "bpmn:BoundaryEvent" && e.host.type === "bpmn:ServiceTask").length > 0) errors.push("ServiceTaskBoundaryEvent")
            checkedRules.push("BlankBoundaryEvent")
            if (elementRegistry.filter((e) => e.type === "bpmn:BoundaryEvent" && !e.businessObject.eventDefinitions).length > 0) errors.push("BlankBoundaryEvent")
        }
        checkedRules.push("TimerEventPresence")
        if (verifyTimerEventPresence(elementRegistry.filter((e) => e.type === "bpmn:IntermediateCatchEvent" || e.type === "bpmn:BoundaryEvent" || e.type === "bpmn:StartEvent"))) {
            errors.push("TimerEventPresence")
        }
        if (elementRegistry.filter((e) => e.type.indexOf("Event") >= 0 && e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "SignalEventDefinition").length > 0) {
            let signalEvents = elementRegistry.filter((e) => e.type.indexOf("Event") >= 0 && e.businessObject.eventDefinitions).filter((e) => e.businessObject.eventDefinitions[0].id.split("_")[0] === "SignalEventDefinition")
            checkedRules.push("SignalEventsPresence")
            if (signalEvents.filter((e) => e.type === "bpmn:IntermediateCatchEvent").length <= 0 || signalEvents.filter((e) => e.type === "bpmn:IntermediateThrowEvent").length <= 0) {
                errors.push("SignalEventsPresence")
            } else {
                checkedRules.push("SignalEventsNaming")
                let throwSignals = signalEvents.filter((e) => e.type === "bpmn:IntermediateThrowEvent")
                let catchSignals = signalEvents.filter((e) => e.type === "bpmn:IntermediateCatchEvent")
                let err = false
                throwSignals.forEach((e) => {
                    if (e.businessObject.name) {
                        if (catchSignals.filter((s) => s.businessObject.name).filter((s) => s.businessObject.name === e.businessObject.name).length <= 0) err = true
                    }
                })
                catchSignals.forEach((e) => {
                    if (e.businessObject.name) {
                        if (throwSignals.filter((s) => s.businessObject.name).filter((s) => s.businessObject.name === e.businessObject.name).length <= 0) err = true
                    }
                })
                if (err) errors.push("SignalEventsNaming")
            }
        }
        checkedRules.push("EndEventFlow")
        if (verifyEndEventFlow(elementRegistry)) errors.push("EndEventFlow")
        if (elementRegistry.filter((e) => e.type === "bpmn:Lane").length > 0) {
            checkedRules.push("HumanLane")
            if (elementRegistry.filter((e) => e.type === "bpmn:Lane").filter((e) => e.businessObject.name).filter((e) => e.businessObject.name.toLowerCase().includes("system")).length > 0) errors.push("HumanLane")
        }
        checkedRules.push("SingleStartEvent")
        if (elementRegistry.filter((e) => e.type === "bpmn:Participant").filter((e) => e.children.filter((el) => el.type === "bpmn:StartEvent").length > 1).length > 0) errors.push("SingleStartEvent")
        let namedElements = elementRegistry.filter((e) => e.businessObject.name && e.type !== "label" && e.type.indexOf("Flow") < 0)
        let criteria
        if (filename.split("_")[1] === "elections") {
            criteria = {
                ElectionDefinition: [["define", "specify", "call", "appoint"]],
                MailNotification: [["notify", "email", "e-mail", "notification", "mail"]],
                ResultsPublication: [["publish", "display", "show", "announce", "results"]],
                VotingPreferences: [["choose", "express", "specify", "vote", "preference", "candidate", "eligible"]],
                SecurityCode: [["code", "security", "verification", "8-digit", "8 digit", "otp"]],
                VotingStart: [["election day", "day of election", "voting day", "day of voting", "appointed day", "selected day", "specified day", "chosen day"]],
                VoteConfirmation: [["confirm", "decide", "final", "select"]],
                VotingSignup: [["credentials", "username", "password", "login", "signup", "log in", "sign up", "sign in", "access", "log on"]],
                ElectionEnd: [["over", "end", "finish", "done", "complete"]],
                AccessFailure: [["fail", "wrong", "error", "unsuccessful", "wrong", "bad", "not accept", "not done", "not made", "not successful"]]
            }
        } else if (filename.split("_")[1] === "seaside") {
            criteria = {
                ReservationReminder: [["previous day", "day before"]],
                RegistrationDataEntry: [["personal information", "personal details", "document", "scan", "info", "id", "cell phone", "cellphone"]],
                RecapMessage: [["summary", "recap"]],
                ReservationCancellation: [["cancel", "remove", "quit", "delete", "refuse"]],
                DocumentVerification: [["verify", "check", "validate", "confirm", "evaluate", "approve", "accept"]],
                CancellationTimeout: [["two days before", "2 days before"]],
                EndingQuestionnaire: [["fill", "write", "complete", "do"], ["questionnaire"]],
                Reservation: [["specify", "define", "choose", "day", "people"]],
                ReservationEnd: [["period end", "reservation end", "reservation over", "reservation finished", "reservation done"]],
                ReminderMessage: [["remind", "unique code"]]
            }
        }
        const checkForStringsInArrays = (arrays, objects) => {
            return objects.some((object) => {
                return arrays.every((array) => {
                    return array.some((string) => object.businessObject.name.toLowerCase().includes(string));
                });
            });
        }
        for (let r of Object.entries(criteria)) {
            checkedRules.push(r[0])
            if (!checkForStringsInArrays(r[1], namedElements)) errors.push(r[0])
        }

        return { errors: errors, checkedRules: checkedRules }
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
                        if (event.target.businessObject.name) {
                            if (event.target.businessObject.name.toLowerCase().includes(el) && event.target.type === "bpmn:" + conditions[target]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)) {
                                return true
                            }
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
                        if (event.target.businessObject.name) {
                            if (event.target.businessObject.name.toLowerCase().includes(el) && event.target.type === "bpmn:" + conditions[messageTarget]["Element"] && event.type === "bpmn:MessageFlow" && checkEvent(event)) {
                                return true
                            }
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
                        if (event.source.businessObject.name) {
                            if (event.source.businessObject.name.toLowerCase().includes(el) && event.source.type === "bpmn:" + conditions[messageSender]["Element"] && event.type === "bpmn:MessageFlow" && checkEvent(event)) {
                                return true
                            }
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
                        if (event.source.businessObject.name) {
                            if (event.source.businessObject.name.toLowerCase().includes(el) && event.source.type === "bpmn:" + conditions[parent]["Element"] && event.type === "bpmn:SequenceFlow" && checkEvent(event)) {
                                return true
                            }
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
                        if (event.host.businessObject.name) {
                            if (event.host.businessObject.name.toLowerCase().includes(el)) return true
                        }
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

    const verifyExperimentRules = (rules) => {
        let errors = []
        let correct = []
        let elementRegistry = mod.get('elementRegistry').getAll().filter((e) => e.businessObject.name && e.type !== "label" && e.type.indexOf("Flow") < 0)
        for (let rule in rules) {
            if (rule.split("_")[0] === "GroupRules") {
                let solutionOptions = rules[rule]
                for (let option of solutionOptions) {
                    let wrongElements = 0
                    for (let element in option) {
                        let conditions = option[element]
                        let correctEl = evaluateElementConditions(element, conditions, elementRegistry)
                        if (!correctEl) wrongElements++
                    }
                    if (wrongElements > 0) {
                        errors.push(rule)
                    } else {
                        correct.push(rule)
                    }
                }
            } else {
                let correctEl = evaluateElementConditions(rule.split("_")[0], rules[rule], elementRegistry)
                if (correctEl) {
                    correct.push(rule)
                } else {
                    errors.push(rule)
                }
            }
        }
        return { errors: errors, correct: correct }
    }

    const evaluateDiagram = async () => {
        let username = filename.split("_")[0]
        let exercise = filename.split("_")[1]
        let mode = filename.split("_")[2]
        let attempt = parseInt(filename.split("_")[3].replace("attempt", ""))
        let e
        if (exercise === "seaside") {
            e = verifyExperimentRules(rulesEx1)
        } else if (exercise === "elections") {
            e = verifyExperimentRules(rulesEx2)
        }
        let errors = [...new Set(e.errors)]
        let correct = [...new Set(e.correct)]
        API.addOldRules(username, exercise, errors, errors.length, correct, correct.length)
        /*mod.get("linting").toggle(true)
        let result = Object.entries(await checkLinting())
        let errors = []
        result.forEach((e) => {
            let errs = []
            e[1].forEach((err) => errs.push(err["rule"]))
            let obj = { element: e[0], errors: errs }
            errors.push(obj)
        })
        let e = verifyRules()
        API.addSyntax(username, exercise, mode, attempt, errors, errors.length)
        API.addErrors(username, exercise, mode, attempt, e)
        mod.get("linting").toggle(false)

        let arr = mod.get('elementRegistry').getAll()
        let grouped = arr.reduce((acc, curr) => {
            let key = curr.type;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(curr);
            return acc;
        }, {});
        let size = []
        Object.entries(grouped).forEach((e) => {
            if (e[0].indexOf("bpmn:") >= 0) {
                e[0] = e[0].replace("bpmn:", "")
            }
            size.push(e[0] + ":" + e[1].length)
        })
        API.addSizes(username, exercise, mode, attempt, size)*/
        setFileIndex(fileIndex + 1)
        setDiagram(false)
    }


    return (
        <Row>
            <Col xs={3} className="ms-4">
                <h3>Select files to evaluate </h3>
                <p></p>
                <div>
                    <div >
                        <input type='file' id='customFile'
                            accept=".xml, .bpmn"
                            onChange={onChange} multiple
                        />
                        <p></p>
                    </div>
                </div>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <h4>Remaining files to evaluate: {files.length - fileIndex}</h4>
                <Button id="setter" onClick={() => setNextDiagram()} disabled={files.length <= 0 && files.length - fileIndex > 0}>Set next diagram</Button>
                <Button id="evaluator" onClick={() => evaluateDiagram()} disabled={!diagram}>Evaluate diagram</Button>
            </Col>
            <Col xs={8}>
                <Row className='m-2 mt-3'>
                    <h1 style={{ display: 'flex', justifyContent: 'left' }}>Evaluator</h1>
                </Row>
                <Row>
                    <div
                        id="container"
                        style={{
                            border: "1px solid #000000",
                            height: "77vh",
                        }}
                    ></div>
                </Row>
            </Col>
        </Row>
    )
}

export default Evaluator