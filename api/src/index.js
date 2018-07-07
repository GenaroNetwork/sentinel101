'use strict'

const Hapi = require('hapi')
const topFarmer = require('./topFarmer')
const farmerStake = require('./farmerStake')
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
    var address = request.query.address
    return topFarmer.getTopN(address)
  }
})

server.route({
  method: 'POST',
  path: '/register-farmer',
  config,
  handler: async function (request, h) {
    var pp = request.payload
    if (pp && pp.address && pp.nickName) {
      if(pp.nickName.length > 10) {
        throw Boom.badData('nickName too long')
      }
      if(!isAddress(pp.address)) {
        throw Boom.badData('invalid address')
      }
      try {
        await topFarmer.register(pp.address, pp.nickName)
        return h.response().code(201)
      } catch (error) {
        throw Boom.notFound(error.message)
      }
    } else {
      throw Boom.badData('your data is bad and you should feel bad')
    }
  }
})

server.route({
  method: 'GET',
  path: '/total-stake',
  config,
  handler: function (request, h) {
    return farmerStake.getTotalStake()
  }
})

server.route({
  method: 'GET',
  path: '/stake/{address}',
  config,
  handler: async function (request, h) {
    return await farmerStake.getFarmerStake(request.params.address)
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

// Start the server
async function start () {
  try {
    topFarmer.syncOn()
    farmerStake.syncTotalStakeOn()
    await server.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  console.log('Server running at:', server.info.uri)
};

start()
