// Sample SELECT results (SPARQL 1.1 JSON) for the demo
export const mockData = {
  people: {
    head: { vars: ['person', 'name', 'birthDate', 'nationality', 'occupation', 'email', 'phone', 'address', 'city', 'country', 'postalCode', 'company', 'department', 'title', 'salary', 'hireDate', 'manager', 'projects', 'skills', 'certifications'] },
    results: {
      bindings: Array.from({ length: 20 }, (_, i) => ({
        person: { type: 'uri', value: `http://example.org/person/${i + 1}` },
        name: { type: 'literal', value: `Person ${i + 1}` },
        birthDate: { type: 'literal', value: `${1950 + i}-0${(i % 9) + 1}-${(i % 28) + 1}`, datatype: 'http://www.w3.org/2001/XMLSchema#date' },
        nationality: { type: 'literal', value: ['American', 'British', 'French', 'German', 'Italian'][i % 5], 'xml:lang': 'en' },
        occupation: { type: 'literal', value: ['Scientist', 'Artist', 'Writer', 'Musician', 'Engineer'][i % 5] },
        email: { type: 'literal', value: `person${i + 1}@example.org` },
        phone: { type: 'literal', value: `+1-555-${String(i).padStart(4, '0')}` },
        address: { type: 'literal', value: `${100 + i * 10} Main Street` },
        city: { type: 'literal', value: ['New York', 'London', 'Paris', 'Berlin', 'Tokyo'][i % 5] },
        country: { type: 'literal', value: ['USA', 'UK', 'France', 'Germany', 'Japan'][i % 5] },
        postalCode: { type: 'literal', value: `${10000 + i * 100}` },
        company: { type: 'uri', value: `http://example.org/company/${(i % 5) + 1}` },
        department: { type: 'literal', value: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][i % 5] },
        title: { type: 'literal', value: ['Senior Developer', 'Manager', 'Director', 'VP', 'CEO'][i % 5] },
        salary: { type: 'literal', value: `${50000 + i * 5000}`, datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
        hireDate: { type: 'literal', value: `${2010 + (i % 10)}-${String((i % 12) + 1).padStart(2, '0')}-15`, datatype: 'http://www.w3.org/2001/XMLSchema#date' },
        manager: { type: 'uri', value: `http://example.org/person/${((i + 1) % 5) + 1}` },
        projects: { type: 'literal', value: `${(i % 10) + 1}`, datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
        skills: { type: 'literal', value: ['Python, JavaScript, SQL', 'Java, C++, Go', 'React, Vue, Angular', 'AWS, Azure, GCP', 'Docker, Kubernetes, CI/CD'][i % 5] },
        certifications: { type: 'literal', value: ['AWS Certified', 'Google Cloud Pro', 'Azure Expert', 'Kubernetes Admin', 'Scrum Master'][i % 5] }
      }))
    }
  },
  
  datatypes: {
    head: { vars: ['subject', 'stringVal', 'intVal', 'dateVal', 'boolVal', 'uriVal'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/item/1' },
          stringVal: { type: 'literal', value: 'Hello World' },
          intVal: { type: 'literal', value: '42', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          dateVal: { type: 'literal', value: '2023-01-15', datatype: 'http://www.w3.org/2001/XMLSchema#date' },
          boolVal: { type: 'literal', value: 'true', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' },
          uriVal: { type: 'uri', value: 'http://example.org/resource/1' }
        },
        {
          subject: { type: 'uri', value: 'http://example.org/item/2' },
          stringVal: { type: 'literal', value: 'This is a very long string value that should test the ellipsis mode truncation feature when it is enabled in the plugin configuration settings' },
          intVal: { type: 'literal', value: '100', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          dateVal: { type: 'literal', value: '2023-06-20', datatype: 'http://www.w3.org/2001/XMLSchema#date' },
          boolVal: { type: 'literal', value: 'false', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' },
          uriVal: { type: 'uri', value: 'http://example.org/resource/2' }
        },
        {
          subject: { type: 'bnode', value: '_:b1' },
          stringVal: { type: 'literal', value: 'Blank node example' },
          intVal: { type: 'literal', value: '-15', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          dateVal: { type: 'literal', value: '2023-12-25', datatype: 'http://www.w3.org/2001/XMLSchema#date' },
          boolVal: { type: 'literal', value: 'true', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' },
          uriVal: { type: 'uri', value: 'http://example.org/resource/3' }
        }
      ]
    }
  },
  
  large: {
    head: { vars: ['id', 'subject', 'predicate', 'object', 'timestamp'] },
    results: {
      bindings: Array.from({ length: 1000 }, (_, i) => ({
        id: { type: 'literal', value: `${i + 1}`, datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
        subject: { type: 'uri', value: `http://example.org/subject/${i % 100}` },
        predicate: { type: 'uri', value: `http://example.org/predicate/${i % 20}` },
        object: { type: 'literal', value: `Object value ${i}` },
        timestamp: { type: 'literal', value: new Date(2023, 0, 1 + (i % 365)).toISOString().split('T')[0], datatype: 'http://www.w3.org/2001/XMLSchema#date' }
      }))
    }
  },
  
  unicode: {
    head: { vars: ['language', 'text', 'special'] },
    results: {
      bindings: [
        { language: { type: 'literal', value: 'Chinese', 'xml:lang': 'en' }, text: { type: 'literal', value: '你好世界', 'xml:lang': 'zh' }, special: { type: 'literal', value: '<>&"\'@#$%' } },
        { language: { type: 'literal', value: 'Japanese', 'xml:lang': 'en' }, text: { type: 'literal', value: 'こんにちは世界', 'xml:lang': 'ja' }, special: { type: 'literal', value: '\\n\\t\\r' } },
        { language: { type: 'literal', value: 'Arabic', 'xml:lang': 'en' }, text: { type: 'literal', value: 'مرحبا بالعالم', 'xml:lang': 'ar' }, special: { type: 'literal', value: '🔷🚀📊' } },
        { language: { type: 'literal', value: 'Russian', 'xml:lang': 'en' }, text: { type: 'literal', value: 'Привет мир', 'xml:lang': 'ru' }, special: { type: 'literal', value: 'test@example.com' } },
        { language: { type: 'literal', value: 'Greek', 'xml:lang': 'en' }, text: { type: 'literal', value: 'Γεια σου κόσμε', 'xml:lang': 'el' }, special: { type: 'literal', value: 'http://example.org/path?query=value&foo=bar' } }
      ]
    }
  },
  
  decimals: {
    head: { vars: ['measurement', 'floatVal', 'doubleVal', 'decimalVal', 'integerVal', 'plainVal'] },
    results: {
      bindings: [
        {
          measurement: { type: 'literal', value: 'Pi approximation' },
          floatVal: { type: 'literal', value: '3.1415927410125732', datatype: 'http://www.w3.org/2001/XMLSchema#float' },
          doubleVal: { type: 'literal', value: '3.141592653589793', datatype: 'http://www.w3.org/2001/XMLSchema#double' },
          decimalVal: { type: 'literal', value: '3.14159265358979323846', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          integerVal: { type: 'literal', value: '3', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          plainVal: { type: 'literal', value: '3.14159265358979323846' }
        },
        {
          measurement: { type: 'literal', value: 'Small ratio' },
          floatVal: { type: 'literal', value: '0.123456789', datatype: 'http://www.w3.org/2001/XMLSchema#float' },
          doubleVal: { type: 'literal', value: '0.123456789012345', datatype: 'http://www.w3.org/2001/XMLSchema#double' },
          decimalVal: { type: 'literal', value: '0.12345678901234567890', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          integerVal: { type: 'literal', value: '0', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          plainVal: { type: 'literal', value: '0.12345678901234567890' }
        },
        {
          measurement: { type: 'literal', value: 'Whole number' },
          floatVal: { type: 'literal', value: '5', datatype: 'http://www.w3.org/2001/XMLSchema#float' },
          doubleVal: { type: 'literal', value: '5', datatype: 'http://www.w3.org/2001/XMLSchema#double' },
          decimalVal: { type: 'literal', value: '5', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          integerVal: { type: 'literal', value: '5', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          plainVal: { type: 'literal', value: '5' }
        },
        {
          measurement: { type: 'literal', value: 'Negative value' },
          floatVal: { type: 'literal', value: '-2.718281828', datatype: 'http://www.w3.org/2001/XMLSchema#float' },
          doubleVal: { type: 'literal', value: '-2.718281828459045', datatype: 'http://www.w3.org/2001/XMLSchema#double' },
          decimalVal: { type: 'literal', value: '-2.71828182845904523536', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          integerVal: { type: 'literal', value: '-2', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          plainVal: { type: 'literal', value: '-2.71828182845904523536' }
        }
      ]
    }
  },

  smartFormatters: {
    head: { vars: ['product', 'reviewStars', 'completionPercent', 'thumbnailImage', 'backgroundColor', 'description', 'available'] },
    results: {
      bindings: [
        {
          product: { type: 'uri', value: 'http://example.org/product/1' },
          reviewStars: { type: 'literal', value: '4', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          completionPercent: { type: 'literal', value: '75', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          thumbnailImage: { type: 'literal', value: 'https://placehold.co/48' },
          backgroundColor: { type: 'literal', value: '#4a90d9' },
          description: { type: 'literal', value: 'A high-quality product with excellent reviews.\nSuitable for all ages.' },
          available: { type: 'literal', value: 'true', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' }
        },
        {
          product: { type: 'uri', value: 'http://example.org/product/2' },
          reviewStars: { type: 'literal', value: '2', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          completionPercent: { type: 'literal', value: '30', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          thumbnailImage: { type: 'literal', value: 'https://placehold.co/48/ff0000/ffffff' },
          backgroundColor: { type: 'literal', value: 'rgb(255, 87, 34)' },
          description: { type: 'literal', value: 'Average product. Could be improved.' },
          available: { type: 'literal', value: 'false', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' }
        },
        {
          product: { type: 'uri', value: 'http://example.org/product/3' },
          reviewStars: { type: 'literal', value: '5', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          completionPercent: { type: 'literal', value: '100', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          thumbnailImage: { type: 'literal', value: 'https://placehold.co/48/00ff00/ffffff' },
          backgroundColor: { type: 'literal', value: 'green' },
          description: { type: 'literal', value: 'Best in class. Highly recommended!' },
          available: { type: 'literal', value: 'true', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' }
        },
        {
          product: { type: 'uri', value: 'http://example.org/product/4' },
          reviewStars: { type: 'literal', value: '0', datatype: 'http://www.w3.org/2001/XMLSchema#integer' },
          completionPercent: { type: 'literal', value: '0', datatype: 'http://www.w3.org/2001/XMLSchema#decimal' },
          thumbnailImage: { type: 'literal', value: 'https://placehold.co/48/888888/ffffff' },
          backgroundColor: { type: 'literal', value: '#888' },
          description: { type: 'literal', value: 'Not yet reviewed.' },
          available: { type: 'literal', value: 'false', datatype: 'http://www.w3.org/2001/XMLSchema#boolean' }
        }
      ]
    }
  },

  ontology: {
    head: {
      vars: [
        "sub",
        "obj"
      ]
    },
    results: {
      bindings: [
        {
          sub: {
            type: "uri",
            value: "http://www.w3.org/2000/01/rdf-schema#Resource"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#Class"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://www.opengis.net/ont/geosparql#asWKT"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#DatatypeProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://www.w3.org/2003/01/geo/wgs84_pos#lat"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#AnnotationProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://www.w3.org/2003/01/geo/wgs84_pos#long"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#AnnotationProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/contactLineSystemType"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#ObjectProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/functionalInfrastructure/contactLineSystems/10101_ATBh%20S11_1_ATBh%20S12_Overhead%20contact%20line%20%28OCL%29"
          },
          obj: {
            type: "uri",
            value: "http://data.europa.eu/949/ContactLineSystem"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/concepts/contact-line-systems/rinf/10"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2004/02/skos/core#Concept"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/currentLimitationRequired"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#DatatypeProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/energySupplySystem"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2002/07/owl#ObjectProperty"
          }
        },
        {
          sub: {
            type: "uri",
            value: "http://data.europa.eu/949/concepts/energy-supply-systems/rinf/AC20"
          },
          obj: {
            type: "uri",
            value: "http://www.w3.org/2004/02/skos/core#Concept"
          }
        }
      ]
    }
  }
};

// Extra triples for the describe panel (Ctrl+click an IRI). The rest comes
// from the result rows themselves (see triplesFromSelect in demo-host.js).
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FOAF = 'http://xmlns.com/foaf/0.1/';
const SCHEMA = 'http://schema.org/';
const iri = (value) => ({ type: 'uri', value });
const triple = (s, p, o) => ({ subject: iri(s), predicate: iri(p), object: o });

export const describeTriples = [
  triple('http://example.org/person/1', RDF_TYPE, iri(FOAF + 'Person')),
  triple('http://example.org/person/1', FOAF + 'name', { type: 'literal', value: 'Alice', 'xml:lang': 'en' }),
  triple('http://example.org/person/1', FOAF + 'age', { type: 'literal', value: '30', datatype: 'http://www.w3.org/2001/XMLSchema#integer' }),
  triple('http://example.org/person/1', FOAF + 'knows', iri('http://example.org/person/2')),
  triple('http://example.org/person/2', RDF_TYPE, iri(FOAF + 'Person')),
  triple('http://example.org/person/2', FOAF + 'name', { type: 'literal', value: 'Bob', 'xml:lang': 'en' }),
  triple('http://example.org/person/2', FOAF + 'knows', iri('http://example.org/person/1')),
  triple('http://example.org/product/1', RDF_TYPE, iri(SCHEMA + 'Product')),
  triple('http://example.org/product/1', SCHEMA + 'name', { type: 'literal', value: 'Premium Widget' }),
  triple('http://example.org/product/1', SCHEMA + 'brand', iri('http://example.org/brand/acme')),
];

export const prefixes = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  schema: 'http://schema.org/',
  geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
  geosparql: 'http://www.opengis.net/ont/geosparql#',
  era: 'http://data.europa.eu/949/',
  ex: 'http://example.org/',
  demo: 'http://example.org/demo#',
};
