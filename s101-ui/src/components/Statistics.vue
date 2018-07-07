<template>
  <div class="hello">
    <div>
      <span>{{totalStake | formatNumber}}</span>
      <span>STAKE 总量</span>
    </div>
    <div>
      <span>{{totalDataSize | formatSize}}</span>
      <span>共享空间</span>
    </div>
    <div>
      <span>{{totalHeft | formatNumber}}</span>
      <span>SENTINEL 总量</span>
    </div>
  </div>
</template>

<script>
import {getFarmerOutline, getTotalStake} from '../api/topFarmer'
export default {
  name: 'Statistics',
  data() {
    return {
      totalStake: 0,
      totalHeft: 0,
      totalDataSize: 0,
    }
  },
  methods: {
    async refreshData() {
      this.totalStake = await getTotalStake()
      const ol = await getFarmerOutline()
      this.totalHeft = ol.totalHeft
      this.totalDataSize = ol.totalDataSize
    }
  },
  async created() {
    await this.refreshData()
    setInterval(this.refreshData, 3000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
