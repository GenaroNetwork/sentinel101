const Web3 = require('genaro-web3')
const config = require('../config.json')
const BN = require('bn.js');

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
let web3
function makeWeb3() {
  let provider = new Web3.providers.WebsocketProvider("ws://47.100.107.16:8547")
  let _web3 = new Web3(provider)
  if (typeof provider.connection.onerror === 'function') {
    let oldOnclose = provider.connection.onerror
    provider.connection.onclose = function(err) {
      console.error("websocket error")
      oldOnclose()
      setTimeout(()=>{
        console.log('recreating web3')
        web3 = makeWeb3()
      }, 3000)
    }
  }
  return _web3
}
web3 = makeWeb3()

let totalStake = new BN(0)
let isSyncing = false
async function refresh () {
  let cans = await web3.genaro.getCandidates('latest')
  let total = new BN(0)
  for (let can of cans) {
    const val = await getFarmerStake(can)
    const stake = web3.utils.toBN(val)
    total.iadd(stake)
  }
  totalStake = total
}

async function getFarmerStake (addr) {
    try {
        const stake = await web3.genaro.getStake(addr, 'latest')
        return web3.utils.hexToNumber(stake)
    } catch (error) {
        console.error(error)
        return 0
    }
}

function getTotalStake () {
  return totalStake.toString()
}

async function syncTotalStakeOn () {
  if (isSyncing) {
    return console.error('already syncing')
  }
  isSyncing = true
  do {
    try {
      await refresh()
    } catch (error) {
      console.log('refresh error' + error)
    }
    await sleep(config.fetchInterval)
  } while (true)
}

module.exports = {
  getTotalStake,
  syncTotalStakeOn,
  getFarmerStake
}
