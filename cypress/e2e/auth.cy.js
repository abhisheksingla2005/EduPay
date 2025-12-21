/// <reference types="cypress" />

describe('Authentication', () => {
  const timestamp = Date.now();

  it('should display login page', () => {
    cy.visit('/auth/login');
    cy.contains('Login').should('be.visible');
  });

  it('should display register page with only Student and Donor roles', () => {
    cy.visit('/auth/register');
    cy.contains('Register').should('be.visible');
    cy.get('[data-role="student"]').should('be.visible');
    cy.get('[data-role="donor"]').should('be.visible');
    cy.get('[data-role="admin"]').should('not.exist');
  });

  it('should register as student', () => {
    cy.visit('/auth/register');
    cy.get('input[name="name"]').type('Test Student');
    cy.get('input[name="email"]').type(`student_${timestamp}@test.com`);
    cy.get('input[name="password"]').type('TestPass123');
    cy.get('[data-role="student"]').click();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/student/dashboard');
  });

  it('should show error for invalid login', () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid credentials').should('be.visible');
  });
});
