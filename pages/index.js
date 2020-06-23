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
	const titleArray = [].concat(results);
//	 for (var i = 0; i < results.length; i++) {
//		  
//		 titleArray.push(results[i].entity);
//		   }
	//const entityArray = JSON.parse(JSON.stringify( results ));
	const counter = store({
		
		  increment: (event) => {
			  //console.log("dropvalue "+ event.target.value)
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
	  
    return wrap(
      <React.Fragment>
        <style jsx>{`
          .paddedRow {
            padding-bottom: 30px;
          }
          select {
           
           color:rgb(255, 255, 255);
           font-weight:400;
           font-size:15px;
           padding: 8px;
           background-color: #2196f3;
           border: none !important;
           -webkit-appearance:none;
           outline: none;
        }
        option {
         background-color:rgb(255, 255, 255);
         color:rgb(102, 102, 102);
         -webkit-appearance:none;
         outline: none;
        }
        .selectRow {
           display: flex !important;
           justify-content: flex-end;
           
        }
        `}</style>
        <div className="selectRow">
        <select value={titleArray.entity} onChange = {(e)=>counter.increment(e)}>
        <option value="" disabled selected hidden>Select entity</option>
        {
        	Array.from(new Set(titleArray.map(s=>s.entity))).map((team) => <option value={team} >{team}</option>)
        	//titleArray.map((team) => <option value={team.entity} >{team.entity}</option>)
        }
        </select>
        </div>
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
	  
    return wrap(
      <React.Fragment>
        <style jsx>{`
          .paddedRow {
            padding-bottom: 30px;
          }
            select {
           
           color:rgb(255, 255, 255);
           font-weight:400;
           font-size:15px;
           padding: 8px;
           background-color: #2196f3;
           border: none !important;
           -webkit-appearance:none;
           outline: none;
        }
        option {
         background-color:rgb(255, 255, 255);
         color:rgb(102, 102, 102);
         -webkit-appearance:none;
         outline: none;
        }
        .selectRow {
           display: flex !important;
           justify-content: flex-end;
           
        }
        `}</style>
          <div className="selectRow">
        <select value={results.entity} onChange = {(e)=>counter.increment(e)}>
        <option value="" disabled selected hidden>Select entity</option>
        {
        	//results.map((team) => <option key={team.url} value={team.entity} >{team.entity}</option>)
        	Array.from(new Set(titleArray.map(s=>s.entity))).map((team) => <option value={team} >{team}</option>)
        }
        </select>
        </div>
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
