const tf = require('../src/topFarmer')
tf.getCurrentTopFarmers().then(r => {
    console.log(r)
})