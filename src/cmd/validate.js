import ajv from 'ajv'


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


export default function validate (metadata) {
  const valid = ajv.validate(schema, metadata)
  return valid || ajv.errors
}
