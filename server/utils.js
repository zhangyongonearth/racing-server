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
 * [{q:'',a:''}]
 */
function readQuestionLib(filePath) {
  const ret = []
  const fs = require('fs')
  const questionLibString = fs.readFileSync(filePath, 'utf-8')// .toString()
  questionLibString.split(/[\r\n]+[\r\n]+[\r\n]+/).map((oneQuestion) => {
    if (oneQuestion.trim() !== '') {
      ret.push({ q: oneQuestion.substr(0, oneQuestion.length - 2).replace(/[\r\n]/g, '<br/>'), a: oneQuestion.substr(oneQuestion.length - 1) })
    }
  })
  console.log(ret)
  return ret
}

/**
 * 生成N个M位不同的随机数
 */
function getRandom(m, n) {
  const ret = []
  if (!n) n = 1
  while (ret.length < n) {
    const tmp = Math.ceil(Math.random() * Math.pow(10, m)).toString()
    if (ret.indexOf(tmp) === -1) {
      ret.push(tmp)
    }
  }
  if (ret.length === 1) {
    return ret[0]
  } else {
    return ret.sort(function(a, b) { return a > b })
  }
}

module.exports = { readQuestionLib, getRandom, getUrlParam }
