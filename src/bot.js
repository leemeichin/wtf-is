import 'babel-polyfill'
import {slackTemplate} from 'claudia-bot-builder'
import GithubApi from 'github'
import yaml from 'js-yaml'
import Format from './format'
import cmd, {validate, create as createMetadataAttachment} from './cmd'

export default class Bot {
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

    this.gh.authenticate({type: 'token', token: this.token})
  }

  async slackBot (req) {
    let [repo, flag] = req.text.split(' ')
    repo = repo.split('/')

    this.repo = repo[0]
    this.owner = this.org

    if (repo.length === 2) {
      this.owner = repo[0]
      this.repo = repo[1]
    }

    try {
      this.repoInfo = await this.getRepoInfo()
    } catch (err) {
      if (err.code == 404) {
        return this.hiddenMessage("Woops, that repo doesn't exist!").get()
      } else {
        return err.message
      }
    }

    if (cmd.mustValidate(flag)) {
      return this.performValidation()
    }

    if (cmd.mustCreate(flag)) {
      try {
        const attachment = await createMetadataAttachment()

        const msg = [
          'Wow, nice one! Add this file to your repo, tweak it, and off you go!',
          `<https://github.com/${this.owner}/${this.repo}/new/master?filename=.${this.owner}.yml|Open this file in GitHub!>`
        ].join('\n')

        return this.hiddenMessage(msg)
          .addAttachment()
          .addTitle(`.${this.owner}.yml`)
          .addText('```\n' + attachment + '\n```')
          .get()
      } catch (err) {
        return err.message
      }
    }

    try {
      this.metadata = await this.getRepoMetadata()
    } catch (err) {
      if (err.code == 404) {
        const msg = this.buildBasicMessage()
        return this.channelMessage(msg).get()
      } else {
        return err.message
      }
    }

    const msg = this.buildMessage()
    return this.channelMessage(msg).get()
  }

  buildMessage () {
    const formatter = new Format(this.repoInfo, this.metadata)

    return [
      formatter.name(),
      formatter.description(),
      formatter.siteUrls(),
      formatter.team(),
      formatter.deployment(),
      formatter.docs(),
      formatter.deps()
    ].filter(line => line).join('\n')
  }

  buildBasicMessage () {
    const formatter = new Format(this.repoInfo)

    return [
      formatter.repoName(),
      formatter.repoDescription(),
      formatter.siteUrls()
    ].join('\n')
  }

  async getRepoMetadata () {
    let metadata = await this.gh.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: `.${this.owner}.yml`,
      headers: {
        Accept: 'application/vnd.github.v3.raw'
      }
    })

    return yaml.safeLoad(metadata.data)
  }

  async getRepoInfo () {
    const repoInfo = await this.gh.repos.get({owner: this.owner, repo: this.repo})
    return repoInfo.data
  }

  performValidation (metadata) {
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

  channelMessage(text) {
    return new slackTemplate(text).channelMessage(true)
  }

  hiddenMessage(text) {
    return new slackTemplate(text).channelMessage(false)
  }
}
