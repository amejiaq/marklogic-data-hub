import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
const test = require("/test/test-helper.xqy");

const entityType = "http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType";

// Convenience function for simplifying tests
function validateGenderMapping(sourcedFrom) {
  return esMappingLib.validateMapping({
    targetEntityType: entityType,
    properties: {
      gender: {sourcedFrom: sourcedFrom}
    }
  });
}

function validMapping() {
  let sourcedFrom = "memoryLookup(gender, '{\"m\": \"Male\", \"f\": \"Female\", \"nb\": \"Non-Binary\"}')";
  let result = validateGenderMapping(sourcedFrom);
  return [
    test.assertEqual(sourcedFrom, result.properties.gender.sourcedFrom,
      "The original sourcedFrom is included in the validated mapping as a way of confirming what was validated"),
    test.assertEqual(null, result.properties.gender.errorMessage,
      "An errorMessage shouldn't exist since the mapping expression is valid")
  ];
}

function unrecognizedProperty() {
  let result = esMappingLib.validateAndTestMapping({
    targetEntityType: entityType,
    properties: {
      genderr: {sourcedFrom: "gender"}
    }
  }, "/content/mapTest.json");
  return [
    test.assertEqual(null, result.properties.genderr.errorMessage,
      "Per DHFPROD-3627, an error shouldn't be thrown for an unrecognized property")
  ];
}

function missingFunctionReference() {
  let result = validateGenderMapping("memoryLookupp()");
  return [
    test.assertEqual("Unable to find function: 'memoryLookupp()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.properties.gender.errorMessage)
  ];
}

function incorrectNumberOfFunctionArguments() {
  let result = validateGenderMapping("memoryLookup(gender)");
  return [
    test.assertEqual("Unable to find function: 'memoryLookup()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.properties.gender.errorMessage,
      "If an incorrect number of function arguments are included, then the XSLT validation treats this as the function not being recognized")
  ];
}

function functionSyntaxError() {
  let result = validateGenderMapping("concat('test',)");
  return [
    test.assertEqual("Invalid XPath expression: 'concat('test',)'. Cause: Unexpected right parenthesis.", result.properties.gender.errorMessage)
  ];
}

function mixOfValidAndInvalidExpressions() {
  let validatedMapping = esMappingLib.validateMapping({
    "targetEntityType": entityType,
    "properties": {
      "firstname": {
        "sourcedFrom": "concat(firstName, )"
      },
      "lastname": {
        "sourcedFrom": "lastName"
      },
      "gender": {
        "sourcedFrom": "memoryLookupp()"
      }
    }
  });

  return [
    test.assertEqual(entityType, validatedMapping.targetEntityType),
    test.assertEqual("concat(firstName, )", validatedMapping.properties.firstname.sourcedFrom),
    test.assertEqual("Invalid XPath expression: 'concat(firstName, )'. Cause: Unexpected right parenthesis.", validatedMapping.properties.firstname.errorMessage),
    test.assertEqual("lastName", validatedMapping.properties.lastname.sourcedFrom),
    test.assertEqual(null, validatedMapping.properties.lastname.errorMessage),
    test.assertEqual("memoryLookupp()", validatedMapping.properties.gender.sourcedFrom),
    test.assertEqual("Unable to find function: 'memoryLookupp()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", validatedMapping.properties.gender.errorMessage)
  ];
}

function validUseOfCustomFunction() {
  let sourcedFrom = "echo(gender)";
  let result = validateGenderMapping(sourcedFrom);
  return [
    test.assertEqual(sourcedFrom, result.properties.gender.sourcedFrom),
    test.assertEqual(null, result.properties.gender.errorMessage)
  ];
}

function invalidUseOfCustomFunction() {
  let result = validateGenderMapping("echo(gender, 'invalidSecondArg')");
  return [
    test.assertEqual("Unable to find function: 'echo()'. Cause: Either the function does not exist or the wrong number of arguments were specified.", result.properties.gender.errorMessage)
  ];
}

[]
  .concat(validMapping())
  .concat(unrecognizedProperty())
  .concat(missingFunctionReference())
  .concat(incorrectNumberOfFunctionArguments())
  .concat(functionSyntaxError())
  .concat(mixOfValidAndInvalidExpressions())
  .concat(validUseOfCustomFunction())
  .concat(invalidUseOfCustomFunction())
;

