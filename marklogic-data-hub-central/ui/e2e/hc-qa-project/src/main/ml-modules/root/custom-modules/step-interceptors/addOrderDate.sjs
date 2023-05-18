var contentArray;
var options;

// This is passed in because it's defined in the interceptors config in the flow file
var exampleVariable;
contentArray.forEach(content => {
  // The entity-services-mapping step results in "value" being a node, so must call toObject first
  const contentValue = content.value.toObject();

  // Example of mapping data from the source document, located in the attachment, to the header
  contentValue.envelope.headers.mappedOrderDate = "orderDate";

  content.value = contentValue;
});
