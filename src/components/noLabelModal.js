import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export default class NoLabelModal extends React.Component {
  render() {
    return (
      <Modal
      {...(this.props)}
      centered
      >
        <Modal.Header closeButton />
        <Modal.Body>
          No label for order {this.props.orderId}.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.props.onHide()} variant="danger">Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}