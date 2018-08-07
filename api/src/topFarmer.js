const axios = require('axios')
const _ = require('lodash');
const config = require('../config.json')
const getWeb3 = require('./web3Manager')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let gCacheDB = {
  totalStake:0,
  totalHeft:0,
  totalDataSize:0,
  allFarmers:null,
  topN:[],
}

let isSyncing = false

async function getFarmerStake (addr) {
  let web3 = getWeb3()
  try {
      const stake = await web3.genaro.getStake(addr, 'latest')
      return web3.utils.hexToNumber(stake)
  } catch (error) {
      console.error(error)
      return 0
  }
}

async function getTopN () {
  return gCacheDB.topN
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

async function getCurrentCommitteeAccountBinding() {
  let web3 = getWeb3()
  const bno = await web3.eth.getBlockNumber();
  const thisRoundFirstBlock = bno - bno % config.BLOCK_COUNT_OF_ROUND;
  const extraInfo = await web3.genaro.getExtra(thisRoundFirstBlock);
  return extraInfo.CommitteeAccountBinding;
}

async function getCandidates() {
  let web3 = getWeb3()
  return await web3.genaro.getCandidates('latest')
}

async function getCurrentRelation() {
  const committee = await getCurrentCommitteeAccountBinding()
  let allSubs
  if(!committee) {
    allSubs = []
  } else {
    allSubs = _.flatten(Object.values(committee))
  }
  const subSet = new Set(allSubs)
  const subToMain = new Map()

  for (const mainAddr in committee) {
    const subs = getSub(mainAddr)
    if(subs) {
      subs.forEach(subAddr => {
        subToMain.set(subAddr, mainAddr)
      })
    }
  }

  function hasMain(addr) {
    return subToMain.has(addr)
  }

  function getMain(addr) {
    return subToMain.get(addr)
  }

  function getSubToMainMap() {
    return subToMain
  }

  function getSub(addr) {
    if(committee) {
      const subs = committee[addr]
      if(subs && subs.length > 0) {
        return subs
      }
    }
    return null
  }
  function getSubSet() {
    return subSet
  }
  return {
    hasMain,
    getMain,
    getSubToMainMap,
    getSub,
    getSubSet
  }
}
// relation.getSub(), relation.hasMain()
async function fetchAllFarmers(relation) {
  let totalStake = 0
  let totalHeft = 0
  let totalDataSize = 0
  // 1. read all farmers from db
  let farmers = (await axios.get(config.allFarmers)).data
  if(!farmers || !Array.isArray(farmers)) return null;
  // 2. prepare farmer data map
  let farmerMap = new Map();
  farmers.reduce((fmap, f) => {
    fmap.set(f.address, f)
    totalHeft += f.heft
    if(f.data_size) {
      totalDataSize += f.data_size
    }
    return fmap
  }, farmerMap)
  // 3. merge candidiates
  const candis = await getCandidates()
  candis.forEach(can => {
    if(!farmerMap.has(can)) {
      farmerMap.set(can, {
        address: can,
        bJoinMatch: true,
      })
    }
  })
  // 4. merge subs. some sub farmer not exist in candidates nor in bridge DB because no share
  const subs = relation.getSubSet()
  subs.forEach(can => {
    if(!farmerMap.has(can)) {
      farmerMap.set(can, {
        address: can,
        bJoinMatch: true,
      })
    }
  })
  // 5. set all stakes
  for (let f of farmerMap.values()) {
    f.stake = await getFarmerStake(f.address)
    if(!f.data_size) {
      f.data_size = 0
    }
    if(!f.heft) {
      f.heft = 0
    }
    totalStake += f.stake
  }
  // extra. save to global data
  gCacheDB.totalHeft = totalHeft
  gCacheDB.totalStake = totalStake
  gCacheDB.totalDataSize = totalDataSize
  // 6. calculate sentinel, make data without big brother relation
  for (let f of farmerMap.values()) {
    f.sentinel = f.stake / totalStake + f.heft / totalHeft // total value shouldn't be zero
  }
  // 7. add subs to main
  const sub2Main = relation.getSubToMainMap()
  sub2Main.forEach((mainAddr, subAddr) => {
    const mainf = farmerMap.get(mainAddr)
    if(!mainf.subFarmers) {
      mainf.subFarmers = []
    }
    mainf.subFarmers.push(farmerMap.get(subAddr))
  })
  return farmerMap
}

function getSortedFarmer(farmerMap, relation) {
  // 5. merge data by big brother relation
  const newFarmers = []
  for(let f of farmerMap.values()) {
    // if has big brother, just skip
    if(relation.hasMain(f.address)) {
      continue;
    }
    // if has followers
    const subs = relation.getSub(f.address)
    if(subs && subs.length > 0) {
      subs.forEach((subAddr) => {
        subFarmer = farmerMap.get(subAddr)
        if(subFarmer) {
          f.stake += subFarmer.stake
          f.heft += subFarmer.heft
          f.data_size += subFarmer.data_size
          f.sentinel += subFarmer.sentinel
        } else {
          console.log(`${f.address}'s subfarmer not found: ${subAddr}`)
        }
      })
    }
    newFarmers.push(f)
  }
  // 7. sort
  newFarmers.sort((f1, f2) => {
    return f2.sentinel - f1.sentinel
  })
  return newFarmers
}

async function getCurrentTopFarmers() {
  const r = await getCurrentRelation()
  if(!r) return
  const farmerMap = await fetchAllFarmers(r)
  gCacheDB.allFarmers = farmerMap
  const orderedFarmer = getSortedFarmer(farmerMap, r)
  gCacheDB.topN = orderedFarmer
}

async function syncOn () {
  if (isSyncing) {
    return console.error('already syncing')
  }
  isSyncing = true
  do {
    try {
      const btime = Date.now()
      await getCurrentTopFarmers()
      const etime = Date.now()
      console.log(`Time used: ${etime - btime}`)
    } catch (error) {
      console.error('refresh error')
      console.error(error.stack)
    }
    await sleep(config.fetchInterval)
  } while (true)
}

async function getFarmerOutline() {
    return {
      totalHeft: gCacheDB.totalHeft,
      totalDataSize: gCacheDB.totalDataSize,
      totalStake: gCacheDB.totalStake
    }
}

function getTotalStake() {
  return gCacheDB.totalStake
}

function getFarmer(addr) {
  if(gCacheDB.allFarmers && gCacheDB.allFarmers.has(addr)) {
    return gCacheDB.allFarmers.get(addr)
  }
  return null
}

module.exports = {
  getTopN,
  syncOn,
  getFarmerOutline,
  getTotalStake,
  getFarmer,
}
