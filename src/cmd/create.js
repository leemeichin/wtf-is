import 'babel-polyfill'

import {readFile} from 'mz/fs'
import {resolve} from 'path'

export default async function create(gh, owner, repo) {
  const content = await readFile(resolve(__dirname, '../../metadata.reference.yml'))

  await gh.repos.createFile({
    owner,
    repo,
    path: `.${owner}.yml`,
    branch: 'wtf-is_metadata_create',
    content: Buffer.from(content).toString('base64'),
    committer: 'leemachin/wtf-is'
  })

  const response = await gh.pullRequests.create({
    owner,
    repo,
    head: 'wtf-is_metadata_create',
    base: 'master',
    maintainer_can_modify: true,
    title: 'Add wtf-is bot metadata file',
    content: 'This allows the bot to display more info to users of the Slack bot. See [wtf-is](https://github.com/leemachin/wtf-is) for more info.'
  })

  return response.html_url
}
