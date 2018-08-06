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
  allFarmer:[],
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
  const allSubs = _.flatten(Object.values(committee))
  const subSet = new Set(allSubs)
  function hasMain(addr) {
    return subSet.has(addr)
  }
  function getSub(addr) {
    const subs = committee[addr]
    if(subs && subs.length > 0) {
      return subs
    }
    return null
  }
  function getSubSet() {
    return subSet
  }
  return {
    hasMain,
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
  // 4. merge subs
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
  // 6. calculate sentinal, make data without big brother relation
  for (let f of farmerMap.values()) {
    f.sentinal = f.stake / totalStake + f.heft / totalHeft // total value shouldn't be zero
  }
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
          f.sentinal += subFarmer.sentinal
        } else {
          console.log(`${f.address}'s subfarmer not found: ${subAddr}`)
        }
      })
    }
    newFarmers.push(f)
  }
  // 7. sort
  newFarmers.sort((f1, f2) => {
    return f2.sentinal - f1.sentinal
  })
  return newFarmers
}

async function getCurrentTopFarmers() {
  const r = await getCurrentRelation()
  const farmerMap = await fetchAllFarmers(r)
  gCacheDB.allFarmer = farmerMap
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
      await getCurrentTopFarmers()
    } catch (error) {
      console.log('refresh error' + error)
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

function getTotalStake() {
  return gCacheDB.totalStake
}

module.exports = {
  getTopN,
  syncOn,
  register,
  getFarmerOutline,
  getTotalStake
}
