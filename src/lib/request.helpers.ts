import { JSONValue } from "k6";

export function createRequestConfigWithTag(_authToken: JSONValue){
    // the headers and tags needed for logged-in request https://docs.k6.io/docs/http-requests
    return (tag:{ [key: string]: string; }) => ({
      headers: {
        Authorization: `Bearer ${_authToken}`
      },
      tags: Object.assign({}, {
        // all urls will be tagged with this name
        name: 'PrivateCrocs'
      },
      // and any other name we pass through 
      tag)
    });
}