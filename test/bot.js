import {WtfIs} from '../src/bot'
import context from 'aws-lambda-mock-context'
import sinon from 'sinon'
import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

describe('Validating a metadata file against the schema', () => {
  it('should explain the errors when the file does not match the spec', () => {

  })

  it('should report that the file is all good when there are no errors', () => {

  })
})

describe('Creating a new metadata file from the reference', () => {
  it('should return the reference file so the user can copy it', () => {

  })
})

describe('Describing a github repo with no metadata yaml', () => {
  it('should just show the name of the repo, the description, and its URL', () => {

  })
})

describe('Describing a github repo with a metadata yaml', () => {
  it('shows the name and description', () => {

  })

  it('shows a link to the service', () => {

  })

  it('shows links to dependent services', () => {

  })

  describe('showing the documentation links', () => {
    it('shows pretty URLs for slack when there is a title', () => {

    })

    it('shows a raw URL when there is no title', () => {

    })
  })
})
