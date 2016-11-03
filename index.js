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
  var name = res.text

  gh.authenticate({
    type: 'token',
    token: apiReq.env.githubToken
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
    .then(function (res) {
      var repo = res[0]
      var readme = res[1]

      var msg = [
        '*' + repo.name + '*',
        '_' + repo.description + '_',
        repo.html_url,
        '```',
        readme.content,
        '```',
        ':yeah:'
      ]

      return msg.join('\n')
    })
    .catch(function (err) {
      return err + ':sadpanda: :facepalm:'
    })
})
