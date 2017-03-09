import Ajv from 'ajv'

const schema = {
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    deploy_url: { type: 'string', format: 'uri' },
    ci_url: { type: 'string', format: 'uri' },
    service_url: { type: 'string', format: 'uri' },
    team: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        slack_channel: { type: 'string' }
      }
    },
    docs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string', format: 'uri' }
        },
        required: ['url']
      }
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string', format: 'uri' }
        }
      },
      required: ['name', 'url']
    },
    ports: {
      type: 'object'
    },
    infrastructure: {
      type: 'object'
    },
    aws: {
      type: 'object'
    },
    metrics: {
      type: 'object'
    }
  },
  required: ['team', 'deploy_url', 'ci_url']
}


export default function validate (metadata) {
  const ajv = new Ajv({allErrors: true})
  return !!ajv.validate(schema, metadata) || ajv.errors
}
