#!/bin/sh
# NODE_ENV=production nodejs manual_update.js & NODE_ENV=development nodejs manual_update.js & NODE_ENV=testing nodejs manual_update.js
NODE_ENV=production nodejs updUsrPerm.js & NODE_ENV=development nodejs updUsrPerm.js & NODE_ENV=testing nodejs updUsrPerm.js