var botBuilder = require('claudia-bot-builder')
var GithubApi = require('github')
var yaml = require('js-yaml')

var slackTemplate = botBuilder.slackTemplate

var gh = new GithubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'leemachin/wtf-is (slack)'
  }
})

var separator = '\n------\n'

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
    gh.repos.getContent({
      owner: owner,
      repo: name,
      path: '.typeform.yml',
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })
  ])
    .then(function (res) {
      var repo = res[0]
      var meta = yaml.safeLoad(res[1].content)

      return new slackTemplate([
        '*' + (meta.name || repo.name) + '*',
        '_' + (meta.description || repo.description) + '_',
        meta.service_url + ' | ' + repo.html_url,
        'Owners: ' + meta.owners + ' (' + meta.slack_channel + ')',
        separator,
        'CI: ' + meta.ci_url,
        'Jenkins: ' + meta.jenkins_view_url,
        separator,
        'Docs:',
        meta.docs.join('\n'),
        separator,
        meta.dependencies.join('\n')
      ].join('\n')).channelMessage(true).get()
    })
    .catch(function (err) {
      return err.message
    })
})
