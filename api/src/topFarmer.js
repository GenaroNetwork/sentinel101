const axios = require('axios')
const config = require('../config.json')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let isSyncing = false
let gTopN = []

async function getTopN (address) {
  if(address) {
    let topDatas = gTopN.filter(g => g.address == address);
    let allDatas = (await axios.get(config.topFarmerUrl + '?address=' + address)).data;
    modify(allDatas);
    allDatas.forEach(aD => {
      if(aD) {
        for(let i = 0, length = topDatas.length; i < length; i++) {
          if(aD.nickName === topDatas[i].nickName) {
            aD.order = topDatas[i].order;
            return;
          }
        }
        aD.order = -1;
      }
    });
    return allDatas;
  }
  return gTopN
}

function modify (farmers) {
  return farmers.map((farmer, index) => {
    delete farmer._id
    delete farmer.__v
    delete farmer.bJoinMatch
    delete farmer.nodes
    farmer.order = index
  })
}

async function refresh () {
  console.log(Date.now() + ' refresh top N')
  const topN = (await axios.get(config.topFarmerUrl)).data
  if (Array.isArray(topN)) {
    modify(topN)
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
    try {
      await refresh()
    } catch (error) {
      console.log('refresh error' + error)
    }
    await sleep(config.fetchInterval)
  } while (true)
}

async function register (address, nickName) {
  try {
    await axios.post(config.registerUrl, {
      address, nickName
    })
  } catch (error) {
    if (error && error.response && error.response.data) {
      throw new Error(error.response.data.error)
    } else {
      throw error
    }
  }
}

async function getFarmerOutline() {
    return (await axios.get(config.outlineUrl)).data
}
module.exports = {
  getTopN,
  refresh,
  syncOn,
  register,
  getFarmerOutline
}
