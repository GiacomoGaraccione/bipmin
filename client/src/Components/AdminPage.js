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
        </>
    )
}

export default AdminPage