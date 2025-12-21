/// <reference types="cypress" />

describe('Admin Dashboard', () => {
  it('should login as admin and see dashboard', () => {
    cy.visit('/auth/login');
    cy.get('input[name="email"]').type('admin@edupay.com');
    cy.get('input[name="password"]').type('Admin@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
  });

  it('should not allow admin registration', () => {
    cy.visit('/auth/register');
    cy.get('[data-role="admin"]').should('not.exist');
  });
});
