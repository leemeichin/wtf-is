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
  if (res.text === 'caio') {
    return new slackTemplate('@caio http://i.giphy.com/U3POwAL4KLDbi.gif :yeah:')
      .channelMessage(true)
      .get()
  }

  var repo = res.text.split('/')
  var name = repo[0]
  var owner = process.env.GITHUB_ORG
  var findMetaYaml = true

  if (repo.length === 2) {
    owner = repo[0]
    name = repo[1]
    findMetaYaml = false
  }

  gh.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN
  })

  var requests = [
    gh.repos.get({owner: owner, repo: name})
  ]

  if (findMetaYaml) {
    requests.push(
      gh.repos.getContent({
        owner: owner,
        repo: name,
        path: '.typeform.yml',
        headers: {
          Accept: 'application/vnd.github.v3.raw'
        }
      })
    )
  }

  return Promise.all(requests)
    .then(function (res) {
      var repo = res[0]

      var msg = []

      if (findMetaYaml) {
        var meta = yaml.safeLoad(res[1].data)

        msg.push(
          meta.service_url + ' | ' + repo.html_url,
          'Team: ' + meta.team.name + ' (' + meta.team.slack_channel + ') :yeah:'
        )

        if (meta.ci && meta.deploy) {
          meta.push(
            separator,
            'CI: ' + meta.ci_url,
            'Deploy: ' + meta.deploy_url
          )
        }

        if (meta.docs) {
          msg.push(
            separator,
            'Docs:',
            meta.docs.join('\n')
          )
        }

        if (meta.dependencies) {
          msg.push(
            separator,
            'Dependencies:',
            meta.dependencies.join('\n')
          )
        }
      } else {
        msg.push(
          '*' + repo.name + '*',
          '_' + repo.description + '_',
          repo.html_url
        )
      }

      return new slackTemplate(msg.join('\n')).channelMessage(true).get()
    })
    .catch(function (err) {
      return err.message
    })
})
