/* globals before: false, describe: false, expect: false, it: false */

'use strict'

import path from 'path'

import Print, {print as printProxy} from '../src/'
import {application} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'

const renderPageTimeout = 30000
  // PhantomJS seems to take about 20 sec to launch, so this doesn't seem excessive

function pathMatcher(folder, type) {
  let pathRE = new RegExp('^' + folder.replace('.', '\\.') + '.*\\.' + type + '$')
  return str => pathRE.test(str)
}

async function renderMediaPrintTest(req, res) {
  res.send(await templater.render('media-print-test', {}))
}

describe("Print Module", () => {
  let assetPath = path.resolve(process.cwd(), '.tmp/print')

  before(() => {
    router.staticRoute('/render', 'test/pages')
    router.route('/render/media-print-test', renderMediaPrintTest)
    templater.templateDir('test/partials')
    templater.template('test/templates/media-print-test.ejs', 'render')

    // TO DO do we really need to be doing this startup "by hand" here?
    new Print(application)
    application.start()
    return new Promise((resolve, reject) => {
      application.onceAfter('launch', () => { resolve() })
    })
  })

  describe("Load", () => {
    it("should not be null", () => { expect(Print).to.exist })
    it("should be instantiated", () => { expect(printProxy).to.exist })
  })

  describe("Simple render", () => {
    it("should render to PDF", async function () {
      this.timeout(renderPageTimeout)
      let status = await printProxy.renderPage('/render/hello-world.html', {type: 'pdf'})
      expect(status).to.be.a('string')
      expect(status).to.satisfy(pathMatcher(assetPath, 'pdf'))
    })
    it("should render to PNG", async function () {
      this.timeout(renderPageTimeout)
      let status = await printProxy.renderPage('/render/hello-world.html', {type: 'png'})
      expect(status).to.be.a('string')
      expect(status).to.satisfy(pathMatcher(assetPath, 'png'))
    })
  })

  describe("Template render", () => {
    it("should render to PDF", async function () {
      this.timeout(renderPageTimeout)
      let status = await printProxy.renderPage('/render/media-print-test', {type: 'pdf', webshot: {errorIfJSException: true}})
      expect(status).to.be.a('string')
      expect(status).to.satisfy(pathMatcher(assetPath, 'pdf'))
    })
    it("should render to PNG", async function () {
      this.timeout(renderPageTimeout)
      let status = await printProxy.renderPage('/render/media-print-test', {type: 'png'})
      expect(status).to.be.a('string')
      expect(status).to.satisfy(pathMatcher(assetPath, 'png'))
    })
  })

})
