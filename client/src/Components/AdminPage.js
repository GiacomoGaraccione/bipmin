import '../App.css';
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Table, Button } from "react-bootstrap"
import API from '../API';

const Papa = require('papaparse');


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