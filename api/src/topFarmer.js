const axios = require('axios')
const _ = require('lodash')
const config = require('../config.json')
const getWeb3 = require('./web3Manager')

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let gCacheDB = {
  totalStake:0,
  totalHeft:0,
  totalDataSize:0,
  totalSentinel: 0,
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

function getTopN () {
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
  const bno = await web3.eth.getBlockNumber()
  const thisRoundFirstBlock = bno - bno % config.BLOCK_COUNT_OF_ROUND
  const extraInfo = await web3.genaro.getExtra(thisRoundFirstBlock)
  return extraInfo.CommitteeAccountBinding
}

async function getPendingRelation() {
  const web3 = getWeb3()
  const candis = await web3.genaro.getCandidates('latest')
  const freeMan = []
  const subToMain = new Map()
  const mainToSub = new Map()
  if(Array.isArray(candis)) {
    let subPromi = candis.map(addr => web3.genaro.getSubAccounts(addr, 'latest'))
    const subArr = await Promise.all(subPromi)
    for(let i = 0; i < candis.length; i ++) {
      const thesubs = subArr[i]
      const mainAddr = candis[i]
      if(thesubs && thesubs.length > 0) {
        mainToSub.set(mainAddr, thesubs)
        thesubs.forEach(sub => {
          subToMain.set(sub, mainAddr)
        })
      } else {
        freeMan.push(mainAddr)
      }
    }
  }

  function getAll() {
    const mains = Array.from(mainToSub.keys())
    const subs = Array.from(subToMain.keys())
    return mains.concat(subs).concat(freeMan)
  }
  
  function getSub(addr) {
    return mainToSub.get(addr)
  }

  function getMain(addr) {
    return subToMain.get(addr)
  }
  
  return {
    getAll,
    getMain,
    getSub
  }
}

async function getCurrentRelation() {
  const committee = await getCurrentCommitteeAccountBinding()
  let allSubs
  let allMains = []
  if(!committee) {
    allSubs = []
  } else {
    allSubs = _.flatten(Object.values(committee))
  }
  const subToMain = new Map()

  for (const mainAddr in committee) {
    allMains.push(mainAddr)
    const subs = getSub(mainAddr)
    if(subs) {
      subs.forEach(subAddr => {
        subToMain.set(subAddr, mainAddr)
      })
    }
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

  function getMain(addr) {
    return subToMain.get(addr)
  }

  function getAll() {
    return allMains.concat(allSubs)
  }
  return {
    getAll,
    getMain,
    getSub
  }
}
// relation.getSub(),
async function fetchAllFarmers(relation, pendingRelation) {
  let totalStake = 0
  let totalHeft = 0
  let totalDataSize = 0
  let totalSentinel = 0
  // 1. read all farmers from db
  let farmers = (await axios.get(config.allFarmers)).data
  if(!farmers || !Array.isArray(farmers)) return null
  farmers = farmers.map(farmer => {
    farmer.address = farmer.address.toLowerCase()
    return farmer
  })
  // 2. prepare farmer data map
  let farmerMap = new Map()
  farmers.reduce((fmap, f) => {
    delete f['nodes']
    f.heft = Math.round(f.heft)
    fmap.set(f.address, f)
    totalHeft += f.heft
    if(f.data_size) {
      totalDataSize += f.data_size
    }
    return fmap
  }, farmerMap)
  // 3. merge candidiates AND candidates' sub farmers
  const pendingAll = pendingRelation.getAll()
  pendingAll.forEach(can => {
    if(!farmerMap.has(can)) {
      farmerMap.set(can, {
        address: can,
        bJoinMatch: true,
      })
    }
  })

  // 4. merge subs. some sub farmer not exist in candidates nor in bridge DB because no share
  const currentAll = relation.getAll()
  currentAll.forEach(can => {
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
    if(f.heft === 0) {
      f.sentinel = 0
    } else {
      f.sentinel = (f.stake / totalStake + f.heft / totalHeft) // total value shouldn't be zero
    }
    totalSentinel += f.sentinel
  }
  gCacheDB.totalSentinel = totalSentinel
  // 7. add subs to main
  for (let f of farmerMap.values()) {
    const subs = relation.getSub(f.address)
    const pSubs = pendingRelation.getSub(f.address)
    const main = relation.getMain(f.address)
    const pMain = pendingRelation.getMain(f.address)
    if(main) {
      f.mainFarmer = main
    }
    if(pMain) {
      f.pendingMainFarmer = pMain
    }
    if(subs && subs.length > 0) {
      if(!f.subFarmers) {
        f.subFarmers = []
      }
      subs.forEach(subAddr => {
        f.subFarmers.push(farmerMap.get(subAddr))
      })
    }
    if(pSubs && pSubs.length > 0) {
      if(!f.pendingSubFarmers) {
        f.pendingSubFarmers = []
      }
      pSubs.forEach(subAddr => {
        f.pendingSubFarmers.push(farmerMap.get(subAddr))
      })
    }
  }
  // 8. remove subs
  return farmerMap
}

function getSortedFarmer(farmerMap, relation) {
  // 5. merge data by big brother relation
  const newFarmers = []
  for(let f of farmerMap.values()) {
    // if has big brother, just skip
    if(relation.getMain(f.address)) {
      continue
    }
    // if has followers
    const subs = f.subFarmers // TODO: f has subaccounts
    if(subs && subs.length > 0) {
      subs.forEach((sub) => {
        subFarmer = farmerMap.get(sub.address)
        if(subFarmer) {
          f.stake += subFarmer.stake
          f.heft += subFarmer.heft
          f.data_size += subFarmer.data_size
          f.sentinel += subFarmer.sentinel
        } else {
          console.error(`${f.address}'s subfarmer not found: ${sub.address}`)
        }
      })
    }
    newFarmers.push(f)
  }
  // 7. sort
  newFarmers.sort((f1, f2) => {
    if (f2.sentinel === 0 && f1.sentinel === 0) {
      return f2.stake - f1.stake
    } else {
      return f2.sentinel - f1.sentinel
    }
  })
  return newFarmers
}

async function getCurrentTopFarmers() {
  const rPending = await getPendingRelation()
  const r = await getCurrentRelation()
  const farmerMap = await fetchAllFarmers(r, rPending)
  gCacheDB.allFarmers = farmerMap
  // const orderedFarmer = getSortedFarmer(farmerMap, r)
  // TODO: ordered farmer by pending
  // gCacheDB.topN = orderedFarmer
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
      totalStake: gCacheDB.totalStake,
      totalSentinel: gCacheDB.totalSentinel
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

function getAllFarmers() {
  return Array.from(gCacheDB.allFarmers.values()).filter(f => f.stake > 0)
}

module.exports = {
  getTopN,
  syncOn,
  getFarmerOutline,
  getTotalStake,
  getFarmer,
  getAllFarmers
}
