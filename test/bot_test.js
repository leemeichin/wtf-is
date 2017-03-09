import cmd, {validate, create} from '../src/cmd'
import Bot from '../src/bot'

import yaml from 'js-yaml'
import sepia from 'sepia'
import sinon from 'sinon'
import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {readFileSync} from 'fs'
import {resolve} from 'path'

chai.use(chaiAsPromised)

sepia.configure({
  includeHeaderNames: false,
  includeCookieNames: false
})

sepia.fixtureDir(resolve(__dirname, 'fixtures/vcr_cassettes'))

const bot = new Bot()

const schema = readFileSync(`${__dirname}/../metadata.reference.yml`)

function fixture (name, kind) {
  const file = readFileSync(resolve(__dirname, 'fixtures', `${name}.${kind}`))

  if (kind === 'yml') {
    return yaml.safeLoad(file)
  } else {
    return JSON.parse(file)
  }
}

describe('Validating a metadata file against the schema', () => {
  it('should explain the errors when the file does not match the spec', () => {
    const invalidMeta = fixture('invalid_metadata', 'yml')
    const errors = validate(invalidMeta)

    const messages = [
      `should have required property 'deploy_url'`,
      `should have required property 'ci_url'`,
      `should match format "uri"`,
      `should have required property 'team'`
    ]

    assert.deepEqual(errors.map(err => err.message), messages)
  })

  it('should report that the file is all good when there are no errors', () => {
    const validMeta = fixture('valid_metadata', 'yml')
    assert.isOk(validate(validMeta))
  })
})

describe('Creating a new metadata file from the reference', () => {
  xit('should create a file and open it up a PR on github', async (done) => {
    try {
      const prUrl = await create(bot.gh, 'leemachin', 'wtf-is')
    } catch (e) {
      console.log(e)
    }
  })
})

describe('Describing a github repo with no metadata yaml', () => {
  it('should just show the name of the repo, the description, and its URL', async () => {
    try {
      const {text} = await bot.slackBot({text: 'leemachin/ask_awesomely'})

      assert.match(text, /ask_awesomely/)
      assert.match(text, /https:\/\/github.com\/leemachin\/ask_awesomely/)
      assert.match(text, /Build Typeforms awesomely\. In Ruby\./)
    } catch (err) {
      return err
    }
  })
})

describe('Describing a github repo with a metadata yaml', () => {
  xit('shows all the extra data from the yaml file', async () => {
    try {
      const {text} = await bot.slackBot({text: 'leemachin/wtf-is'})
    } catch (err) {
      return err
    }
  })
})
