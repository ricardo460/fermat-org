#!/bin/sh
# npm install
forever stopall
NODE_ENV=production PORT=8080 forever start /home/ubuntu/fermat-org/api-server/bin/www
NODE_ENV=development PORT=8081 forever start /home/ubuntu/fermat-org/api-server/bin/www
forever start /home/ubuntu/fermat-org/api-server/proxy.js
forever list