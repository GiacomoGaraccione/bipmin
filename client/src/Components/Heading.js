import React, { useEffect, useState } from "react";
import { Button, Col, Modal } from "react-bootstrap";


function Heading(props) {
    const [exercise, setExercise] = useState();

    useEffect(() => {
        setExercise(props.exercise)
    }, [props]);


    return (<>
    <Col style={{display:'flex', justifyContent: 'left'}}>
      {props.competition?  
        <h4>{exercise? "Challenge: " + exercise.title : "loading" }</h4>
      :
        <h4>{exercise? "Exercise: " + exercise.title : "loading" }</h4>
      } 
    </Col>
      
    </>
         );
}


export default Heading;