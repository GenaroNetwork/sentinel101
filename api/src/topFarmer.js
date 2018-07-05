const axios = require('axios')
const config = require('../config.json')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let isSyncing = false
let gTopN = []

async function getTopN () {
  return gTopN
}

async function refresh () {
console.log(Date.now() + ' refresh top N')
  const topN = (await axios.get(config.topFarmerUrl)).data
  if (Array.isArray(topN)) {
    gTopN = topN
    console.log(Date.now() + ' top N sync success')
  } else {
    throw new Error('response data is not array')
  }
}

async function syncOn () {
  if (isSyncing) {
    return console.error('already syncing')
  }
  isSyncing = true
  do {
    await refresh()
    await sleep(config.fetchInterval)
  } while (true)
}

module.exports = {
  getTopN,
  refresh,
  syncOn
}
