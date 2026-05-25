#!/bin/bash

npm install --legacy-peer-deps --silent

npm run build

npm run start:dev

# npm run start:prod