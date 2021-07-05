import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export default class ConfirmPrintModal extends React.Component {
  render() {
    return (
      <Modal
        {...(this.props)}
        centered
      >
        <Modal.Header closeButton />
        <Modal.Body>
          Are you sure you want to print {this.props.listSize} orders?
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.props.onHide()} variant="danger">No</Button> 
          <Button onClick={() => this.props.onHide()} variant="success">Yes</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}