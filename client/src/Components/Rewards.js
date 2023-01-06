import { Container, Row, ProgressBar, Form, Button } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import API from '../API';


function Rewards(props) {

    const handleSubmit = (event) => {
        event.preventDefault()
        API.buyPieces(props.user.id, props.exercise.id, props.spent + 1, props.score - 1)
        props.setScore(props.score - parseInt(1))
        props.setSpent(props.spent + parseInt(1))
    }

    return <Container className='p-3 m-0'>
        <Row className='p-0 m-0 mb-4'><b className="text-start">Total pieces collected:  {props.spent} / 12</b></Row>
        <Row>
            <img src={require('../resources/reward_' + props.spent + '.jpg')} />
        </Row>
        <Row>
            <p className="mt-2 mb-0" style={{ fontSize: "15px" }}><i>Correctness of previous solution: {props.respectedRules.toFixed(2)}%.</i></p>
        </Row>
        <Row>
            <ProgressBar className="m-2" now={props.respectedRules} label={`${Math.round(props.respectedRules)}%`} />
        </Row>
        <Row>
            <p className="mt-2 mb-0" style={{ fontSize: "15px" }}><i>Current grade: {props.grade}.</i></p>
        </Row>
        <Row>
            <p className="mt-2 mb-0" style={{ fontSize: "15px" }}><i>Current points: {props.score}.</i></p>
        </Row>
        {props.score >= 1 &&
            <>
                <Row>
                    <p className="mt-2 mb-0" style={{ fontSize: "15px" }}><b>Do you want to buy a new piece?</b></p>
                </Row>
                <Row>
                    <Button variant="success" type="submit" onClick={handleSubmit} disabled={props.score === 0}>Buy</Button>
                </Row>
            </>}
    </Container>
}

export default Rewards;