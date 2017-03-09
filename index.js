import botBuilder from 'claudia-bot-builder'
import Bot from './src/bot'


const slackTemplate = botBuilder.slackTemplate

module.exports = botBuilder(new Bot(slackTemplate).slackBot)
