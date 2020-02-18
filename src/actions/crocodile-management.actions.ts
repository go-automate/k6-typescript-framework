import { group, check, fail, JSONValue } from "k6";
import http, { RefinedBatchRequest, RefinedResponse } from "k6/http"

import { randomCrocodile } from '../lib/test-data.helpers'
import { setSleep } from "../lib/sleep.helpers";

export function createCrocodile( _requestConfigWithTag: any, _url: string ): string {

  group('Create crocs', () => {

    // body of the post request
    const payload = randomCrocodile();

    const res = http.post(_url, payload, _requestConfigWithTag({ name: 'Create' }));

    // check the crock is created
    if (check(res, { 'Croc created correctly': (r) => r.status === 201 })) {
      _url = `${_url}${res.json('id')}/`;
    } else {
      fail(`Unable to create a Croc ${res.status} ${res.body}`);
    }

    setSleep(0.5, 1);

  });

  return _url
}

export function updateCrocodile( _requestConfigWithTag: any, _url: string, _newName: string ){
  group('Update croc', () => {
    const payload = { name: `${_newName}` };
    const res = http.patch(_url, payload, _requestConfigWithTag({ name: 'Update' }));
    const isSuccessfulUpdate = check(res, {
      'Update worked': () => res.status === 200,
      'Updated name is correct': () => res.json('name') === 'New name',
    });

    // if checks failed, log this.
    if (!isSuccessfulUpdate) {
      console.log(`Unable to update the croc ${res.status} ${res.body}`);
      return
    }
  });

  setSleep(0.5, 1);
}

export function deleteCrocodile( _requestConfigWithTag: any, _url: string ){

  group('Delete croc', () => {
  const delRes = http.del(_url, null, _requestConfigWithTag({ name: 'Delete' }));
  const isSuccessfulDelete = check(null, {
    'Croc was deleted correctly': () => delRes.status === 204,
  });
  if (!isSuccessfulDelete) {
    console.log(`Croc was not deleted properly`);
    return
  }
})

setSleep(0.5, 1);

}

export function queryCrocodiles(_url: string): RefinedResponse<"text">[]{

  let responses: RefinedResponse<"text">[];

    // these dont need auth as they're public endpoints - all tagged with the same name and therefore will be tested by the same threshold
    group('Query Crocodiles', () => {
      // call some public endpoints in a batch request https://docs.k6.io/docs/batch-requests
      responses = http.batch([
        ['GET', `${_url}/public/crocodiles/1/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/2/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/3/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/4/`, null, {tags: {name: 'PublicCrocs'}}],
      ]);

    });

    setSleep(0.5, 1);

    return responses;
}

export function checkAges(_responses: RefinedResponse<"text">[], _minAge: number ){

  group('Check ages', () => {
        // get all the ages out of each of the responses
        const ages: JSONValue[] = Object.values(_responses).map(res => res.json('age'));
  
        // Functional test: check that all the public crocodiles are older than 5
        check(ages as number[], {
          'Crocs are older than 5 years of age': (ages) => Math.min(...ages) > _minAge
        });
  })

}
