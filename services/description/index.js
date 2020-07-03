// npm packages
const fastify = require('fastify');
const fetchival = require('fetchival');
const fetch = require('node-fetch');
// logging
const createLogger = require('../../server/logger');

// our packages
const {sparqlEndpoint, defaultGraphUri, sparqlEndpointWiki} = require('../../config');
const jsonRdfParser = require('../../util/rdf-json-parser');

// setup fetchival
fetchival.fetch = fetch;

// create logger
const logger = createLogger('GENESIS-description');

// init app
const app = fastify();

const urlToQuery = url => `select ?description ?image where {
    <${url}> <http://dbpedia.org/ontology/abstract> ?description .
    OPTIONAL {
        <${url}> <http://dbpedia.org/ontology/thumbnail> ?image .
    }
    FILTER(langMatches(lang(?description), "EN"))
} LIMIT 1`;

const urlToWikiQuery = url =>  `select ?description ?image where {
    <${url}> schema:description ?description .
    OPTIONAL {
       <${url}> wdt:P18 ?image .
    }
    FILTER(langMatches(lang(?description), "EN"))

}LIMIT 1`;

// serve index page
app.post('/', async (req, res) => {
  const {url} = req.body;
  if (url.length < 2) {
    res.send([]);
    return;
  }

  logger.debug('generating description for:', url);

  const result = await handleKGQuery(url);
  
  function handleKGQuery(uri){
	    if(uri.includes("http://www.wikidata.org")){
        			  const sparqlUrl = sparqlEndpointWiki + '?query=' + encodeURIComponent( urlToWikiQuery(uri) );
					  console.log( urlToWikiQuery(uri));
        	          const headers = { 'Accept': 'application/sparql-results+json' };
					  const res =  fetch(sparqlUrl, { headers } ).then( body => body.json() );
					
					  return res;
        }
        else{
        	const res = fetchival(sparqlEndpoint).get({
        	    'default-graph-uri': defaultGraphUri,
        	    query: urlToQuery(uri),
        	  });
        	return res;
		}
}
  
	  
  const body = await jsonRdfParser(result);
  const description = body
    .map(it => {
    	return  {
			      description: it.description.value.replace(/\s\s+/g, ' '),
			      image: it.image ? it.image.value : undefined,
    	};
    })
    .pop();
  res.send({description});
});

// start server
app.listen(8082, (err, address) => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info(`GENESIS-description listening at ${address}`);
});
