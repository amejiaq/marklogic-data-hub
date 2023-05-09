import LoginPage from "../../support/pages/login";
import curatePage from "../../support/pages/curate";
import graphExplore from "../../support/pages/graphExplore";

describe("Verify values to ignore feature", () => {

  before(() => {
    cy.loginAsTestUserWithRoles("hub-central-flow-writer", "hub-central-match-merge-writer", "hub-central-mapping-writer", "hub-central-load-writer").withRequest();
    LoginPage.navigateToMainPage();
  });

  it("Should merge when values do not match", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    // create list with lastname and value "Peterson"

    //Run steps (move to a function)
    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMergePerson().click({force: true});
    graphExplore.getTitleApp().click();

    // check in explore Sanderson has unmerge option
    // check in explore Simpson has unmerge option
    // include in future merges (maybe move test from explore unmerge to here?)
  });

  it("Should not merge when values do match with one list", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    // create list with lastname and value "Sanderson"

    //Run steps (move to a function)
    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMergePerson().click({force: true});
    graphExplore.getTitleApp().click();

    // check in explore Sanderson doesn't have unmerge option
    // check in explore Simpson has unmerge option
    // Reset Simpson - include in future merges (maybe move test from explore unmerge to here?)
  });

  it("Should not merge when values do match with multiple lists", () => {
    cy.visit("/tiles/curate");
    cy.waitForAsyncRequest();
    curatePage.toggleEntityTypeId("Person");
    curatePage.selectMatchTab("Person");
    curatePage.openStepDetails("match-person");
    // create list with lastname and value "Sanderson"
    // create list with lastname and value "Simpson", "AnotherOne"
    // create list with lastname and value "Simpson", "Sanderson"

    //Run steps (move to a function)
    graphExplore.getRunTile().click();
    cy.intercept("GET", "/api/jobs/**").as("runResponse");

    graphExplore.getPersonJSONacordeon().click();
    graphExplore.getRunButtonMatchPerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMatchPerson().click();
    graphExplore.getRunButtonMergePerson().click();
    cy.wait("@runResponse");
    cy.wait(4000);
    graphExplore.getCloseModalMergePerson().click({force: true});
    graphExplore.getTitleApp().click();

    // check in explore Sanderson doesn't have unmerge option
    // check in explore Simpson doesn't have unmerge option
  });
});
