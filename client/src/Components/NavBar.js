import { Navbar, Container, Button } from "react-bootstrap"
import { BrowserRouter as Link, HashRouter } from 'react-router-dom';
import React from "react"

function NavBar(props) {

  return <Navbar className="greenBackground" variant="dark">
    <Container>
      {props.loggedIn ?
        <>
          <Navbar.Brand onClick={() => props.setMode("")}>
            <img alt="logo" src={process.env.PUBLIC_URL + "/logo.svg"} width="45" height="30" className="d-inline-block align-top" />
            {' '}BIPMIN</Navbar.Brand>
          {props.user.id <= 24 && <Navbar.Brand onClick={() => props.setMode("admin")}>Admin</Navbar.Brand>}
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text className="me-4">
              Welcome {props.user.name}
            </Navbar.Text>
            <Button variant="outline-light" onClick={() => {
              props.setMode("")
              props.logout()
            }} component={Link}>Logout</Button>
          </Navbar.Collapse>
        </>
        :
        <><Navbar.Brand height="30" onClick={() => props.setMode("")}></Navbar.Brand>
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