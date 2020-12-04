const http = require('http');
const createHandler = require('github-webhook-handler');
const handler = createHandler({ path: '/webhook', secret: 'chrimesdevelopment' });
const chalk = require('chalk');
const simpleGit = require('simple-git');
const fs = require('fs-extra');

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777);

handler.on('error', function (err) {
  console.error('Error:', err.message)
});

handler.on('repository', function (event) {
  const action = event.payload.action;
  const repositoryName = event.payload.repository.name;
  const repositoryCloneURL = event.payload.repository.clone_url;
  const userLogin = event.payload.sender.login;
  const userProfile = event.payload.sender.html_url;
  
  if(action == 'created' && repositoryName.includes('-prototype')) {
    console.log(chalk.magenta(`🏁 ${repositoryName} created by ${userLogin} (${userProfile})`));
    copyPrototypeKit(`${repositoryName}`, `${repositoryCloneURL}`);
    /*  
    console.log(chalk.blue('🚀 Deploying Azure Web App...'));
    console.log(chalk.yellow('🔐 Setting username and password...'));
    console.log(chalk.green(`🎉 Prototype deployed to: https://${repositoryName}.azurewebsites.net`));
    console.log(chalk.green(`💻 Clone the repository with the URL: ${repositoryCloneURL}`)); 
    */
  }
});

async function copyPrototypeKit(name, repoURL) {
  console.log(chalk.white('⏬ Setting up the NHS.UK prototype kit...'));

  fs.copySync('./repos/nhsuk-prototype-kit', `./repos/${name}`)

  setTimeout( function(){
    const git = simpleGit(`./repos/${name}`, { binary: 'git' });

    git.init()
      .then(() => git.addRemote('origin', `${repoURL}`))
      .then(() => git.checkoutLocalBranch('main'))
      .then(() => git.add('*'))
      .then(() => git.commit(':tada: initial commit by NHS.UK prototype kit setup'))
      .then(() => git.push('origin', `main`))
      .catch(error => {
        console.error('onRejected function called: ' + error.message);
      })
      .then(() => {
        console.log(chalk.green('✅ NHS.UK prototype kit setup complete!'));
      });
  }, 1500 );
}
