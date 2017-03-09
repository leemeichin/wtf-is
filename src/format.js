export default class Format {

  constructor (repo, metadata) {
    this.repo = repo
    this.metadata = metadata
  }

  get separator () {
    return '\n--------\n'
  }


  repoName () {
    return `*${this.repo.name}*`
  }

  repoDescription () {
    return `_${this.repo.description}_`
  }

  name () {
    return `*${this.metadata.name || this.repo.name}*`
  }

  description () {
    return `_${this.metadata.description || this.repo.description}_`
  }

  siteUrls () {
    if (this.metadata && this.metadata.service_url) {
      return `${this.metadata.service_url} | ${this.repo.html_url}`
    } else if (this.repo.homepage) {
      return `${this.repo.homepage} | ${this.repo.html_url}`
    } else {
      return `${this.repo.html_url}`
    }
  }

  team () {
    const {name, slack_channel} = this.metadata.team

    return `Team: ${name} (#${slack_channel}) :yeah:`
  }

  deployment () {
    const {ci_url, deploy_url} = this.metadata

    if (ci_url && deploy_url) {
      return [this.separator, `CI: ${ci_url}`, `Deploy: ${deploy_url}`].join('\n')
    }
  }

  docs () {
    const {docs} = this.metadata

    if (docs) {
      const links = docs.map(doc => {
        if (doc.title) {
          return `<${doc.url}|${doc.title}>`
        } else {
          return doc.url
        }
      })

      return [this.separator, 'Docs:', ...links].join('\n')
    }
  }

  deps () {
    const {dependencies: deps} = this.metadata

    if (deps) {
      const links = deps.map(dep => `<${dep.url}|${dep.name}>`)
      return [this.separator, 'Dependencies:', ...links].join('\n')
    }
  }
}
