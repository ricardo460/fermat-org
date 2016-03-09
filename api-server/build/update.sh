#!/bin/sh
NODE_ENV=production nodejs manual_update.js & NODE_ENV=development nodejs manual_update.js