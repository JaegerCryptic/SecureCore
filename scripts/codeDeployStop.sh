export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
node -e "console.log('Running Node.js ' + process.version)"
npm -v
pm2 delete all