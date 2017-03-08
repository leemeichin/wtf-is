import 'babel-polyfill'
import botBuilder from 'claudia-bot-builder'
import GithubApi from 'github'
import yaml from 'js-yaml'
import Format from './format'
import cmd, {validate, create} from './cmd'

const SlackTemplate = botBuilder.slackTemplate

export class WtfIs {
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

    if (cmd.mustCreate(req.text)) {
      return create(gh)
    }

    try {
      const repo = await getRepoInfo
      const metadata = await getRepoMetadata(owner, name)
      if (cmd.mustValidate(req.text)) {
        return validate(metadata)
      }

      const msg = this.buildMessage(repo, metadata)
      return new SlackTemplate(msg).channelMessage(true).get()

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
}

export default botBuilder(new WtfIs().slackBot)
