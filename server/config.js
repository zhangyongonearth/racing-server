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
  answers: [],
  activeTeam: '' // 收到抢答消息的时候更新
}
module.exports = { config, state }
