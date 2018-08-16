import * as axios from 'axios'

const fetchUrl = "http://118.31.61.119:8000/farmers"
// const registerUrl = "http://118.31.61.119:8000/register-farmer"
//const totalStakeUrl = "http://118.31.61.119:8000/total-stake"
//const farmerStakeUrl = "http://118.31.61.119:8000/stake/"
const farmerOutline = "http://118.31.61.119:8000/farmer-outline"


async function getTopN() {
    let farmers = (await axios.get(fetchUrl)).data
    // filter 
    if(Array.isArray(farmers)) {
        farmers.forEach(f => {
            const subs = f.subFarmers
            if(Array.isArray(subs)) {
                subs.forEach((sub) => {
                    f.stake += sub.stake
                    f.heft += sub.heft
                    f.data_size += sub.data_size
                    f.sentinel += sub.sentinel
                })
            }
        })
    }
    const sortedF = farmers.filter(f => !f.mainFarmer).sort((f1, f2) => {
        if (f2.sentinel === 0 && f1.sentinel === 0) {
            return f2.stake - f1.stake
        } else {
            return f2.sentinel - f1.sentinel
        }
    })
    return sortedF
}

async function getFarmerOutline() {
    return (await axios.get(farmerOutline)).data
}

export {
    getTopN,
    getFarmerOutline
}