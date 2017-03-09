import 'babel-polyfill'

import {readFile} from 'mz/fs'
import {resolve} from 'path'

export default async function create(gh, owner, repo) {
  let content = await readFile(resolve(__dirname, '../../metadata.reference.yml'))

  const file = await gh.repos.createFile({
    owner,
    repo,
    content: content.toString('base64'),
    path: `${owner}.yml`,
    message: 'Add the wtf-is metadata reference, ready for customisation'
  })

  const pullRequest = await gh.pullRequests.create({
    owner,
    repo,
    head: 'heads/wtf-is_metadata_create',
    base: 'heads/master',
    maintainer_can_modify: true,
    title: 'Add wtf-is bot metadata file',
    body: 'This allows the bot to display more info to users of the Slack bot. See [wtf-is](https://github.com/leemachin/wtf-is) for more info.'
  })

  return pullRequest.html_url
}
