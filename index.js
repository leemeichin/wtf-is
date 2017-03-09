import botBuilder from 'claudia-bot-builder'
import Bot from './lib/bot'


const slackTemplate = botBuilder.slackTemplate

module.exports = botBuilder(new Bot(slackTemplate).slackBot)
