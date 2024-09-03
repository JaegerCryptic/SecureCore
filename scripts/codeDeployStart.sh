#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
node -e "console.log('Running Node.js ' + process.version)"
npm -v
arrNAME=(${APPLICATION_NAME//_/ })

ENVIRONMENT=${arrNAME[0]}
SERVICE_NAME=${arrNAME[1]}
echo "ENVIRONMENT: $ENVIRONMENT"
echo "SERVICE_NAME: $SERVICE_NAME"

cd /home/ubuntu
nvm use 16
pm2 start --output /dev/null --error /dev/null --name GALACTOSE src/server.js
