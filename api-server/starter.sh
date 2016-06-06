#!/bin/sh
# npm install
forever stopall
NODE_ENV=production PORT=8000 forever start bin/www;
NODE_ENV=testing PORT=8001 forever start bin/www;
NODE_ENV=development PORT=8002 forever start bin/www;
forever start proxy.js
forever list