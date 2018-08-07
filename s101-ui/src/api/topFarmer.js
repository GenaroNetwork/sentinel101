import * as axios from 'axios'
import { isAddress } from 'web3-utils'

const fetchUrl = "http://118.31.61.119:8000/top-farmer"
// const registerUrl = "http://118.31.61.119:8000/register-farmer"
//const totalStakeUrl = "http://118.31.61.119:8000/total-stake"
//const farmerStakeUrl = "http://118.31.61.119:8000/stake/"
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

async function getFarmerOutline() {
    return (await axios.get(farmerOutline)).data
}

export {
    getTopN,
    getFarmerOutline
}