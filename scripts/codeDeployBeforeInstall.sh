sudo apt install curl
sudo apt install gcc g++
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install --lts 16
node -e "console.log('Running Node.js ' + process.version)"
npm -v
nvm use 16
npm install pm2@latest -g
