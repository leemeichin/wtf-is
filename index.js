var botBuilder = require('claudia-bot-builder')
var GithubApi = require('github')
var yaml = require('js-yaml')
var validator = require('ajv')

var slackTemplate = botBuilder.slackTemplate

var gh = new GithubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'leemachin/wtf-is (slack)'
  }
})

var schema = {
  team: {
    type: 'object',
    required: true,
    properties: {
      name: { type: 'string' },
      slack_channel: { type: 'string' }
    }
  },
  deploy_url: {
    type: 'url',
    required: true
  },
  ci_url: {
    type: 'url',
    required: true
  },
  name: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  service_url: {
    type: 'url',
    required: false
  },
  docs: {
    type: 'array',
    required: false,
    properties: {
      title: { type: 'string', required: false },
      url: { type: 'url' }
    }
  },
  dependencies: {
    type: 'object',
    required: false,
    properties: {
      name: { type: 'string' },
      url: { type: 'url' }
    }
  },
  ports: {
    type: 'object',
    required: false
  },
  infrastructure: {
    type: 'object',
    required: false
  },
  aws: {
    type: 'object',
    required: false

  },
  metrics: {
    type: 'object',
    required: false

  }
}

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

  if (/--validate/.test(res.text)) {

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
        path: '.' + owner + '.yml',
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
          '*' + (meta.name || repo.name) + '*',
          '_' + (meta.description || repo.description) + '_',
          (meta.service_url ? meta.service_url + ' | ' : '') + repo.html_url,
          'Team: ' + meta.team.name + ' (' + meta.team.slack_channel + ') :yeah:'
        )

        if (meta.ci_url && meta.deploy_url) {
          msg.push(
            separator,
            'CI: ' + meta.ci_url,
            'Deploy: ' + meta.deploy_url
          )
        }

        if (meta.docs) {
          msg.push(separator, 'Docs:')

          docs.forEach(function (doc) {
            if (doc.title) {
              msg.push('<' + doc.url + '|' + doc.title + '>')
            } else {
              msg.push(doc.url)
            }
          })
        }

        if (meta.dependencies) {
          msg.push(separator, 'Dependencies:')

          for (var dep in dependencies) {
            msg.push('<' + dep.url + '|' + dep.name + '>')
          }
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
