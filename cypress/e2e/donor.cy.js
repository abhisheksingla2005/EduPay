/// <reference types="cypress" />

describe('Donor Flow', () => {
  const timestamp = Date.now();
  const email = `donor_${timestamp}@test.com`;

  it('should register and access dashboard', () => {
    cy.visit('/auth/register');
    cy.get('input[name="name"]').type('Test Donor');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('TestPass123');
    cy.get('[data-role="donor"]').click();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/donor/dashboard');
  });
});
