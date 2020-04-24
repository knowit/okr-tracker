import { testDepartment, testProducts } from '../../config';

describe('Create department', () => {
  before(() => {
    cy.visit('/').wait(3000);

    // Log in as admin if not already logged in
    cy.get('body').then($body => {
      if (!$body.text().includes('Hjem')) {
        cy.log('Signing in as admin user');
        cy.signInAdminUser();
      } else {
        cy.log('Already logged in');
      }
    });

    // Delete the test department if it already exists
    cy.get('.productList').then($el => {
      if ($el.text().includes(testDepartment.name)) {
        cy.log('Test department exists');

        testProducts.forEach((prod, index) => {
          if ($el.text().includes(testProducts[index].name)) {
            cy.log('Test product already exists');
            cy.log('Deleting test product');
            cy.deleteProduct(index);
          } else {
            cy.log('Test product does not exists');
          }
        });
      } else {
        cy.log('Test department does not exists');
        cy.createTestDepartment();
        cy.log('Completed test department creation');
      }
    });

    // check to see if product exists
    // if it does, delete it
  });

  it('Creates new products', () => {
    cy.createProduct(0);
    cy.createProduct(1);
  });

  it('Creates periods for products', () => {
    // cy.createPeriod(0);
    // cy.createPeriod(1);
  });
});
