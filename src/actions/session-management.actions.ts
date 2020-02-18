import http, { RefinedResponse } from "k6/http";
import { check, JSONValue } from "k6";

import { User } from "../lib/types/users";

import { setSleep } from "../lib/sleep.helpers";

export function login(_user: User, _url: string): JSONValue {

    // login using a 'post' request and store the result in 'loginRes'
    let loginRes: RefinedResponse<"text"> = http.post(`${_url}/auth/token/login/`, {
      username: _user.username,
      password: _user.password
    });
  
    // parse the 'loginRes' response as 'JSON' and use the 'access' selector to grab the Bearer token https://docs.k6.io/docs/response-k6http
    let authToken = loginRes.json('access');
  
    // check that the token is not empty
    check(authToken, { 'logged in successfully': () => authToken !== '', });

    setSleep(0.5, 1);

    return authToken;

}

