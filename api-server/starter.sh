#!/bin/sh
NODE_ENV=production PORT=3001 forever start bin/www
NODE_ENV=development PORT=3002 forever start bin/www
forever start proxy.js