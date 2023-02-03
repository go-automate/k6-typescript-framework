import { group } from 'k6';
import { Options } from 'k6/options';

import { randomString } from '../lib/test-data.helpers'
import { createRequestConfigWithTag } from '../lib/request.helpers';
import { setSleep } from '../lib/sleep.helpers'

import { Crocodile } from '../lib/types/crocodile.api'
import { User } from '../lib/types/framework.types'

import * as crocodileOwnerActions from '../actions/roles/crocodile-owner.role'
import * as adminActions from '../actions/roles/admin.role'
import * as publicUserActions from '../actions/roles/public-user.role'
import { Counter } from 'k6/metrics';

/**
 * A soak test that runs through some common user actions
 * for the Crocodile App:
 * https://test-api.loadimpact.com/
 *
 * P.s. the k6 Types can be found here for reference:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/k6
 */

// Test Options https://docs.k6.io/docs/options
export let options: Partial<Options> = {
 // a single stage where we ramp up to 10 users over 30 seconds
 stages: [
   { target: 20, duration: '3m' },
 ],
 // test thresholds https://docs.k6.io/docs/thresholds
  thresholds: {
    'http_req_duration': ['avg<500', 'p(95)<1500'],
    'http_req_duration{name:PublicCrocs}': ['avg<400'],
    'http_req_duration{name:Create}': ['avg<600', 'p(90)<700'],
  },
};

let numberOfCrocodilesCreated = new Counter("NumberOfCrocodilesCreated");
let numberOfCrocodilesDeleted = new Counter("NumberOfCrocodilesDeleted");
let numberOfCrocodilesUpdated = new Counter("NumberOfCrocodilesUpdated");

// Have these as gauges
// Create a map that has 'vu' and 'count'
// Then update the gauge with the count and then tag it with the vu both from the map

let countCrocs = new Map();
let countDeleted = new Map();
let countUpdated = new Map();

/**
 * Example of importing data from a file - PLEASE NOTE we don't use this data, it's just to show how to do it
 * i.e. don't use the k6 'open()' function.
 * Webpack will automatically convert JSON to a JS object (don't need JSON.parse)
 * */
const crocodilesFromJson = require('../data/crocodiles.json')

const CROCODILE_OWNER: User = {
  first_name: "Crocodile",
  last_name: "Owner",
  username: `${randomString(10)}@example.com`,  // Set your own email or `${randomString(10)}@example.com`;,
  password: 'superCroc2019'
}

const BASE_URL = 'https://test-api.k6.io';

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
export default (_authToken:string) => {

  // Public actions - you don't need to be logged in to perform these
  // this is a group https://docs.k6.io/docs/tags-and-groups
  group('Query and Check Crocs', () => {

    let crocodiles: Crocodile[] = [];
    crocodiles = publicUserActions.queryCrocodiles(BASE_URL, crocodiles);
    publicUserActions.checkAges(crocodiles, 5)

  })

  // Private actions - you need to be logged in to do these
  group('Create and Modify Crocs', () => {

    const requestConfigWithTag = createRequestConfigWithTag(_authToken); // Sets the auth token in the header of requests and the 'public requests' tag
    let URL = `${BASE_URL}/my/crocodiles/`;

    // returns an updated URL that contains the crocodile ID
    URL = crocodileOwnerActions.createCrocodile(requestConfigWithTag, URL, numberOfCrocodilesCreated);

    crocodileOwnerActions.updateCrocodile(requestConfigWithTag, URL, "New Name", numberOfCrocodilesUpdated);

    crocodileOwnerActions.deleteCrocodile(requestConfigWithTag, URL, numberOfCrocodilesDeleted);

  });

  // sleeps help keep your script realistic https://docs.k6.io/docs/sleep-t-1
  setSleep();
}
