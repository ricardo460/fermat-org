#!/bin/sh
npm install
NODE_ENV=production nodejs manual_update.js
NODE_ENV=development nodejs manual_update.js
forever stopall
NODE_ENV=production PORT=3001 forever start bin/www
NODE_ENV=development PORT=3002 forever start bin/www
forever start proxy.js