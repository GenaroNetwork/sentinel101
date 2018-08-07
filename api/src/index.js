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

// Add the route
server.route({
  method: 'GET',
  path: '/top-farmer',
  config,
  handler: function (request, h) {
    return topFarmer.getTopN()
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
    return nickNameManager.setNickName(request.params.address, request.payload, request.headers['x-signature'], request.headers['x-pubkey'])
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
