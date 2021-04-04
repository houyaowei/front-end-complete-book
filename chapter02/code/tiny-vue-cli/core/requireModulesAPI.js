 /**
  * 导入需要提示的模块，有babel,router, vuex ,linter
  */
 class RequiredModuleAPI {
  constructor(creator) {
      this.creator = creator
  }

  injectFeature(feature) {
      this.creator.featurePrompt.choices.push(feature)
  }

  injectPrompt(prompt) {
      this.creator.injectedPrompts.push(prompt)
  }
}
module.exports = RequiredModuleAPI