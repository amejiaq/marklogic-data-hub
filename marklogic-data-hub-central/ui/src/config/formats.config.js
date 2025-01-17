//This file contains an object which stores source format options and its related properties. It can be used across the project.

const sourceFormatOptions = {
    json: { label: 'JSON', color: '#993366' },
    xml: { label: 'XML', color: '#37aa6c' },
    csv: { label: 'CSV', color: '#531dab' },
    text: { label: 'TXT', color: '#1254f9'},
    binary : { label: 'BIN', color: '#444444'},
    default: {color: '#44499C'}
};

const srcOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'Delimited Text (CSV, TSV, etc.)': 'csv',
    'BINARY (.gif, .jpg, .pdf, .doc, .docx, etc.)': 'binary',
    'TEXT' : 'text'
  };
const tgtOptions = {
    'XML': 'xml',
    'JSON': 'json',
    'BINARY (.gif, .jpg, .pdf, .doc, .docx, etc.)': 'binary',
    'TEXT' : 'text'
};

const fieldSeparatorOptions = {
    ',' : ',',
    '|' : '|',
    ';' : ';',
    'Tab': '\\t',
    'Other': 'Other'
};


export default sourceFormatOptions;
export {
    srcOptions,
    tgtOptions,
    fieldSeparatorOptions
};
