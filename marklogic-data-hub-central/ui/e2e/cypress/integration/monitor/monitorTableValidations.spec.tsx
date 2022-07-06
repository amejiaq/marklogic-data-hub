import monitorPage from "../../support/pages/monitor";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import browsePage from "../../support/pages/browse";
import monitorSidebar from "../../support/components/monitor/monitor-sidebar";
import runPage from "../../support/pages/run";
import {mappingStepDetail} from "../../support/components/mapping/index";

describe("Monitor Tile", () => {

  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    LoginPage.postLogin();
    cy.waitForAsyncRequest();
  });

  beforeEach(() => {
    cy.loginAsTestUserWithRoles("hub-central-job-monitor").withRequest();
    cy.waitUntil(() => toolbar.getMonitorToolbarIcon()).click();
    monitorPage.waitForMonitorTableToLoad();
  });

  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });

  let firstPageTableCellsJobId: any[] = [];
  let firstPageTableCellsJobIdAux: any[] = [];
  let firstPageTableCellsStepName: any[] = [];
  let firstPageTableCellsStepType: any[] = [];
  let firstPageTableCellsStatus: any[] = [];
  let firstPageTableCellsEntityType: any[] = [];
  let firstPageTableCellsDateTime: any[] = [];

  it("Validate column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time part 1", () => {

    cy.log("**expand table and get data column of JobId**");
    monitorPage.getTableRows().then(($els) => {
      return (
        Cypress.$.makeArray($els)
          .map((el) => firstPageTableCellsJobId.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
      );
    });

    cy.log("**click first column to get ASC order and get jod id data**");
    monitorPage.getOrderColumnMonitorTable("Step Name").scrollIntoView().click().then(() => {
      monitorPage.getTableRows().then(($els) => {
        return (
          Cypress.$.makeArray($els)
            .map((el) => firstPageTableCellsJobIdAux.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")))
        );
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**get ASC order and entiy step name**");
    cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepNameDiv").then(($row) => {
      Cypress.$.makeArray($row)
        .map((el) => firstPageTableCellsStepName.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click second column to get ASC order and get step type data**");
    monitorPage.getOrderColumnMonitorTable("Step Type").scrollIntoView().click().then(() => {
      cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click third column to get ASC order and get status data**");
    monitorPage.getOrderColumnMonitorTable("Status").scrollIntoView().click().then(() => {
      cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepStatus").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => {
            if (el) { firstPageTableCellsStatus.push(el.getAttribute("data-testid")); } else { firstPageTableCellsStatus.push(""); }
          });
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click fourth column to get ASC order and get entiy type data**");
    monitorPage.getOrderColumnMonitorTable("Entity Type").scrollIntoView().click().then(() => {
      cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepEntityType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsEntityType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

    cy.log("**click fifth column to get ASC order and get start date and time**");
    monitorPage.getOrderColumnMonitorTable("Start Date and Time").scrollIntoView().click().then(() => {
      cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepStartDate").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsDateTime.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });
    monitorPage.getTableNestedRows().should("be.visible");

  });

  it("Validate column order for Step Name,	Step Type,	StatusEntity, Type Start, Date and Time part 2", () => {
    cy.log("**order original job id array**");
    firstPageTableCellsJobId.forEach(element => cy.log(element));

    cy.log("**compare order job id and check expanded table**");
    firstPageTableCellsJobIdAux.forEach(element => cy.log(element));
    expect(firstPageTableCellsJobId).to.deep.eq(firstPageTableCellsJobIdAux);

    cy.log("**check step name order ASC**");
    firstPageTableCellsStepName.forEach(element => cy.log(element));
    let firstStepName = firstPageTableCellsStepName[0];
    let lastStepName = firstPageTableCellsStepName[firstPageTableCellsStepName.length - 1];
    let compareStepName = firstStepName.toString().localeCompare(lastStepName.toString());
    expect(compareStepName).not.to.be.gt(0);

    cy.log("**check step type order ASC**");
    firstPageTableCellsStepType.forEach(element => cy.log(element));
    let firstStepType = firstPageTableCellsStepType[0];
    let lastStepType = firstPageTableCellsStepType[firstPageTableCellsStepType.length - 1];
    let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
    expect(compareStepType).not.to.be.gt(0);

    cy.log("**check step status order ASC**");
    firstPageTableCellsStatus.forEach(element => cy.log(element));
    let firstStatus = firstPageTableCellsStatus[0];
    let lastStatus = firstPageTableCellsStatus[firstPageTableCellsStatus.length - 1];
    let compareStatus = firstStatus.toString().localeCompare(lastStatus.toString());
    expect(compareStatus).not.to.be.gt(0);

    cy.log("**check step entity type order ASC**");
    firstPageTableCellsEntityType.forEach(element => cy.log(element));
    let firstEntityType = firstPageTableCellsEntityType[0];
    let lastEntityType = firstPageTableCellsEntityType[firstPageTableCellsEntityType.length - 1];
    let compareEntityType = firstEntityType.toString().localeCompare(lastEntityType.toString());
    expect(compareEntityType).not.to.be.gt(0);

    cy.log("**check step datetime order ASC**");
    firstPageTableCellsDateTime.forEach(element => cy.log(element));
    let firstDateTime = firstPageTableCellsDateTime[0];
    let lastDateTime = firstPageTableCellsDateTime[firstPageTableCellsDateTime.length - 1];
    let compareDateTime = firstDateTime.toString().localeCompare(lastDateTime.toString());
    expect(compareDateTime).not.to.be.gt(0);
  });

  it("Save table settings to session storage and get it back part 1", () => {

    monitorPage.getCollapseAllTableRows().scrollIntoView().click({force: true});
    monitorPage.getRowByIndex(1).click({force: true});
    monitorPage.checkExpandedRow();
    monitorPage.getPaginationPageSizeOptions().first().scrollIntoView().should("be.visible").select("10 / page");
    mappingStepDetail.selectPageSourceTable("2");

    cy.log("**Go to another page and back**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getMonitorToolbarIcon().click();

    cy.log("**Checking and setting in session new data**");
    mappingStepDetail.verifyContent("10 / page");
    monitorPage.checkCurrentPage(2);
    mappingStepDetail.selectPageSourceTable("1");
    monitorPage.checkExpandedRow();
    monitorPage.getColumnSelectorIcon().click();
    mappingStepDetail.selectColumnPopoverById("column-user-id").click();
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").click();
    monitorPage.getColumnSelectorApplyButton().should("be.visible").click();

    cy.log("**click second column to get ASC order and get step type data**");
    monitorPage.getOrderColumnMonitorTable("Step Type").scrollIntoView().click().then(() => {
      cy.get(".reset-expansion-style:eq(" + monitorPage.searchBiggerRowIndex(firstPageTableCellsJobId) + ") .stepType").then(($row) => {
        Cypress.$.makeArray($row)
          .map((el) => firstPageTableCellsStepType.push(el.innerText.toString().replace(/\t/g, "").split("\r\n")));
      });
    });

    cy.log("**Go to another page and back to verify data from session storage**");
    toolbar.getLoadToolbarIcon().click();
    toolbar.getMonitorToolbarIcon().click();
    monitorPage.verifyVisibilityTableHeader("Load", false);
    monitorPage.verifyVisibilityTableHeader("Flow Name", false);
    monitorPage.getColumnSelectorIcon().click();
    mappingStepDetail.selectColumnPopoverById("column-user-id").should("not.be.checked");
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").should("not.be.checked");

    cy.log("**Reset visible columns options**");
    mappingStepDetail.selectColumnPopoverById("column-user-id").click();
    mappingStepDetail.selectColumnPopoverById("column-flowName-id").click();
    monitorPage.getColumnSelectorApplyButton().should("be.visible").click();
  });

  it("Save table settings to session storage and get it back part 2", () => {
    cy.log("**Checking sorting from session storage**");
    firstPageTableCellsStepType.forEach(element => cy.log(element));
    let firstStepType = firstPageTableCellsStepType[0];
    let lastStepType = firstPageTableCellsStepType[firstPageTableCellsStepType.length - 1];
    let compareStepType = firstStepType.toString().localeCompare(lastStepType.toString());
    expect(compareStepType).not.to.be.gt(0);
  });

  it("apply facet search and verify docs", () => {
    monitorPage.validateAppliedFacetTableRows("step-type", 1);
  });

  it("apply facet search and clear individual grey facet", () => {
    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    monitorPage.validateClearGreyFacet("step-type", 0);
  });

  it("apply facet search and clear all grey facets", () => {
    monitorPage.validateGreyFacet("step-type", 0);
    monitorPage.validateGreyFacet("flow", 0);
    browsePage.getClearGreyFacets().click();
  });

  it("Verify functionality of clear and apply facet buttons", () => {
    //verify no facets selected case.
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    //verify selecting facets case.
    monitorPage.validateGreyFacet("step-type", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    //verify facets applied case.
    browsePage.getApplyFacetsButton().click();
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
    // verify selecting additional facets case.
    monitorPage.validateGreyFacet("step", 0);
    browsePage.getClearAllFacetsButton().should("not.be.disabled");
    browsePage.getApplyFacetsButton().should("not.be.disabled");
    browsePage.getClearAllFacetsButton().click();
    browsePage.getClearAllFacetsButton().should("be.disabled");
    browsePage.getApplyFacetsButton().should("be.disabled");
  });

  it("Verify step status faceting", () => {
    monitorSidebar.verifyFacetCategory("status");

    cy.log("**verify status faceting**");
    monitorPage.validateGreyFacet("status", 0);

    cy.intercept("POST", "/api/jobs/stepResponses", {statusCode: 200}).as("stepResponses");
    browsePage.getApplyFacetsButton().click();
    cy.wait("@stepResponses").should("have.property", "state", "Complete");

    monitorPage.getExpandAllTableRows().scrollIntoView().click({force: true});
    monitorPage.verifyTableRow("patientMerge").scrollIntoView().should("be.visible");
    monitorPage.verifyTableRow("patientMap").should("be.visible");
    monitorPage.verifyTableRow("patientMatch").should("be.visible");
    monitorPage.verifyTableRow("loadPatient").should("be.visible");
    monitorPage.verifyTableRow("mapPersonJSON").should("be.visible");
    cy.log("**failed status is removed**");
    monitorPage.verifyTableRow("cyCardView").should("not.exist");
    browsePage.getClearAllFacetsButton().click();
  });

  it("Verify job ID link opens status modal", () => {

    cy.log("*** open status modal via jobs link ***");
    monitorPage.getAllJobIdLink().first().click();
    runPage.getFlowStatusModal().should("be.visible");

    cy.log("*** verify step result content inside status modal ***");
    runPage.getStepSuccess("mapPersonJSON").should("be.visible");
    runPage.verifyFlowModalCompleted("testPersonJSON");
    cy.log("*** modal can be closed ***");
    runPage.closeFlowStatusModal("testPersonJSON");
    runPage.getFlowStatusModal().should("not.exist");
  });

  //TODO: Re-test facets without using ml-tooltip-container

  // it("apply multiple facets, deselect them, apply changes, apply multiple, clear them, verify no facets checked", () => {
  //   browsePage.getShowMoreLink("step").click();
  //   cy.get("[id=\"date-select\"]").scrollIntoView();
  //   cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //   cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepVal => {
  //     browsePage.getFacetItemCheckbox("step", stepVal).click();
  //     browsePage.getGreySelectedFacets(stepVal).should("exist");
  //     browsePage.getFacetItemCheckbox("step", stepVal).should("be.checked");
  //     browsePage.getFacetApplyButton().click();
  //     cy.get("[id=\"date-select\"]").scrollIntoView();
  //     cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //     cy.get("[data-testid=\"flow-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(flowVal => {
  //       browsePage.getFacetItemCheckbox("flow", flowVal).click();
  //       browsePage.getGreySelectedFacets(flowVal).should("exist");
  //       cy.get("[id=\"date-select\"]").scrollIntoView();
  //       cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //       cy.get("[data-testid=\"step-type-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepTypeVal => {
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         browsePage.getGreySelectedFacets(stepTypeVal).trigger("mousemove", {force: true});
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("exist");
  //         browsePage.getFacetApplyButton().click();
  //         monitorPage.clearFacetSearchSelection(flowVal);
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("be.checked");
  //         browsePage.getFacetItemCheckbox("step", stepVal).click();
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetItemCheckbox("step", stepVal).should("not.be.checked");
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("not.be.checked");
  //         browsePage.getGreySelectedFacets(stepVal).should("not.exist");
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("not.exist");
  //         cy.waitForAsyncRequest();
  //         browsePage.getFacetItemCheckbox("step", stepVal).click();
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).click();
  //         cy.get("#monitorContent").scrollTo("top",  {ensureScrollable: false});
  //         browsePage.getFacetApplyButton().click();
  //         monitorPage.clearFacetSearchSelection(stepVal);
  //         monitorPage.clearFacetSearchSelection(stepTypeVal);
  //         browsePage.getFacetItemCheckbox("step", stepVal).should("not.be.checked");
  //         browsePage.getFacetItemCheckbox("step-type", stepTypeVal).should("not.be.checked");
  //         browsePage.getGreySelectedFacets(stepVal).should("not.exist");
  //         browsePage.getGreySelectedFacets(stepTypeVal).should("not.exist");
  //       });
  //     });
  //   });
  // });


  // it("Verify facets can be selected, applied and cleared using clear text", () => {
  //   monitorPage.validateAppliedFacet("step", 0);
  //   browsePage.getFacetSearchSelectionCount("step").should("contain", "1");
  //   browsePage.getClearFacetSelection("step").click();
  //   browsePage.waitForSpinnerToDisappear();
  // });

  // it("Apply facets, unchecking them should not recheck original facets", () => {
  //   browsePage.getShowMoreLink("step").click();
  //   cy.get("[id=\"date-select\"]").scrollIntoView();
  //   cy.get("[id=\"date-select\"]").trigger("mousemove", {force: true});
  //   cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(0).invoke("text").then(stepVal1 => {
  //     cy.get("[data-testid=\"step-facet\"] [class=\"facet_checkContainer__1pogS\"] [class=\"ml-tooltip-container\"]").eq(1).invoke("text").then(stepVal2 => {
  //       cy.findByTestId("step-"+stepVal1+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal1).click();
  //       browsePage.getFacetItemCheckbox("step", stepVal2).click();
  //       browsePage.getGreySelectedFacets(stepVal1).should("exist");
  //       browsePage.getGreySelectedFacets(stepVal2).should("exist");
  //       browsePage.getFacetApplyButton().click();
  //       browsePage.getFacetItemCheckbox("step", stepVal1).should("be.checked");
  //       cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
  //       cy.findByTestId("step-"+stepVal2+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).should("be.checked");
  //       browsePage.getFacetItemCheckbox("status", "finished").click();
  //       browsePage.getFacetItemCheckbox("step", stepVal1).click();
  //       browsePage.waitForSpinnerToDisappear();
  //       cy.findByTestId("step-"+stepVal2+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).click({force: true});
  //       browsePage.getFacetItemCheckbox("status", "finished").click();
  //       cy.findByTestId("step-"+stepVal1+"-checkbox").trigger("mousemove", {force: true});
  //       browsePage.getFacetItemCheckbox("step", stepVal1).should("not.be.checked");
  //       cy.get("#monitorContent").scrollTo("top", {ensureScrollable: false});
  //       browsePage.getFacetItemCheckbox("step", stepVal2).should("not.be.checked");
  //       browsePage.getFacetItemCheckbox("status", "finished").should("not.be.checked");
  //     });
  //   });
  // });

  // it("Verify select, apply, remove grey and applied startTime facet", () => {
  //   // Select multiple facets and remove startTime grey facet
  //   monitorPage.validateGreyFacet("step-type", 0);
  //   monitorPage.validateGreyFacet("step-type", 1);
  //   monitorPage.selectStartTimeFromDropDown("Today");
  //   monitorPage.getSelectedTime().should("contain", "Today");
  //   browsePage.getGreySelectedFacets("Today").should("exist");
  //   monitorPage.validateClearStartTimeGreyFacet("Today");
  //   monitorPage.getSelectedTime().should("contain", "select time");

  //   // Select multiple facets and apply all facets
  //   monitorPage.selectStartTimeFromDropDown("Today");
  //   monitorPage.getSelectedTime().should("contain", "Today");
  //   browsePage.getApplyFacetsButton().click();
  //   browsePage.getAppliedFacets("Today").should("exist");
  //   monitorPage.getSelectedTime().should("contain", "Today");

  //   // Remove applied startTime facet
  //   monitorPage.clearFacetSearchSelection("Today");
  //   browsePage.getSelectedFacet("Today").should("not.exist");
  //   browsePage.getClearAllFacetsButton().click();
  // });

});
