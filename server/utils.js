function getUrlParam(urlQuery) {
  const queryString = require('query-string')
  console.log(urlQuery)
  if (urlQuery.indexOf('?') !== -1) {
    urlQuery = urlQuery.split('?')[1]
  }
  const parsed = queryString.parse(urlQuery)
  console.log(parsed)
  return parsed
}
/**
 * 读题
 * 从md文件中读取题目，存入数组，每次获取的时候pop一个
 * [{q:'',a:'',s:2}]
 */
function readQuestionLib() {
  const marked = require('marked')

  // const showdown = require('showdown')
  const fs = require('fs')
  const questionLibString = fs.readFileSync('./server/questionLib.md').toString()
  // const questionLibHtml = (new showdown.Converter()).makeHtml(questionLibString)
  const questionLibHtml = marked.parse(questionLibString, { headerIds: false })
  const questionLibArray = questionLibHtml.split('<h1>1</h1>')

  return questionLibArray
}
const questionLib = readQuestionLib()
/**
 * 生成N个M位不同的随机数
 */
function getRandom(m, n) {
  const ret = []
  if (!n) n = 1
  while (ret.length < n) {
    const tmp = Math.ceil(Math.random() * Math.pow(10, m))
    if (ret.indexOf(tmp) === -1) {
      ret.push(tmp)
    }
  }
  if (ret.length === 1) {
    return ret[0]
  } else {
    return ret
  }
}

module.exports = { questionLib, getRandom, getUrlParam }
