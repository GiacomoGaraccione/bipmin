import '../App.css';
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Table, Button } from "react-bootstrap"
import API from '../API';

const Papa = require('papaparse');
const JSZip = require("jszip")
const FileSaver = require("file-saver")

function AdminPage(props) {
    const [selectedFile, setSelectedFile] = useState("")
    const [content, setContent] = useState("")


    const onChange = (e) => {
        let file = e.target.files[0]
        let fileData = new FileReader();
        fileData.onloadend = handleFile;
        fileData.readAsText(file);
        setSelectedFile(file)
    }

    const handleFile = (e) => {
        const content = e.target.result.toString();
        let header = "";

        Papa.parse(content, {
            header: false,
            complete: results => {
                header = results.data[0]
            }
        })
        API.getParticipants().then((names) => {
            let zip = new JSZip()
            let results = zip.folder("results")
            for (let i = 0; i < names.length; i++) {
                let done = false
                let inner = results.folder(names[i].name)
                let start = content.indexOf(names[i].name)
                let end = content.indexOf(names[i].name, start + 1)
                while (!done) {
                    let row = content.slice(start, end)
                    let beforeDiag = row.slice(0, row.indexOf("<?xml"))
                    let info = beforeDiag.split("\"")[0]
                    let name = info.split(",")[0]
                    let exerciseOrder = parseInt(info.split(",")[1])
                    let attempt = info.split(",")[2]
                    let mode = info.split(",")[3]
                    let afterDiag = row.slice(row.indexOf("</bpmn2:definitions>") + "</bpmn2:definitions>".length).slice(2)
                    let userMode = parseInt(afterDiag.split(",")[3])
                    let exercise = ""
                    if (userMode === 1 || userMode === 2) {
                        if (exerciseOrder === 1) {
                            exercise = "seaside"
                        } else if (exerciseOrder === 2) {
                            exercise = "elections"
                        }
                    } else if (userMode === 3 || userMode === 4) {
                        if (exerciseOrder === 1) {
                            exercise = "elections"
                        } else if (exerciseOrder === 2) {
                            exercise = "seaside"
                        }
                    }
                    let filename = name + "_" + exercise + "_" + mode + "_attempt" + attempt

                    //genera una stringa che può essere salvata come .xml, questo xml viene importato correttamente da signavio e produce un diagramma che rappresenta un tentativo di soluzione
                    let diag = row.slice(row.indexOf("<?xml"), row.indexOf("</bpmn2:definitions>") + "</bpmn2:definitions>".length).split("\"\"").join("\"")
                    start = end
                    inner.file(filename + ".xml", diag)
                    end = content.indexOf(names[i].name, start + 1)
                    if (end < 0) {
                        if (i + 1 < names.length) {
                            end = content.indexOf(names[i + 1].name)
                        } else {
                            end = content.length
                        }
                        done = true
                    }
                }
                let row = content.slice(start, end)
                let beforeDiag = row.slice(0, row.indexOf("<?xml"))
                let afterDiag = row.slice(row.indexOf("</bpmn2:definitions>") + "</bpmn2:definitions>".length).slice(2)
                let diag = row.slice(row.indexOf("<?xml"), row.indexOf("</bpmn2:definitions>") + "</bpmn2:definitions>".length).split("\"\"").join("\"")
                let info = beforeDiag.split("\"")[0]
                let name = info.split(",")[0]
                let exerciseOrder = parseInt(info.split(",")[1])
                let attempt = info.split(",")[2]
                let mode = info.split(",")[3]
                let userMode = parseInt(afterDiag.split(",")[3])
                let exercise
                if (userMode === 1 || userMode === 2) {
                    if (exerciseOrder === 1) {
                        exercise = "seaside"
                    } else if (exerciseOrder === 2) {
                        exercise = "elections"
                    }
                } else if (userMode === 3 || userMode === 4) {
                    if (exerciseOrder === 1) {
                        exercise = "elections"
                    } else if (exerciseOrder === 2) {
                        exercise = "seaside"
                    }
                }
                let filename = name + "_" + exercise + "_" + mode + "_attempt" + attempt
                inner.file(filename + ".xml", diag)
            }
            zip.generateAsync({ type: "blob" }).then((blob) => {
                FileSaver.saveAs(blob, "results.zip")
            })
        })


        setContent(content)
    }

    const onSubmit = (e) => {
        e.preventDefault();
        API.loadFile(content)
            .then(() => setSelectedFile(""));
    }

    const getScores = () => {
        API.getScores().then((scores) => {
            let csv = Papa.unparse(scores)
            const blob = new Blob([csv])
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob, { type: "text/plain" })
            a.download = "Log - Scores"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        })
    }

    const getRules = () => {
        API.getRulesFound().then((rules) => {
            let csv = Papa.unparse(rules)
            const blob = new Blob([csv])
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob, { type: "text/plain" })
            a.download = "Log - Rules"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        })
    }

    const getAttempts = () => {
        API.getAttempts().then((attempts) => {
            let csv = Papa.unparse(attempts)
            const blob = new Blob([csv])
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob, { type: "text/plain" })
            a.download = "Log - Attempts"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        })
    }

    const getTimestamps = () => {
        API.getTimestamps().then((timestamps) => {
            let csv = Papa.unparse(timestamps)
            const blob = new Blob([csv])
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob, { type: "text/plain" })
            a.download = "Log - Timestamps"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        })
    }

    return (
        <>
            <h3>Select a file to load data into the system </h3>
            <p></p>
            <div>
                <div >
                    <input type='file' id='customFile'
                        accept=".csv"
                        onChange={onChange}
                    />
                    <p></p>
                </div>
            </div>
            <Col>
                <Button onClick={onSubmit} disabled={(selectedFile === "")}>Upload!</Button>
            </Col>
            <h3>Download data</h3>
            <Col>
                <Button onClick={getScores}>Fetch scores</Button>
            </Col>
            <Col>
                <Button onClick={getRules}>Fetch rules found</Button>
            </Col>
            <Col>
                <Button onClick={getAttempts}>Fetch attempts</Button>
            </Col>
            <Col>
                <Button onClick={getTimestamps}>Fetch timestamps</Button>
            </Col>
        </>
    )
}

export default AdminPage