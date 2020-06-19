// npm packages
const _ = require('lodash/fp');
const fastify = require('fastify');
const fetchival = require('fetchival');
const fetch = require('node-fetch');

// our packages
const createLogger = require('../../server/logger');
const {sparqlEndpoint, defaultGraphUri, luceneService, sparqlEndpointWiki, defaultGraphUriWiki} = require('../../config');
const jsonRdfParser = require('../../util/rdf-json-parser');
const timeout = require('../../util/timeout');

// setup fetchival
fetchival.fetch = fetch;

// capitalize util
const capitalize = _.compose(
  _.join(' '),
  _.map(_.capitalize),
  _.words
);

// logger
const logger = createLogger('GENESIS-search');

// init app
const app = fastify();

const jsonToQuery = json => `select distinct ?url ?description ?image where {
    ?url <http://dbpedia.org/ontology/abstract> ?description .
    OPTIONAL {
        ?url <http://dbpedia.org/ontology/thumbnail> ?image .
    }
    FILTER(langMatches(lang(?description), "EN"))
    FILTER(?url IN (${json.map(it => `<${it.url}>`).join(',')}))
} LIMIT ${json.length * 2}`;

const wikiJsonToQuery = json => `select distinct ?url ?description ?image where {
    ?url schema:description ?description .
    OPTIONAL {
        ?url wdt:P18 ?image .
    }
    FILTER(langMatches(lang(?description), "EN"))
    VALUES ?url {${json.map(it => `<${it.url}>`).join(' ')}}
    
}LIMIT 10`;

/*const wikiJsonToQuery = json => `select distinct ?url   (SAMPLE(?description) AS ?description)  (SAMPLE(?image) AS ?image) 
 where {
?url schema:description ?description .
OPTIONAL {
    ?url wdt:P18 ?image .
}
FILTER(langMatches(lang(?description), "[AUTO_LANGUAGE]"))
VALUES ?url { 
  ${json.map(it => `<${it.url}>`).join(' ')}  
}

}GROUP by ?url
LIMIT ${json.length * 2}`;*/

//const wikiJsonToQuery = json => `select distinct ?url ?description ?image where {
//    ?url schema:description ?description .
//    	    OPTIONAL {
//    	        ?url wdt:P18 ?image .
//    	    }
//    	    FILTER(langMatches(lang(?description), "[AUTO_LANGUAGE]"))
//    	    VALUES ?url {<http://www.wikidata.org/entity/Q2971> <http://www.wikidata.org/entity/Q1731>
//    	             <http://www.wikidata.org/entity/Q1661178> 
//    	             <http://www.wikidata.org/entity/Q39611746>
//    	              <http://www.wikidata.org/entity/Q16429066>
//    	             }
//    	}LIMIT 6`;

// serve index page
app.post('/', async (req, res) => {
  const {q} = req.body;
  logger.info('processing:', q, req.body, req.query);
 // console.log("query"+ q);
  if (q.length < 2) {
    res.send([]);
    return;
  }
 // console.log("search service");
 // console.log(luceneService+" "+q);
  
  const origJson = await fetchival(luceneService).get({q});
  console.log("origJson");
  console.log(origJson[0]);
  const json = origJson
    .map(it => ({
      url: it.url,
      title: capitalize(it.label),
      entity: it.entityType
    }))
    .slice(0, 30);
//  console.log("json");
//  console.log(json[0]);
  
  const body = await timeout(
    10000, handleQuery()
     );
  console.log("body")
  console.log(body)
 
  function handleQuery() {
	  const exists = json.some(v => (v.url.includes("wikidata")));
	  if(exists){
		  console.log("inside wikidata query ");
//		  console.log("sparqlEndpointWiki"+sparqlEndpointWiki);
//		  console.log("defaultGraphUriWiki"+defaultGraphUriWiki );
		  console.log(wikiJsonToQuery(json));
		  const fullUrl = sparqlEndpointWiki + '?query=' + encodeURIComponent( wikiJsonToQuery(json) );
		  const headers = { 'Accept': 'application/sparql-results+json' };
		  const ret =  fetch(fullUrl, { headers } ).then( body => body.json() );
		  console.log("ret ")
		  console.log(ret);
		      return ret;
	  }
	  else {      
	      console.log("inside dbpedia query");
	      console.log("wikiJsonToQuery"+jsonToQuery(json));
		  const ret = fetchival(sparqlEndpoint).get({
		      'default-graph-uri': defaultGraphUri,
		      query: jsonToQuery(json),
		    });
		  console.log("ret ")
		  console.log(ret);
		  return ret;
	  }
  	}
 
  const data = await jsonRdfParser(body);
//  console.log("data");
//  console.log(data);
  const resultJson = json
    .map(j => {  
    	 const ex = data.filter(d => d.url.value === j.url)[0];
    	 console.log("ex ")
    	 console.log(ex)
         if (!ex) {
           return undefined;
         }
         return {
           ...j,
           description: ex.description.value,
           image: ex.image ? ex.image.value : 'http://placehold.it/350x150',
         };
    })
    // filter empty
    .filter(x => x !== undefined);
  res.send(resultJson);
});

// start server
app.listen(8081, (err, address) => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info(`GENESIS-search listening at ${address}`);
});
