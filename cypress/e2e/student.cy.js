/// <reference types="cypress" />

describe('Student Flow', () => {
  const timestamp = Date.now();
  const email = `stu_${timestamp}@test.com`;

  it('should register and create a request', () => {
    // Register
    cy.visit('/auth/register');
    cy.get('input[name="name"]').type('Test Student');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('TestPass123');
    cy.get('[data-role="student"]').click();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/student/dashboard');
    
    // Create request
    cy.visit('/student/create-request');
    cy.get('input[name="title"]').type('Test Request');
    cy.get('input[name="amountRequested"]').type('5000');
    cy.get('textarea[name="description"]').type('Test description');
    cy.get('button[type="submit"]').click();
  });
});
