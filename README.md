# WTF Is ... ?

Suppose you work with lots of microservices with funky codenames and you can't remember what on earth zozzfozzle-encoder actually is.

Suppose you also work somewhere that loves Slack or other bot-supported chat apps!

Well, look no further!

## WTF is 'WTF Is'?

It's a small service that, when connected to Slack or your chat platform of choice, takes the name of a repository and gives back some useful information. For example:

```
/wtfi zozzfozzle-encoder
```

> *zozzfozzle-encoder*
>
> _Encodes Zozzfozzles in a variety of formats, such as PowerPoint, CSV and PNG._
>
> https://github.com/zozzfozzle/zozzfozzle-encoder


You can also use this to find info for any *other* repo at a glance, like so:

```
/wtfi facebook/react
```

![What it looks like in Slack](example.png)

### Installation

You'll need an AWS account so you can start making lambda functions. The documentation for [Claudia JS](https://claudiajs.com) tells you how to set things up, until I've added some scripts to make it easier.

Once you've installed that, you'll have to go to Slack or Telegram or whatever platform is supported to connect things up.

You will also need to add two *`stage variables`* to your lambda function:

- `githubToken` - this is a user token that has access to you or your org's private repos
- `githubOrg` - your own username or that of your org, which is how the bot knows where to look for your services.


### Nice to Have

- Support GitLab and Bitbucket
