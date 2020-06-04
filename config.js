exports.sparqlEndpoint = process.env.SPARQL_ENDPOINT || 'http://dbpedia.org/sparql';
exports.defaultGraphUri = process.env.DEFAULT_GRAPH_URI || 'http://dbpedia.org';
//exports.luceneService = process.env.LUCENE_SERVICE || 'http://localhost:8181/search';
exports.luceneService = process.env.LUCENE_SERVICE || 'http://localhost:8080/EntitySearch/scoringService/getdocuments';
exports.avatarService = process.env.AVATAR_SERVICE || 'http://localhost:8182';
exports.similarService = process.env.SIMILAR_SERVICE || 'http://localhost:8183/similar';
exports.relatedService = process.env.RELATED_SERVICE || 'http://localhost:8183/related';
