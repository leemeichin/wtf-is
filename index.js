import botBuilder from 'claudia-bot-builder'
import Bot from './lib/bot'


module.exports = botBuilder(new Bot().slackBot)
