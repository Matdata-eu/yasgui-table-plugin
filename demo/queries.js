// Sample SELECT queries for testing the table plugin

const queries = {
  dbpedia: `# Query DBpedia for notable people
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?person ?name ?birth ?description
WHERE {
  ?person a dbo:Person ;
          rdfs:label ?name ;
          dbo:birthDate ?birth ;
          dbo:abstract ?description .
  FILTER (LANG(?name) = 'en')
  FILTER (LANG(?description) = 'en')
  FILTER (YEAR(?birth) > 1950)
}
LIMIT 100`,

  wikidata: `# Query Wikidata for cities with population
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>

SELECT ?city ?cityLabel ?country ?countryLabel ?population ?coord
WHERE {
  ?city wdt:P31 wd:Q515 ;           # instance of city
        wdt:P17 ?country ;           # country
        wdt:P1082 ?population ;      # population
        wdt:P625 ?coord .            # coordinates
  FILTER (?population > 1000000)     # cities with 1M+ people
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?population)
LIMIT 50`,

  datatypes: `# Test different SPARQL datatypes
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ex: <http://example.org/>

SELECT ?subject ?stringVal ?intVal ?dateVal ?boolVal ?uriVal
WHERE {
  VALUES (?subject ?stringVal ?intVal ?dateVal ?boolVal ?uriVal) {
    (ex:Item1 "Hello World" 42 "2023-01-15"^^xsd:date true <http://example.org/resource1>)
    (ex:Item2 "Test String with a very long value to test ellipsis mode truncation feature" 100 "2023-06-20"^^xsd:date false <http://example.org/resource2>)
    (ex:Item3 "Another Value" -15 "2023-12-25"^^xsd:date true <http://example.org/resource3>)
    (ex:Item4 "Special chars: <>&\\"'@" 999 "2024-01-01"^^xsd:date true <http://example.org/resource4>)
  }
}`,

  large: `# Large result set to test virtual scrolling
SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o .
}
LIMIT 1000`,

  blankNodes: `# Test blank nodes rendering
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX ex: <http://example.org/>

SELECT ?person ?name ?address ?street ?city
WHERE {
  VALUES (?person ?name ?street ?city) {
    (ex:Person1 "Alice" "123 Main St" "Springfield")
    (ex:Person2 "Bob" "456 Oak Ave" "Portland")
    (ex:Person3 "Charlie" "789 Pine Rd" "Seattle")
  }
  BIND(BNODE() as ?address)
}`,

  prefixes: `# Test URI prefix resolution
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?person ?name ?type ?property
WHERE {
  VALUES (?person ?name ?type ?property) {
    (dbr:Albert_Einstein "Albert Einstein" dbo:Scientist foaf:name)
    (dbr:Marie_Curie "Marie Curie" dbo:Scientist foaf:givenName)
    (dbr:Isaac_Newton "Isaac Newton" dbo:Scientist foaf:familyName)
  }
}
LIMIT 100`
};
