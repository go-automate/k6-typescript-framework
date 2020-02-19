#! /bin/bash

docker-compose run --rm k6 run /scripts/sampleTest.bundle.js # --http-debug="full"