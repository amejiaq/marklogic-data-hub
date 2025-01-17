import lib from "/test/suites/data-hub/5/builtins/steps/mapping/entity-services/lib/lib.mjs";
import mappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.xqy");

// First verify that the nested object properties were processed correctly in the XML mapping template
// Each template should have a name that is unique based on the path of the property that it references
const mappingTemplate = hubTest.getModulesDocument("/steps/mapping/PersonMapping6.step.xml");
const namespaces = {"m": "http://marklogic.com/entity-services/mapping"};
const assertions = [
  test.assertEqual("mapping0-Person.name", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person']/Person/m:for-each/name/m:call-template/@name/string()", namespaces)),
  test.assertEqual("mapping0-Person.alias", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person']/Person/m:for-each/alias/m:call-template/@name/string()", namespaces)),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person.name']", namespaces).toArray().length),
  test.assertEqual("mapping0-Person.name.first", mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person.name']/Name/m:for-each/first/m:call-template/@name/string()", namespaces)),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person.name.first']", namespaces).toArray().length),
  test.assertEqual(1, mappingTemplate.xpath("/m:mapping/m:entity[@name/string() = 'mapping0-Person.alias']", namespaces).toArray().length)

];

const person = lib.invokeTestMapping("/content/person2.json", "PersonMapping6", "6").Person;

assertions.push(
  test.assertEqual("222", fn.string(person.id)),
  test.assertEqual("Nicky", fn.string(person.nickname)),
  test.assertEqual("First", fn.string(person.name.Name.first.FirstName.value),
    "This verifies that when two properties are mapped to entities of the same type, the " +
    "templates that are generated have unique names"),
  test.assertEqual("SomePrefix", fn.string(person.name.Name.first.FirstName.prefix)),
  test.assertEqual("Last", fn.string(person.name.Name.last)),
  test.assertEqual("Middle", fn.string(person.alias.Name.middle))
);

assertions;
