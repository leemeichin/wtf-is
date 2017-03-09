import botBuilder from 'claudia-bot-builder'
import WtfIs from './wtfis'


const slackTemplate = botBuilder.slackTemplate

module.exports = botBuilder(new WtfIs(slackTemplate).slackBot)
