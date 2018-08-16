'use strict'

const Hapi = require('hapi')
const topFarmer = require('./topFarmer')
const nickNameManager = require('./nickName')
const Boom = require('boom')
const { isAddress } = require('web3-utils')

// Create a server with a host and port
const server = Hapi.server({
  host: '0.0.0.0',
  port: 8000
})

const config = {
  cors: {
    origin: ['*'],
    additionalHeaders: ['cache-control', 'x-requested-with']
  }
}

server.route({
  method: 'GET',
  path: '/farmers',
  config,
  handler: function (request, h) {
    return topFarmer.getAllFarmers()
  }
})

server.route({
  method: 'GET',
  path: '/farmer-outline',
  config,
  handler: async function (request, h) {
    return await topFarmer.getFarmerOutline()
  }
})

server.route({
  method: 'GET',
  path: '/farmer/{address}',
  config,
  handler: function (request, h) {
    return topFarmer.getFarmer(request.params.address)
  }
})

server.route({
  method: 'POST',
  path: '/farmer/{address}/nick',
  config,
  handler: function (request, h) {
    try {
      nickNameManager.setNickName(request)
      return h.response().code(200)
    } catch(e) {
      console.error(e)
      return h.response().code(400)
    }
  }
})

// Start the server
async function start () {
  try {
    topFarmer.syncOn()
    await server.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  console.log('Server running at:', server.info.uri)
};

start()
