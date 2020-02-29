import http, { RefinedResponse } from "k6/http";
import { check, JSONValue } from "k6";

import { User } from "../lib/types/framework.types";
import { LoginResponseBody } from "../lib/types/crocodile.api"

import { setSleep } from "../lib/sleep.helpers";

export function login(_user: User, _url: string): JSONValue {

    // login using a 'post' request and store the result in 'loginRes'
    let loginRes: RefinedResponse<"text"> = http.post(`${_url}/auth/token/login/`, {
      username: _user.username,
      password: _user.password
    });

    const loginData: LoginResponseBody = JSON.parse(loginRes.body);
  
    // parse the 'loginRes' response as 'JSON' and use the 'access' selector to grab the Bearer token https://docs.k6.io/docs/response-k6http
    let authToken = loginData.access;
  
    // check that the token is not empty
    check(authToken, { 'logged in successfully': () => authToken !== '', });

    setSleep(0.5, 1);

    return authToken;

}

