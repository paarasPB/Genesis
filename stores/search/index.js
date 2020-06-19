import fetchival from 'fetchival';
import {store} from 'react-easy-state';
import {searchAPI} from '../config';

// create store
const searchStore = store({
  results: [],
  status: 'init',
});

export const getSuggestions = async q => {
 // console.log("searchAPI "+searchAPI +q)
  searchStore.status = 'loading';
  const results = await fetchival(searchAPI)
    .post({q})
    .catch(e => ({error: e}));
 // console.log(results);
  //if(results)
  searchStore.results = results;
//  else
//	  typeaheadStore.results = [];  
  searchStore.status = 'done';
};

export default searchStore;
