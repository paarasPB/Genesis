import Link from 'next/link';
import React, { useState } from 'react';
import {view, store} from 'react-easy-state';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import searchStore from '../stores/search';

const wrap = body => (
  <Layout>
    <div className="row parentRow">
      <style jsx>{`
        .parentRow {
          padding-top: 20px;
        }

        .centerContent {
          display: flex;
          justify-content: center;
        }
      `}</style>
      <style jsx global>{`
        .centerContent .cube-grid {
          width: 60px;
          height: 60px;
        }
      `}</style>
      <div className="col-sm-8 offset-sm-2">{body}</div>
    </div>
  </Layout>
);


const count = store({
	state: 0
});

const  refinedResults = [];

export default view(() => {
	
	const {status, results} = searchStore;
	const titleArray = results;
	
	const counter = store({
		
		  increment: (event) => {
			  console.log("dropvalue "+ event.target.value)
			  refinedResults.length =0
			   for (var i = 0; i < results.length; i++) {
				   if(event.target.value==results[i].entity)
					     refinedResults.push(results[i]);
				   }
			  
			  count.state = count.state + 1 ;
				   }
		});
	

  if (status === 'loading') {
	  count.state=0;
    return wrap(
      <div className="row centerContent">
        <Spinner />
      </div>
    );
  }

  if (results && results.error) {
    return wrap(
      <div className="row">
        <b>Oops!</b> Looks like DBpedia is having some problems!<br />
        Please check its status <a href="http://dbpedia.org/sparql">here</a> and try again once its working.
      </div>
    );
  }

  
  
  if (results && results.length && !count.state) {
	  console.log("results "); console.log(results[0]);
	  
    return wrap(
      <React.Fragment>
        <style jsx>{`
          .paddedRow {
            padding-bottom: 30px;
          }
        `}</style>
        
        <select value={new Set(results.entity)} onChange = {(e)=>counter.increment(e)}>
        {
        	Array.from(new Set(results.map(s=>s.entity))).map((team) => <option value={team} >{team}</option>)
        }
        </select>
        
        {
        	
        	results.map(it => (
          <div className="row paddedRow" key={it.url}>
            <div className="col-sm-2">
              <img className="img-fluid rounded" src={it.image} alt={it.image} />
            </div>
            <div className="col-sm-10">
              <h4>{it.title}</h4>
              <p>{it.description}</p>
              <Link
                href={{
                  pathname: '/resource',
                  query: {resource: it.url, title: it.title},
                }}>
                <a>Show full details</a>
              </Link>
            </div>
          </div> 
        ))}

      </React.Fragment>
    );
  }
  
if (count.state) {
	  
	  console.log("filterTrue "+refinedResults )
    return wrap(
      <React.Fragment>
        <style jsx>{`
          .paddedRow {
            padding-bottom: 30px;
          }
        `}</style>
        <select value={results.entity} onChange = {(e)=>counter.increment(e)}>
        {
        	results.map((team) => <option key={team.url} value={team.entity} >{team.entity}</option>)
        }
        </select>
        
        {
        	
        	refinedResults.map(it => (
          <div className="row paddedRow" key={it.url}>
            <div className="col-sm-2">
              <img className="img-fluid rounded" src={it.image} alt={it.image} />
            </div>
            <div className="col-sm-10">
              <h4>{it.title}</h4>
              <p>{it.description}</p>
              <Link
                href={{
                  pathname: '/resource',
                  query: {resource: it.url, title: it.title},
                }}>
                <a>Show full details</a>
              </Link>
            </div>
          </div> 
        ))}

      </React.Fragment>
    );
  }

  return wrap(
    <div className="row text-center">
      <h3>
        Welcome to Genesis!<br />
        <small>Try searching for something</small>
      </h3>
    </div>
  );
});
