# k6 Typescript Framework
A starter framework for k6 load tests written in TypeScript

## Quick Start

Clone this repository and open in the IDE of your choice.

Install dependencies using `yarn install` in the terminal (you need to have [yarn](https://yarnpkg.com/getting-started/install) installed on your machine).

Start the monitors using the `yarn monitors` command. Go to `localhost:3000` in your browser to login to Grafana with the username `admin` and the password `admin`.

Add the [k6 dashboard](https://grafana.com/grafana/dashboards/2587) to `Grafana` by following these instructions: [Exporting a Dashboad](https://grafana.com/docs/grafana/latest/reference/export_import/)

Now run the test using the `yarn go` command.

## The Test Framework

The test is based on the sample script and API provided by k6:

https://test-api.loadimpact.com/

This is a dummy application/api for people who own crocodiles to keep track of their crocodiles. In the test we will create a user, query crocodiles, and create, update and delete a crocodile. The test also include [thresholds](https://docs.k6.io/docs/thresholds) and [checks](https://docs.k6.io/docs/checks)

I've converted the test to TypeScript and broken it out into modules so it's easier to use and scale.

### src folder

All the code can be found in the `src` folder. And is written in TypeScript using [types provided by k6](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/k6).

### lib folder

Within this folder, the `lib` folder contains bespoke `types` and helper functions. It's highly recommended that you unit test your helper functions (e.g. with [Jest](https://jestjs.io/)). However I've not done that here, just to keep things simple.

### actions folder

The `actions` folder contains the requests for each user action. The `roles` folder (inside the `actions` folder) contains a file for each user type and the actions they can perform.

#### User Types

There are three types of user (or roles) that use the Crocodile app. The first is a *public user* that isn't logged into the system. They can query crocodiles, but can't create, update or delete them. The second are *crocodile owners* who can log in and create, read and update crocodiles. The third are *admin* users who can create other users. The admin users don't need to log in, as this is just a dummy app.

### tests folder

This is where you create your performance tests using the modules from the rest of the framework. `actions` are never called directly, but always through the 'role' performing them (see the `actions` folder above).


## Checking your Code

`yarn check-types` and `yarn check-types:watch`

## Building your Code

webpack and babel

## Running your Code

Docker - say and link to windows.






