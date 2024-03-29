/**
 * nodejs 本身支持commonJS规范，使用require和module.exports=
 */
/**
 * 修改config、serverData，clientState
 * 在onmessage事件中直接send以上某个对象
 * 在前端onmessage事件中，直接使用resp.data覆盖vue data的值
 * endRace中，将所有答案记录保存进文件中
 */
const path = require('path')
const { readQuestionLib, getRandom } = require('./utils')
const config = {
  serverPort: '80',
  pagePath: path.resolve(__dirname, '../../racing-client/dist/'),
  questionLibPath: path.resolve(__dirname, './questionLib.txt'),
  questionLib: [],
  judgeToken: '011605',
  // 以上三个变量，运行之前配置
  // 以下变量，在主持人界面登陆之后设置
  raceName: '',
  holder: '', // 举办方
  teamCount: 5,
  teamTokens: [],
  beginTime: undefined,
  endTime: undefined,
  raceMode: 0 // 竞赛模式：0抢答，1
}
const state = {
  enableAnswer: false,
  questionIndex: 0,
  question: '',
  answer: '',
  score: 2,
  updateTime: undefined,
  activeTeam: '', // 收到抢答消息的时候更新
  answers: [], // 每道题的回答情况，每次请求题目后push{}
  teams: {}// {token:{name:'', status:'', score:''}
}
// 如果能在在wss.clients中每个client添加属性标记是xuanshou or judge or screen 可以不记录该属性
// onconnnect的时候ws可以添加用户属性
// let connectedClients = { screen: [], xuanshou: [], judge: [] }

// 选手输入密令和队伍名，分别发送登陆和改名请求，名称在进入页面之后还可以再次修改
function login(param) {
  if (param.judgeToken) {
    if (param.judgeToken === config.judgeToken) {
      console.log('judge login success')
      return true
    } else {
      console.log('judge login fail')
      return false
    }
  }
  if (param.teamToken) {
    const token = param.teamToken
    if (config.teamTokens.indexOf(token) !== -1) {
      if (token in state.teams) { // 该队伍已经有客户端连接
        console.warn('this team already logined', token)
        if (state.teams.status !== 1) {
          console.warn('previous client disconnect', token)
          state.teams[token].status = 1 // 在线
        }
        return true
      } else {
        console.log('team login success', token)
        state.teams[token] = {
          name: undefined,
          score: 0,
          status: 1
        }
        return true
      }
    } else {
      console.log('team login fail')
      return false
    }
  }
  return true
}
// 初始化竞赛
function initRace(raceName, holder, teamCount, raceMode) {
  config.raceName = raceName
  config.holder = holder
  config.teamCount = teamCount
  config.raceMode = raceMode
  config.teamTokens = getRandom(4, teamCount)
  config.questionLib = readQuestionLib(config.questionLibPath)
  state.answers = [] // 每道题的回答情况，每次请求题目后push{}
  state.teams = {}
  state.questionIndex = 0
  state.enableAnswer = false// 未开始
  // 断开所有clients
  console.log(config.teamTokens)
  return { enableAnswer: false }
}
function beginRace() {
  config.beginTime = Date.now()
  state.questionIndex = 0
  state.enableAnswer = true// 已开始
  return { enableAnswer: true, beginTime: config.beginTime, questionIndex: 0 }
}
function nextQuestion() {
  if (config.questionLib.length === 0) {
    return {
      questionIndex: state.questionIndex,
      question: '题目已经做完了',
      score: state.score,
      updateTime: state.updateTime,
      enableAnswer: false
    }
  }
  state.questionIndex++
  const { q, a } = config.questionLib.shift()
  state.question = q
  state.answer = a
  state.score = 2
  state.answers[state.questionIndex] = {}
  state.activeTeam = undefined
  state.updateTime = Date.now()
  state.enableAnswer = true
  return { questionIndex: state.questionIndex, question: q, score: state.score, updateTime: state.updateTime, enableAnswer: true }
}
function showAnswer(questionIndex) {
  if (state.questionIndex !== questionIndex) {
    console.error('showAnswer.index !== state.questionIndex')
  }
  state.enableAnswer = false
  return { answer: state.answer, answers: state.answers[state.questionIndex], enableAnswer: false }
}
function changeScore(teamToken, newValue) {
  if (teamToken in state.teams) {
    state.teams[teamToken]['score'] = newValue
  } else {
    console.error('changeScore team not exist')
  }
  return { teamToken, newValue }
}
// 结束竞赛
function endRace() {
  state.enableAnswer = false
  config.teamTokens = []
  config.endTime = Date.now()
  console.log(state.teams)
  return { enableAnswer: false, endTime: config.endTime }
}
// 修改名称
function rename(token, name) {
  if (token in state.teams) {
    state.teams[token]['name'] = name
  } else {
    console.error('rename team not exist')
  }
  return { teams: state.teams }
}
function logout(token, type) {
  if (type === 'team') {
    if (config.teamTokens.indexOf(token) !== -1) {
      if (token in state.teams) {
        console.warn('team logout', token)
        delete state.teams[token]
      } else {
        console.warn('team logout failed, this team never logined', token)
      }
      return true // 直接允许连接
    }
  }
  if (type === 'judge' && token === config.judgeToken) {
    console.warn('judge logout')
    return true
  }
  return false
}
function answer(teamToken, answer, questionIndex) {
  if (questionIndex !== state.questionIndex) {
    console.error('client.questionIndex != state.questionIndex')
    return false
  }
  if (state.activeTeam === undefined) {
    console.log('first answer')
    state.activeTeam = teamToken
    if (config.raceMode === 1) { // 如果是抢答模式
      state.enableAnswer = false
    }
  }
  if (questionIndex === 0) {
    // 切题之前的测试
    return { teamToken, activeTeam: teamToken, enableAnswer: true, answer }
  }
  if (!(teamToken in state.answers[questionIndex])) {
    console.log('new answer -- questionIndex:' + state.questionIndex +
    ', team:' + teamToken + ', answer:' + answer)
    state.answers[questionIndex][teamToken] = {
      answer: answer,
      time: Date.now()
    }
  } else {
    console.warn('repeat answer')
  }
  return { teamToken, activeTeam: state.activeTeam, enableAnswer: state.enableAnswer }
}

module.exports = { login, logout, initRace, beginRace, endRace, changeScore, nextQuestion, showAnswer,
  rename, answer, config, state }
