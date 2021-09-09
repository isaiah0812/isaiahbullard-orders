import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

export default class ConfirmPrintModal extends React.Component {
  state = {
    completing: false
  }

  render() {
    return (
      <Modal
        {...(this.props)}
        centered
      >
        <Modal.Header closeButton />
        <Modal.Body>
          {this.state.completing ? <Spinner animation="border" color="rgb(41, 179, 241)" /> : `Are you sure you want to print order ${this.props.orderid}?`}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.props.onHide()} variant="danger" disabled={this.state.completing}>No</Button>
          <Button onClick={() => {
            this.setState({
              completing: true
            })
            this.props.confirm(() => {
              this.setState({
                completing: false
              })
              this.props.onHide()
            })
          }} variant="success" disabled={this.state.completing || this.props.listSize === 0}>Yes</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}