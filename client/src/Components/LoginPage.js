import { Form, Button, Alert, Col, Row, FormGroup, Container } from 'react-bootstrap';
import React, { useState } from 'react';
import '../App.css';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Login function
  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    // Check input validity
    let valid = true;
    if (username === '' || password === '')
      valid = false;

    // Try the login procedure
    if (valid) {
      props.login(credentials).catch((err) => setErrorMessage(err));
    }
    else {
      setErrorMessage('Username or password invalid');
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column greenBackground">
      <Row className="justify-content-md-center">
        <Col sm="3" >
          <Form>
            {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
            <FormGroup>
              <img alt="logo" src={process.env.PUBLIC_URL + "/logo.svg"} width={160} className="mt-5" />
            </FormGroup>
            <FormGroup className='whiteColor'>
              <h2>BIPMIN</h2>
            </FormGroup>
            <FormGroup className='mt-5 whiteColor'>
              <h4>Please enter your login details</h4>
            </FormGroup>
            <Form.Group controlId='username' className='mt-5'>
              <Form.Label className='whiteColor'><h5>Email</h5></Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password' className='mt-4'>
              <Form.Label className='whiteColor'><h5>Password</h5></Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Button className='mt-5' variant="light" onClick={handleSubmit}>Login</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginForm;