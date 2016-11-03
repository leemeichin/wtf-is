var botBuilder = require('claudia-bot-builder')
var GithubApi = require('github')

var env = require('process').env

var gh = new GithubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'github-repo-search-slack'
  }
})

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
    })
  ])
    .then(function (res) {
      var repo = res[0]
      var readme = res[1]

      var msg = [
        '*' + repo.name + '*',
        '_' + repo.description + '_',
        repo.html_url
      ]

      return msg.join('\n')
    })
    .catch(function (err) {
      return err.message
    })
})
