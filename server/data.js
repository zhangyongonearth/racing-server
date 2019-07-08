/**
 * nodejs 本身支持commonJS规范，使用require和module.exports=
 */
const config = {
  serverPort: '80',
  pagePath: require('path').resolve(__dirname, '../static/'),
  zhuchiToken: '011605',
  // 以上三个变量，运行之前配置
  // 以下变量，在主持人界面登陆之后设置
  raceName: '践行社会主核心价值观你追我赶之知识竞赛',
  teamCount: 5,
  teamTokens: ['1902', '1992', '2893', '8961'],
  beginTime: Date.now(),
  raceMode: 0 // 竞赛模式：0抢答，1
}
const state = {
  questionIndex: 0,
  question: '',
  answer: '',
  score: 2,
  updateTime: Date.now(),
  answers: {},
  activeTeam: '', // 收到抢答消息的时候更新
  teams: {}// {token:'', name:'', status:'', score:''}
}
function login(token, type) {
  if (type === 'zhuchi' && token === config.zhuchiToken) {
    return true
  }
  if (type === 'team') {
    if (config.teamTokens.indexOf(token) !== -1) {
      // 如果state.teams中已经有该队伍，则不push
      if (token in state.teams) {

      } else {
        state.teams[token] = {
          name: name,
          score: 0,
          status: 0
        }
      }
      return true // 直接允许连接
    }
  }
}
function answer(teamToken, answer) {

}
function changeScore(teamToken, newValue) {

}
function initRace(name, teamCount) {

}

function endRace() {

}
module.exports = { config, state }
