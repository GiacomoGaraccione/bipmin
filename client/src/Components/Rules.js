import { Container, Row } from 'react-bootstrap';
import React, { useEffect, useState } from "react";

function Rules(props) {

    return (
        <>
            <Row className='p-0 m-0 mb-4'><b className="text-start">Rules previously found:</b></Row>
            <Row>
                {props.userRules.length > 0 && <p style={{ whiteSpace: "pre-wrap", fontStyle: "italic", overflowY: "scroll", height: "600px" }} dangerouslySetInnerHTML={{ __html: props.userRules }}></p>}
                {props.userRules.length === 0 && <i>You have satisfied no defined rules yet.</i>}
            </Row>
        </>
    )
}

export default Rules