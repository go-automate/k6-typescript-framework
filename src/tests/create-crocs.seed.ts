import { group } from 'k6';
import { Options } from 'k6/options';

import { randomString } from '../lib/test-data.helpers'
import { createRequestConfigWithTag } from '../lib/request.helpers';
import { setSleep } from '../lib/sleep.helpers'

import { User } from '../lib/types/framework.types'

import * as crocodileOwnerActions from '../actions/roles/crocodile-owner.role'
import * as adminActions from '../actions/roles/admin.role'
import * as publicUserActions from '../actions/roles/public-user.role'
import { Counter } from 'k6/metrics';

/**
 * This is a SEEDING script. Do not run as a performance test. 
 * 
 * It creates crocodiles on the following app:
 * https://test-api.loadimpact.com/
 * for use by the performance tests (a Soak test in this case).
 */

// Test Options https://docs.k6.io/docs/options
export let options: Partial<Options> = {
 // This script runs for 5 iterations and therefore creates 5 crocodiles.
 iterations: 5
};

let numberOfCrocodilesCreated = new Counter("NumberOfCrocodilesCreated")

const CROCODILE_OWNER: User = {
  first_name: "Crocodile",
  last_name: "Owner",
  username: `${randomString(10)}@example.com`,  // Set your own email or `${randomString(10)}@example.com`;,
  password: 'superCroc2019'
}

const BASE_URL = 'https://test-api.loadimpact.com';

// The Setup Function is run once before the Load Test https://docs.k6.io/docs/test-life-cycle
export function setup() {

  // admin user can create a new user without logging in - this is just a test system
  adminActions.registerNewUser(CROCODILE_OWNER, BASE_URL);

  // new user 'Crocodile Owner' logs in and returns the auth token
  const authToken = crocodileOwnerActions.login(CROCODILE_OWNER, BASE_URL);

  // anything returned here can be imported into the default function https://docs.k6.io/docs/test-life-cycle
  return authToken;
}

// default function (imports the Bearer token) https://docs.k6.io/docs/test-life-cycle
export default (_authToken: string) => {

  // Private actions - you need to be logged in to do these
  group('Create crocs', () => {

    const requestConfigWithTag = createRequestConfigWithTag(_authToken); // Sets the auth token in the header of requests and the 'public requests' tag
    
    let URL = `${BASE_URL}/my/crocodiles/`;

    // returns an updated URL that contains the crocodile ID - could be saved to an array and eventually to a JSON file for use in performance tests.
    crocodileOwnerActions.createCrocodile(requestConfigWithTag, URL, numberOfCrocodilesCreated);

  });

  // sleeps help keep your script realistic https://docs.k6.io/docs/sleep-t-1
  setSleep();
} 

export function teardown() {
  // you can add functionality here to save the crocodile IDs to a JSON file for use by the performance tests.
}