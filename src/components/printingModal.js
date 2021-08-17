import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Spinner from 'react-bootstrap/Spinner'

export default class PrintingModal extends React.Component {
  state = {
    compiling: false
  }

  printAll = (orders) => {
    this.setState({
      compiling: true
    }, () => {
      let urls = []
      for(const order of orders) {
        urls.push(order.shippingLabelInfo.url)
      }

      // Move to complete all orders
      fetch(`${process.env.REACT_APP_API_URL}/orders/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labelUrls: urls
        })
      }).then(res => res.blob()).then(blob => {
        console.log(blob)
        const downloadUrl = URL.createObjectURL(blob)
        console.log(downloadUrl)
        let tempLink = document.createElement('a')
        tempLink.href = downloadUrl

        const fileDate = new Date()
        tempLink.setAttribute('download', `${fileDate.toISOString()}.pdf`)
        tempLink.click()

        tempLink.remove()
        this.setState({
          compiling: false
        })
      })
    })
  }

  render() {
    return (
      <Modal
        {...this.props}
        centered
        scrollable
        size="xl"
      >
        <Modal.Header closeButton>Printing Orders</Modal.Header>
        <Modal.Body>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer Name</th>
                <th>Items x Quantity</th>
                <th>Label Link</th>
                <th>Reciept Link</th>
              </tr>
            </thead>
            <tbody>
              {this.props.orders.map((order, key) => {
                const { id, name, items, shippingLabelInfo, receiptUrl } = order
                return (
                  <tr key={key}>
                    <td>
                      {id}
                    </td>
                    <td>
                      {name}
                    </td>
                    <td>
                      {items.map(item => <div>{item.name} x {item.quantity}</div>)}
                    </td>
                    <td>
                      <a href={shippingLabelInfo.url} target="_blank" rel="noreferrer">Label</a>
                    </td>
                    <td>
                      <a href={receiptUrl} target="_blank" rel="noreferrer">Reciept</a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => this.props.onHide()}>Close</Button>
          <Button variant="outline-danger" onClick={() => this.props.clear()}>Clear</Button>
          <Button variant="success" onClick={() => this.printAll(this.props.orders)} disabled={this.state.compiling}>
            {this.state.compiling ? <Spinner animation="border" color="#FFFFFF" size="md" /> : "Print All"}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}