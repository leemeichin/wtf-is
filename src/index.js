import botBuilder from 'claudia-bot-builder'
import GithubApi from 'github'
import yaml from 'js-yaml'
import Format from './format'
import cmd, {validate, create} from './cmd'

const SlackTemplate = botBuilder.slackTemplate

const gh = new GithubApi({
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'leemachin/wtf-is (slack)'
  }
})

async function getRepoMetadata (repo, name) {
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

async function getRepoInfo (repo, name) {
  return gh.repos.get({repo, name})
}

export default botBuilder(async (req, ctx) => {
  if (req.text === 'caio') {
    return new SlackTemplate('@caio http://i.giphy.com/U3POwAL4KLDbi.gif :yeah:')
      .channelMessage(true)
      .get()
  }

  const repo = res.text.split('/')

  let name = repo[0]
  let owner = process.env.GITHUB_ORG

  if (repo.length === 2) {
    owner = repo[0]
    name = repo[1]
  }

  gh.authenticate({type: 'token', token: process.env.GITHUB_TOKEN})

  if (cmd.mustValidate(req.text)) {
    return validate(metadata)
  }

  if (cmd.mustCreate(req.text)) {
    return create(gh)
  }

  try {
    const repo = await getRepoInfo
    const metadata = await getRepoMetadata(owner, name)
    const format = new Format(repo, metadata)


    let msg = [
      format.name(),
      format.description(),
      format.siteUrls(),
      format.team(),
      format.separator,
      format.deployment(),
      format.separator,
      format.docs(),
      format.separator,
      format.deps()
    ].compact().join('\n')

    return new SlackTemplate(msg).channelMessage(true).get()

  } catch (err) {
    return err.message
  }
})
