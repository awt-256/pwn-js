module.exports = {
  ELF: require('./src/ELF/'),
  util: require('./src/util/'),
  convo: require('./src/util/').convo,
  Remote: require('./src/PwnDuplex/').Remote,
  Process: require('./src/PwnDuplex/').Process,
}
