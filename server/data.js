/**
 * nodejs 本身支持commonJS规范，使用require和module.exports=
 */
const config = {
  serverPort: '80',
  pagePath: require('path').resolve(__dirname, '../static/'),
  judgeToken: '011605',
  // 以上三个变量，运行之前配置
  // 以下变量，在主持人界面登陆之后设置
  raceName: '践行社会主核心价值观你追我赶之知识竞赛',
  teamCount: 5,
  teamTokens: ['1902', '1992', '2893', '8961'],
  beginTime: undefined,
  raceMode: 0 // 竞赛模式：0抢答，1
}
const state = {
  questionIndex: 0,
  question: '',
  answer: '',
  score: 2,
  updateTime: undefined,
  answers: {},
  activeTeam: '', // 收到抢答消息的时候更新
  teams: {}// {token:{name:'', status:'', score:''}
}
// 如果能在在wss.clients中每个client添加属性标记是xuanshou or judge or screen 可以不记录该属性
// onconnnect的时候ws可以添加用户属性
// let connectedClients = { screen: [], xuanshou: [], judge: [] }

// 选手输入密令和队伍名，分别发送登陆和改名请求，名称在进入页面之后还可以再次修改
function login(token, type) {
  if (type === 'judge' && token === config.judgeToken) {
    console.log('judge login')
    return true
  }
  if (type === 'team') {
    if (config.teamTokens.indexOf(token) !== -1) {
      if (token in state.teams) { // 该队伍已经有客户端连接
        console.warn('this team already logined', token)
        if (state.teams.status !== 1) {
          console.warn('previous client disconnect', token)
          state.teams[token].status = 1 // 在线
        }
      } else {
        console.log('team login success', token)
        state.teams[token] = {
          name: name,
          score: 0,
          status: 1
        }
      }
      return true // 直接允许连接
    } else {
      console.error('team login failed, token incorrect', token)
    }
  }
  return false
}
// 初始化竞赛
function initRace(raceName, teamCount, raceMode) {
  config.raceName = raceName
  config.raceMode = raceMode
  config.teamCount = teamCount
  config.teamTokens = require('./utils').getRandom(4, teamCount)
  // 断开所有clients
}
// 修改名称
function rename(token, name) {

}
function beginRace() {
  config.beginTime = Date.now()
}
// 结束竞赛
function endRace() {

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
function answer(teamToken, answer) {

}
function changeScore(teamToken, newValue) {

}

module.exports = { config, state }
