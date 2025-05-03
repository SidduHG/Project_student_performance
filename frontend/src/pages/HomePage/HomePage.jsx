import React from "react";
import { Button, Container, Row, Col, Card, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Sticky Navbar */}
      <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">Student Analyzer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate("/")}>Home</Nav.Link>
              <Nav.Link onClick={() => navigate("/signup")}>Sign Up</Nav.Link>
              <Nav.Link onClick={() => navigate("/login")}>Login</Nav.Link>
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-5">
        <Container>
          <h1 className="display-4 fw-bold mb-3">Welcome to Student Performance Portal</h1>
          <p className="lead mb-4">Track. Analyze. Improve Student Outcomes.</p>
          <Button variant="light" size="lg" onClick={() => navigate("/signup")}>
            Get Started
          </Button>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <Container>
          <h2 className="text-center mb-4 fw-semibold">Key Features</h2>
          <Row className="g-4">
            {[
              {
                icon: "fas fa-chart-bar",
                title: "Performance Analytics",
                desc: "Visualize student progress with clean graphs and dashboards."
              },
              {
                icon: "fas fa-edit",
                title: "Easy Result Entry",
                desc: "Teachers can quickly enter and manage student results by subject."
              },
              {
                icon: "fas fa-user-shield",
                title: "Role-Based Access",
                desc: "Secure login system for teachers, admins, and students."
              },
              {
                icon: "fas fa-database",
                title: "Centralized Database",
                desc: "All data is securely stored and easily accessible in one place."
              },
              {
                icon: "fas fa-bolt",
                title: "Real-time Updates",
                desc: "View instant updates to student data and performance trends."
              },
              {
                icon: "fas fa-certificate",
                title: "Progress Reports",
                desc: "Auto-generate reports and performance summaries."
              }
            ].map((feature, i) => (
              <Col md={4} sm={6} key={i}>
                <Card className="h-100 text-center shadow-sm">
                  <Card.Body>
                    <i className={`${feature.icon} fa-2x text-primary mb-3`}></i>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text>{feature.desc}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4 fw-semibold">What Students Say</h2>
          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow border-0">
                <Card.Body>
                  <blockquote className="blockquote">
                    "This platform has made tracking student progress a breeze!"
                  </blockquote>
                  <footer className="blockquote-footer">Siddu H G, Student Dept of ISE </footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow border-0">
                <Card.Body>
                  <blockquote className="blockquote">
                    "No more spreadsheets! Everything is centralized and smooth."
                  </blockquote>
                  <footer className="blockquote-footer">Santrupti R B, Student Dept of ISE.</footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow border-0">
                <Card.Body>
                  <blockquote className="blockquote">
                    "This platform has made tracking student progress a breeze!"
                  </blockquote>
                  <footer className="blockquote-footer">Shreya H, Student Dept of ISE </footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow border-0">
                <Card.Body>
                  <blockquote className="blockquote">
                    "This platform has made tracking student progress a breeze!"
                  </blockquote>
                  <footer className="blockquote-footer">Chetan, Student Dept of ISE </footer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5">
        <Container>
          <h2 className="text-center mb-4 fw-semibold">Contact Us</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <i className="fas fa-phone fa-2x text-primary mb-2"></i>
              <p>+91 98765 43210</p>
            </Col>
            <Col md={4} className="mb-4">
              <i className="fas fa-envelope fa-2x text-primary mb-2"></i>
              <p>support@studentanalyzer.com</p>
            </Col>
            <Col md={4} className="mb-4">
              <i className="fas fa-map-marker-alt fa-2x text-primary mb-2"></i>
              <p>Bangalore, India</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} Student Analyzer. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
}

export default HomePage;
