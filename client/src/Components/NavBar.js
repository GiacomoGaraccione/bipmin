import { Navbar, Container, Button } from "react-bootstrap"
import { BrowserRouter as Link } from 'react-router-dom';
import React from "react"

function NavBar(props) {

  return <Navbar className="greenBackground" variant="dark">
    <Container>
      {props.loggedIn ?
        <>
          <Navbar.Brand href="/">
            <img alt="logo" src="resources/logo.svg" width="45" height="30" className="d-inline-block align-top" />
            {' '}BIPMIN</Navbar.Brand>
          {props.user.id === 17 && <Navbar.Brand href="/admin">Admin</Navbar.Brand>}
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-4">
              Welcome {props.user.name}
            </Navbar.Text>
            <Button variant="outline-light" onClick={props.logout} href={"/login"} component={Link}>Logout</Button>
          </Navbar.Collapse>
        </>
        :
        <><Navbar.Brand height="30" href="/"></Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-4">
            </Navbar.Text>
          </Navbar.Collapse>
        </>
      }
    </Container>
  </Navbar>

}

export default NavBar;