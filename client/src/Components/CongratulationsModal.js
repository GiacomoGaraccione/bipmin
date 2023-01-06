import { Button, Modal } from "react-bootstrap";
import React from "react"

function CongratulationsModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="ms-auto">
          Congratulations!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ display: "flex", justifyContent: "center" }}>
        <table>
          <tr>
            <td>
              <p className="mt-3">
                <b style={{ fontSize: "120%" }} >
                  You have successfully completed this exercise.
                </b>
              </p>
            </td>
          </tr>
        </table>
      </Modal.Body>
      <Modal.Footer style={{ display: "flex", justifyContent: "center" }}>
        <Button variant="success" onClick={props.onHide} className="ps-5 pe-5">OK</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CongratulationsModal;