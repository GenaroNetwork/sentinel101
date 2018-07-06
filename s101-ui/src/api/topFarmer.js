import * as axios from 'axios'

const fetchUrl = "http://localhost:8000/top-farmer"
const registerUrl = "http://localhost:8000/register-farmer"
const totalStakeUrl = "http://localhost:8000/total-stake"
const farmerStakeUrl = "http://localhost:8000/stake/"
const farmerOutline = "http://localhost:8000/farmer-outline"


async function getTopN() {
    return (await axios.get(fetchUrl)).data
}

async function register (address, nickName) {
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