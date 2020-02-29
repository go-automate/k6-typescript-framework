import { group } from 'k6';
import { Options } from 'k6/options';

import { setSleep } from '../lib/sleep.helpers'

import * as publicUserActions from '../actions/roles/public-user.role'
import { RefinedResponse } from 'k6/http';

/**
 * This is an example LOAD script. 
 * 
 * It queries crocodiles from the following app:
 * https://test-api.loadimpact.com/
 * 
 * It is usually run while another performance test is running some BAU activity 
 * to see if querying crocodiles impacts the overall performance of the system.
 * 
 * Can be used in conjunction with other LOAD scripts, e.g. one that adds 
 * crocodiles to the system.
 */

// Test Options https://docs.k6.io/docs/options
export let options: Partial<Options> = {
 // this load test runs for 30 seconds
 duration: "30s"
};

const BASE_URL = 'https://test-api.loadimpact.com';

// default function (imports the Bearer token) https://docs.k6.io/docs/test-life-cycle
export default () => {

  // Public actions - you don't need to be logged in to perform these
  // this is a group https://docs.k6.io/docs/tags-and-groups
  group('Query Crocs', () => {

    let responses: RefinedResponse<"text">[] = [];
    publicUserActions.queryCrocodiles(BASE_URL, responses);

  })

  // sleeps help keep your script realistic https://docs.k6.io/docs/sleep-t-1
  setSleep();
} 