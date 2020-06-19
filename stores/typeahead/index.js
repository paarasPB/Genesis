import fetchival from 'fetchival';
import {store} from 'react-easy-state';
import {typeaheadAPI} from '../config';

// create store
const typeaheadStore = store({
  results: [],
  status: 'init',
});

export const getSuggestions = async q => {
  typeaheadStore.status = 'loading';
  console.log("loading typeahead store");
  const results = await fetchival(typeaheadAPI)
    .post({q})
    .catch(e => ({error: e}));
  console.log(results);
  console.log("typeaheadAPI");console.log(typeaheadAPI)
  //if(results)
  typeaheadStore.results = results;
  //else
	//  typeaheadStore.results = [];  
  typeaheadStore.status = 'done';
  
};

export const clearSuggestions = () => {
  typeaheadStore.results = [];
};

export default typeaheadStore;
