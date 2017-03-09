import 'babel-polyfill'

import {readFile} from 'mz/fs'
import {resolve} from 'path'

export default async function create() {
  let content = await readFile(resolve(__dirname, '../../metadata.reference.yml'))
  return content.toString()
}
