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

module.exports = botBuilder(function (name, apiReq) {
  gh.authenticate({
    type: 'token',
    token: env.GITHUB_TOKEN
  })

  return Promise.all(
    [
      gh.repos.get({
        owner: 'typeform',
        repo: name
      }),
      gh.repos.getReadme({
        owner: 'typeform',
        repo: name,
        headers: {
          'Accept': 'application/vnd.github.VERSION.raw'
        }
      })
    ])
    .then(function (repo, readme) {
      var msg = [
        repo.name,
        repo.description,
        repo.html_url,
        '```',
        readme,
        '```',
        ':yeah:'
      ]

      return msg.join('\n')
    })
    .catch(function (err) {
      return err + ':sadpanda: :facepalm:'
    })
})
