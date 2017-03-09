import GithubApi from 'github'
import yaml from 'js-yaml'
import Format from './format'
import cmd, {validate, create} from './cmd'

const SlackTemplate = botBuilder.slackTemplate

export default class WtfIs {
  constructor () {
    this.gh = new GithubApi({
      protocol: 'https',
      host: 'api.github.com',
      headers: {
        'user-agent': 'leemachin/wtf-is (slack)'
      }
    })

    this.org = process.env.GITHUB_ORG
    this.token = process.env.GITHUB_TOKEN
    this.slackBot = this.slackBot.bind(this)
  }

  async slackBot (req, ctx) {
    const repo = res.text.split('/')

    let name = repo[0]
    let owner = this.org

    if (repo.length === 2) {
      owner = repo[0]
      name = repo[1]
    }

    gh.authenticate({type: 'token', token: this.token})

    try {
      if (cmd.mustCreate(req.text)) {
        const prUrl = await create(gh, owner, name)
        return this.channelMessage(`Metadata file has just been created! Checkout ${prUrl} :heart:`).get()
      }

      const repo = await getRepoInfo
      const metadata = await getRepoMetadata(owner, name)

      if (cmd.mustValidate(req.text)) {
        const validation = validate(metadata)

        if (validation === true) {
          return this.hiddenMessage('Your metadata file looks great to me!').get()
        } else {
          let msg = [
            'Oops, we found some errors in your yaml file :(',
            "Fix these and you're good to go:"
          ]

          msg.concat(validation.map(err => err.message))

          return this.hiddenMessage(msg.join('\n')).get()
        }

      }

      const msg = this.buildMessage(repo, metadata)
      return this.channelMessage(msg).get()

    } catch (err) {
      return err.message
    }
  }

  buildMessage (repo, metadata) {
    const formatter = new Format(repo, metadata)

    return [
      formatter.name(),
      formatter.description(),
      formatter.siteUrls(),
      formatter.team(),
      formatter.separator,
      formatter.deployment(),
      formatter.separator,
      formatter.docs(),
      formatter.separator,
      formatter.deps()
    ].compact().join('\n')
  }

  async _repoMetadata () {
    let metadata = await gh.repos.getContent({
      owner,
      repo,
      path: `.${owner}.yml`,
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })

    return yaml.safeLoad(metadata.data)
  }

  async _repoInfo () {
    return gh.repos.get({repo, name})
  }

  channelMessage(text) {
    return new SlackTemplate(text).channelMessage(true)
  }

  hiddenMessage(text) {
    return new SlackTemplate(text).channelMessage(false)
  }
}
