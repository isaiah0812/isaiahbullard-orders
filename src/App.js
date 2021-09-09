import React from 'react'
import axios from 'axios'
import './App.css';
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { OPEN, COMPLETED, CANCELLED } from './constants/orderStatus'
import ConfirmPrintModal from './components/confirmPrintModal'
import ConfirmPrintAllModal from './components/confirmPrintAllModal'
import FormCheck from 'react-bootstrap/FormCheck'
import PrintingModal from './components/printingModal';
import { default as emailjs } from 'emailjs-com'
import NoLabelModal from './components/noLabelModal';
import { withAuthenticationRequired, withAuth0 } from '@auth0/auth0-react'

class App extends React.Component {

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
    confirmPrintAllVisible: false,
    openStateFilter: false,
    completedStateFilter: false,
    canceledStateFilter: false,
    printingModalVisible: false,
    completedOrders: [],
    noLabelModalVisible: false,
    authorized: false
  }

  showConfirmPrint = () => this.setState({confirmPrintVisible: true})
  hideConfirmPrint = () => this.setState({confirmPrintVisible: false})
  showConfirmPrintAll = () => this.setState({confirmPrintAllVisible: true})
  hideConfirmPrintAll = () => this.setState({confirmPrintAllVisible: false})
  showPrintingModal = () => this.setState({printingModalVisible: true})
  hidePrintingModal = () => this.setState({printingModalVisible: false})
  showNoLabelModal = () => this.setState({noLabelModalVisible: true})
  hideNoLabelModal = () => this.setState({noLabelModalVisible: false})

  toggleAllOrdersFilter = () => this.setState({openStateFilter: false, completedStateFilter: false, canceledStateFilter: false})
  toggleOpenStateFilter = () => this.setState({openStateFilter: true, completedStateFilter: false, canceledStateFilter: false})
  toggleCompletedStateFilter = () => this.setState({openStateFilter: false, completedStateFilter: true, canceledStateFilter: false})
  toggleCanceledStateFilter = () => this.setState({openStateFilter: false, completedStateFilter: false, canceledStateFilter: true})

  allOrders = () => !this.state.openStateFilter && !this.state.completedStateFilter && !this.state.canceledStateFilter

  openCount = () => this.state.orders.filter(order => order.orderStatus === OPEN)

  completeAllOrders = (closeFunction) => {
    emailjs.init(process.env.REACT_APP_EMAILJS_ID)
    axios.post(`${process.env.REACT_APP_API_URL}/orders/complete`)
      .then(result => result.data)
      .then((completedOrders) => {
        axios.get(`${process.env.REACT_APP_API_URL}/orders`)
          .then(result => result.data)
          .then(orders => this.setState({
            orders: orders,
            completedOrders: [...completedOrders, ...this.state.completedOrders]
          }, () => {
            this.showPrintingModal()
          }))
          .catch(error => {
            if(error.response.status !== 404) console.error(error)
            else this.setState({ orders: [] })
          })
          .finally(() => closeFunction())
      })
      .catch(error => console.error(error))
  }

  completeOpenOrder = (closeFunction) => {
    emailjs.init(process.env.REACT_APP_EMAILJS_ID)
    axios.post(`${process.env.REACT_APP_API_URL}/orders/${this.state.openOrder.id}/complete`)
      .then(result => result.data)
      .then((completedOrder) => {
        axios.get(`${process.env.REACT_APP_API_URL}/orders`)
          .then(result => result.data)
          .then(orders => this.setState({
            orders: orders,
            completedOrders: [completedOrder, ...this.state.completedOrders]
          }, () => {
            this.showPrintingModal()
          }))
          .catch(error => console.error(error))
          .finally(() => closeFunction())
      })
      .catch(error => console.error(error))
  }

  refresh = () => {
    const { user } = this.props.auth0

    axios.post(`${process.env.REACT_APP_API_URL}/orders/admin-auth`, user)
      .then(result => result.data)
      .then(authResult => {
        if(authResult.authorized) {
          axios.get(`${process.env.REACT_APP_API_URL}/orders`)
            .then(result => result.data)
            .then(orders => this.setState({ orders: orders }))
            .catch(error => {
              if(error.response.status !== 404) console.error(error)
              else this.setState({ orders: [] })
            })
        }
      })
      .catch(error => console.error(error))
  }

  componentDidMount = () => {
    const { user } = this.props.auth0

    axios.post(`${process.env.REACT_APP_API_URL}/orders/admin-auth`, user)
      .then(result => result.data)
      .then(authResult => {
        this.setState({
          authorized: authResult.authorized
        }, () => {
          if(authResult.authorized) {
            axios.get(`${process.env.REACT_APP_API_URL}/orders`)
              .then(result => result.data)
              .then(orders => this.setState({ orders: orders }))
              .catch(error => {
                if(error.response.status !== 404) console.error(error)
                else this.setState({ orders: [] })
              })
          }
        })
      })
      .catch(error => console.error(error))
  }

  render() {
    const { logout } = this.props.auth0

    return (
      <Container fluid style={{ padding: '1%' }}>
        <Button onClick={() => logout({ returnTo: window.location.origin })} variant="outline-danger" style={{ marginBottom: '0.5em', marginLeft: '0.5em' }}>Logout</Button>
        {this.state.authorized && (
          <React.Fragment>
            <Button onClick={() => this.refresh()} variant="primary" style={{ marginBottom: '0.5em', marginLeft: '0.5em', float: 'right' }}>Refesh</Button>
            <Button onClick={() => this.showPrintingModal()} variant="dark" style={{ marginBottom: '0.5em', marginLeft: '0.5em', float: 'right' }}>Print Recently Completed Orders</Button>
            <Button onClick={() => this.showConfirmPrintAll()} variant="success" style={{ marginBottom: '0.5em', float: 'right' }}>Complete All Orders</Button>
            <FormCheck 
              type="radio" 
              style={{
                float: 'right', 
                margin: '0.5em' 
              }} 
              checked={this.state.canceledStateFilter} 
              label="CANCELED" 
              onChange={() => this.toggleCanceledStateFilter()} />
            <FormCheck 
              type="radio"
              style={{
                float: 'right',
                margin: '0.5em'
              }}
              checked={this.state.completedStateFilter}
              label="COMPLETED" 
              onChange={() => this.toggleCompletedStateFilter()} />
            <FormCheck 
              type="radio"
              style={{
                float: 'right',
                margin: '0.5em'
              }}
              checked={this.state.openStateFilter}
              label="OPEN" 
              onChange={() => this.toggleOpenStateFilter()} />
            <FormCheck 
              type="radio"
              style={{
                float: 'right',
                margin: '0.5em'
              }}
              checked={this.allOrders()}
              label="ALL" 
              onChange={() => this.toggleAllOrdersFilter()} />
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Created Date</th>
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
                {this.state.orders.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{textAlign: 'center'}}>
                      No orders found. Try refreshing or checking the Square repository.
                    </td>
                  </tr>
                )}
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
                        {new Date(order.createdDate).toLocaleString()}
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
                        {order.orderStatus === OPEN && <Button onClick={() => this.setState({openOrder: order}, () => this.showConfirmPrint())} variant="primary" style={{margin: '0% 1%'}}>Complete Order</Button>}
                        {order.orderStatus === COMPLETED && (
                          <Button
                            onClick={() => {
                              if(order.shippingLabelUrl) {
                                window.open(order.shippingLabelUrl, "_blank")
                              } else if(order.shippingLabelId) {
                                axios.get(`${process.env.REACT_APP_API_URL}/orders/${order.id}/label`)
                                  .then(labelInfo => window.open(labelInfo.data.url, "_blank"))
                                  .catch(labelError => console.error(labelError))
                              } else {
                                this.setState({
                                  openOrder: order
                                }, () => {
                                  this.showNoLabelModal()
                                })
                              }
                            }}
                            variant="success"
                            style={{margin: '0% 1%'}}
                          >
                            Print Label
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            <ConfirmPrintModal show={this.state.confirmPrintVisible} onHide={() => this.hideConfirmPrint()} orderid={this.state.openOrder.id} confirm={this.completeOpenOrder} />
            <ConfirmPrintAllModal show={this.state.confirmPrintAllVisible} onHide={() => this.hideConfirmPrintAll()} listSize={this.state.orders.filter(order => order.orderStatus === OPEN).length} confirm={this.completeAllOrders} />
            <PrintingModal show={this.state.printingModalVisible} onHide={() => this.hidePrintingModal()} orders={this.state.completedOrders} clear={() => this.setState({ completedOrders: [] })} />
            <NoLabelModal show={this.state.noLabelModalVisible} onHide={() => this.hideNoLabelModal()} orderid={this.state.openOrder.id} />
          </React.Fragment>
        )}
        {!this.state.authorized && "You shouldn't be here..."}
      </Container>
    );
  }
}

export default withAuthenticationRequired(withAuth0(App))