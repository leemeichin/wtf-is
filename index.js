var botBuilder = require('claudia-bot-builder')
var GithubApi = require('github')

var symbols = {
  pending: ':white_circle:',
  success: ':white_check_mark:',
  error: ':boom:',
  failure: ':red_circle:'
}

var gh = new GithubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'github-repo-search-slack'
  }
})


// Allow build status symbols to be customised
function symbolFor (env, status) {
  var envStatus = 'symbol_' + status

  return env[envStatus] || symbols[status]
}

module.exports = botBuilder(function (res, apiReq) {
  var repo = res.text.split('/')
  var name = repo[0]
  var owner = apiReq.env.githubOrg

  if (repo.length === 2) {
    owner = repo[0]
    name = repo[1]
  }

  gh.authenticate({
    type: 'token',
    token: apiReq.env.githubToken
  })

  return Promise.all([
    gh.repos.get({
      owner: owner,
      repo: name
    }),
    gh.repos.getCombinedStatus({
      owner: owner,
      repo: name,
      ref: 'heads/master'
    })
  ])
    .then(function (res) {
      var repo = res[0]
      var combinedStatus = res[1]
      var state = combinedStatus.state + ' ' + symbolFor(apiReq.env, combinedStatus.state)
      var msg = [
        '*' + repo.name + '*',
        '_' + repo.description + '_',
        repo.html_url,
        '',
        'Build status: ' + state
      ]

      return msg.join('\n')
    })
    .catch(function (err) {
      return err.message
    })
})
