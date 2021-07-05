import React from 'react'
import axios from 'axios'
import './App.css';
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { OPEN, COMPLETED, CANCELLED } from './constants/orderStatus'
import ConfirmPrintModal from './components/confirmPrintModal'
import FormCheck from 'react-bootstrap/FormCheck'

export default class App extends React.Component {

  state = {
    orders: [],
    openOrder: {
      id: '',
      customerId: '',
      items: [],
      shippingCost: 0,
      orderCost: 0,
      paymentIds: [],
      shippingAddress: undefined,
    },
    confirmPrintVisible: false,
    openStateFilter: false,
    completedStateFilter: false,
    canceledStateFilter: false,
  }

  showConfirmPrint = () => this.setState({confirmPrintVisible: true})
  hideConfirmPrint = () => this.setState({confirmPrintVisible: false})

  toggleAllOrdersFilter = () => this.setState({openStateFilter: false, completedStateFilter: false, canceledStateFilter: false})
  toggleOpenStateFilter = () => this.setState({openStateFilter: true, completedStateFilter: false, canceledStateFilter: false})
  toggleCompletedStateFilter = () => this.setState({openStateFilter: false, completedStateFilter: true, canceledStateFilter: false})
  toggleCanceledStateFilter = () => this.setState({openStateFilter: false, completedStateFilter: false, canceledStateFilter: true})

  allOrders = () => !this.state.openStateFilter && !this.state.completedStateFilter && !this.state.canceledStateFilter

  openCount = () => this.state.orders.filter(order => order.orderStatus === OPEN)

  componentDidMount = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/orders`)
      .then(result => result.data)
      .then(orders => this.setState({ orders: orders }))
      .catch(error => console.error(error))
  }

  render() {

    return (
      <Container fluid style={{ padding: '1%' }}>
        <Button onClick={() => this.showConfirmPrint()} variant="success" style={{ marginBottom: '0.5em', float: 'right' }}>Print all</Button>
        <FormCheck 
          type="radio" 
          style={{
            float: 'right', 
            margin: '0.5em' 
          }} 
          checked={this.state.canceledStateFilter} 
          label="CANCELED" 
          onClick={() => this.toggleCanceledStateFilter()} />
        <FormCheck 
          type="radio"
          style={{
            float: 'right',
            margin: '0.5em'
          }}
          checked={this.state.completedStateFilter}
          label="COMPLETED" 
          onClick={() => this.toggleCompletedStateFilter()} />
        <FormCheck 
          type="radio"
          style={{
            float: 'right',
            margin: '0.5em'
          }}
          checked={this.state.openStateFilter}
          label="OPEN" 
          onClick={() => this.toggleOpenStateFilter()} />
        <FormCheck 
          type="radio"
          style={{
            float: 'right',
            margin: '0.5em'
          }}
          checked={() => this.allOrders()}
          label="ALL" 
          onClick={() => this.toggleAllOrdersFilter()} />
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>ID</th>
              <th>Line 1</th>
              <th>Line 2</th>
              <th>Line 3</th>
              <th>City</th>
              <th>State</th>
              <th>Zip Code</th>
              <th>Total Cost</th>
              <th>Shipping Cost</th>
              <th>Order Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.orders.filter((order) => {
              if(this.state.openStateFilter) {
                return order.orderStatus === OPEN
              } else if(this.state.completedStateFilter) {
                return order.orderStatus === COMPLETED
              } else if(this.state.canceledStateFilter) {
                return order.orderStatus === CANCELLED
              } else {
                return true
              }
            }).map((order, key) => {
              const { line1, line2, line3, city, state, postalCode } = order.shippingAddress ? order.shippingAddress : {}
              return (
                <tr key={key}>
                  <td>
                    {order.id}
                  </td>
                  <td>
                    {line1 ? line1 : ''}
                  </td>
                  <td>
                    {line2 ? line2 : ''}
                  </td>
                  <td>
                    {line3 ? line3 : ''}
                  </td>
                  <td>
                    {city ? city : ''}
                  </td>
                  <td>
                    {state ? state : ''}
                  </td>
                  <td>
                    {postalCode ? postalCode : ''}
                  </td>
                  <td>
                    {`$${order.orderCost.toFixed(2)}`}
                  </td>
                  <td>
                    {`$${order.shippingCost.toFixed(2)}`}
                  </td>
                  <td>
                    {order.orderStatus}
                  </td>
                  <td>

                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        <ConfirmPrintModal show={this.state.confirmPrintVisible} onHide={() => this.hideConfirmPrint()} listSize={this.state.orders.length} />
      </Container>
    );
  }
}
