import { Accordion, Col, ListGroup, ListGroupItem, Button, Modal, Row, ProgressBar } from "react-bootstrap";
import React from "react"

function ModifiedWarningModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Warning
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Your changes to the current exercise will not be saved. Are you sure you want to proceed?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-dark" onClick={props.onHide}>No</Button>
        <Button variant="success" onClick={() => { props.proceedaction() }}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModifiedWarningModal;