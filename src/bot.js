import 'babel-polyfill'
import GithubApi from 'github'
import yaml from 'js-yaml'
import Format from './format'
import cmd, {validate, create} from './cmd'

export default class Bot {
  constructor (slackTemplate) {
    this.gh = new GithubApi({
      protocol: 'https',
      host: 'api.github.com',
      headers: {
        'user-agent': 'leemachin/wtf-is (slack)'
      }
    })

    this.SlackTemplate = slackTemplate
    this.org = process.env.GITHUB_ORG
    this.token = process.env.GITHUB_TOKEN
    this.slackBot = this.slackBot.bind(this)

  }

  async slackBot (req, ctx) {
    this.gh.authenticate({type: 'token', token: this.token})

    const repo = req.text.split('/')

    let name = repo[0]
    let owner = this.org

    if (repo.length === 2) {
      owner = repo[0]
      name = repo[1]
    }

    try {
      if (cmd.mustCreate(req.text)) {
        return this.performCreation(owner, name)
      }

      const repo = await this.repoInfo()
      const metadata = await this.repoMetadata(owner, name)

      if (cmd.mustValidate(req.text)) {
        return this.performValidation(metadata)
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

  async repoMetadata (owner, name) {
    let metadata = await this.gh.repos.getContent({
      owner,
      repo,
      path: `.${owner}.yml`,
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })

    return yaml.safeLoad(metadata.data)
  }

  async repoInfo () {
    return this.gh.repos.get({repo, name})
  }

  performValidation () {
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

  async performCreation () {
    const prUrl = await create(this.gh, owner, name)
    return this.channelMessage(`Metadata file has just been created! Checkout ${prUrl} :heart:`).get()
  }

  channelMessage(text) {
    return new this.SlackTemplate(text).channelMessage(true)
  }

  hiddenMessage(text) {
    return new this.SlackTemplate(text).channelMessage(false)
  }
}
