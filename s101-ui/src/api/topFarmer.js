import * as axios from 'axios'
import { isAddress } from 'web3-utils'

const fetchUrl = "http://118.31.61.119:8000/top-farmer"
const registerUrl = "http://118.31.61.119:8000/register-farmer"
const totalStakeUrl = "http://118.31.61.119:8000/total-stake"
const farmerStakeUrl = "http://118.31.61.119:8000/stake/"
const farmerOutline = "http://118.31.61.119:8000/farmer-outline"


async function getTopN(address) {
    let url = fetchUrl;
    if (address) {
        if (!isAddress(address)) {
            throw new Error('invalid address')
        }
        url += '?address=' + address;
    }
    return (await axios.get(url)).data;
}

async function register (address, nickName) {
    if(!address) {
        throw new Error('missing address')
    }
    if(!nickName) {
        throw new Error('missing nickName')
    }
    if(nickName.length > 10) {
        throw new Error('nickName too long')
    }
    if(!isAddress(address)) {
        throw new Error('invalid address')
    }

    await axios.post(registerUrl, {
        address, nickName
    })
}

async function getTotalStake() {
    return (await axios.get(totalStakeUrl)).data
}

async function getFarmerStake(addr) {
    return (await axios.get(farmerStakeUrl + addr)).data
}

async function getFarmerOutline() {
    return (await axios.get(farmerOutline)).data
}

export {
    getTopN,
    register,
    getTotalStake,
    getFarmerStake,
    getFarmerOutline
}