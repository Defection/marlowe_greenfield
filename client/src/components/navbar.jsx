import React from 'react';
import ReactDOM from 'react-dom'
import axios from 'axios';
import {Nav, Navbar, NavDropdown, NavItem, MenuItem} from 'react-bootstrap';


class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    }
  }



  render () {
    const { scrollTo, onLogout, handleSettings, showDeductions } = this.props;

    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#home">Kindly</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavItem eventKey={1} href="#" onClick={scrollTo}>
            Recent Posts
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem eventKey={3} href="#" onClick={handleSettings}>
            Settings
          </NavItem>
          <NavItem eventKey={4} href="#" onClick={showDeductions}>
            Deductions
          </NavItem>
          <NavItem eventKey={2} href="#" onClick={onLogout}>
          Log Out
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

export default NavigationBar;
