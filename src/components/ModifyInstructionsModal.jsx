import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModifyInstructionsModal = ({
  show,
  handleClose,
  originalInstructions,
  saveInstructions,
}) => {
  const [newInstructions, setNewInstructions] = useState(originalInstructions);

  const handleSave = () => {
    saveInstructions(newInstructions);
    handleClose();
  };

  const handleReset = () => {
    setNewInstructions(originalInstructions);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modify Instructions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formInstructions">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onMouseDown={handleSave}>
          Save Changes
        </Button>
        <Button variant="secondary" onMouseDown={handleReset}>
          Set Default
        </Button>
        <Button variant="tertiary" onMouseDown={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModifyInstructionsModal;
