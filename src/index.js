import botBuilder from 'claudia-bot-builder'
import Bot from './bot'


const slackTemplate = botBuilder.slackTemplate

module.exports = botBuilder(new Bot(slackTemplate).slackBot)
