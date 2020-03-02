import { group, check, fail } from "k6";
import http from "k6/http"

import { randomCrocodile } from '../lib/test-data.helpers'
import { setSleep } from "../lib/sleep.helpers";
import { Crocodile } from "../lib/types/crocodile.api";
import { Counter } from "k6/metrics";

export function createCrocodile( _requestConfigWithTag: any, _url: string, count: Counter ): string {

  group('Create Crocs', () => {

    // body of the post request
    const payload: Crocodile = randomCrocodile();

    const res = http.post(_url, payload as {}, _requestConfigWithTag({ name: 'Create' }));

    const createdCroc: Crocodile = JSON.parse(res.body as string);

    // check the crock is created
    if (check(res, { 'Croc created correctly': (r) => r.status === 201 })) {
      _url = `${_url}${createdCroc.id}/`;
      count.add(1);
    } else {
      fail(`Unable to create a Croc ${res.status} ${res.body}`);
    }

    setSleep(0.5, 1);

  });

  return _url
}

export function updateCrocodile( _requestConfigWithTag: any, _url: string, _newName: string, count: Counter ){
  group('Update Croc', () => {
    const payload = { name: `${_newName}` };
    const res = http.patch(_url, payload, _requestConfigWithTag({ name: 'Update' }));
    const isSuccessfulUpdate = check(res, {
      'Update worked': () => res.status === 200,
      'Updated name is correct': () => res.json('name') === 'New Name',
    });

    // if checks failed, log this.
    if (!isSuccessfulUpdate) {
      console.log(`Unable to update the croc ${res.status} ${res.body}`);
      return
    }
    count.add(1);
  });

  setSleep(0.5, 1);
}

export function deleteCrocodile( _requestConfigWithTag: any, _url: string, count: Counter ){

  group('Delete Croc', () => {
  const delRes = http.del(_url, null, _requestConfigWithTag({ name: 'Delete' }));
  const isSuccessfulDelete = check(null, {
    'Croc was deleted correctly': () => delRes.status === 204,
  });
  if (!isSuccessfulDelete) {
    console.log(`Croc was not deleted properly`);
    return
  }
  count.add(1);
})

setSleep(0.5, 1);

}

export function queryCrocodiles(_url: string, crocs:Crocodile[]): Crocodile[]{

    // these dont need auth as they're public endpoints - all tagged with the same name and therefore will be tested by the same threshold
    group('Query Crocodiles', () => {
      // call some public endpoints in a batch request https://docs.k6.io/docs/batch-requests
      let responses = http.batch([
        ['GET', `${_url}/public/crocodiles/1/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/2/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/3/`, null, {tags: {name: 'PublicCrocs'}}],
        ['GET', `${_url}/public/crocodiles/4/`, null, {tags: {name: 'PublicCrocs'}}],
      ]);

      for(let i=0; i < responses.length; i++){
        check(responses[i], {
          'Query successful': () => responses[i].status === 200
        });
        crocs.push(JSON.parse(responses[i].body as string))
      }

    });

    setSleep(0.5, 1);

    return crocs;
}

export function checkAges(_crocs: Crocodile[], _minAge: number ){

  group('Functional Test: Check Ages', () => {
        // get all the ages out of each of the responses
        const ages = Object.values(_crocs).map(croc => croc.age);
  
        // Functional test: check that all the public crocodiles are older than 5
        check(ages as number[], {
          'Crocs are older than 5 years of age': (ages) => Math.min(...ages) > _minAge
        });
  })

}
