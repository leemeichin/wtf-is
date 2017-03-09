import 'babel-polyfill'
import botBuilder from 'claudia-bot-builder'
import WtfIs from './wtfis'



export default botBuilder(new WtfIs().slackBot)
