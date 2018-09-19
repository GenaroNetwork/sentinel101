<template>
  <div class="wrapper">
    <div class="stat">
      <span class="value">{{totalStake | formatNumber}}<span class="unit">GNX</span></span>
      <span class="desc">{{ $t("statistics.total_stake") }}</span>
    </div>
    <div class="stat">
      <span class="value">{{spaceHuman.num}}<span class="unit">{{spaceHuman.unit}}</span></span>
      <span class="desc">{{ $t("statistics.shared_space") }}</span>
    </div>
    <div class="stat">
      <span class="value">{{totalSentinel * 10000 | formatNumber}}<span class="unit"></span></span>
      <span class="desc">{{ $t("statistics.total_sentinel") }}</span>
    </div>
  </div>
</template>

<script>
import {getFarmerOutline} from '../api/topFarmer'
const MB = 1024 * 1024
const GB = 1024 * MB
const TB = 1024 * GB
export default {
  name: 'Statistics',
  data() {
    return {
      totalStake: 0,
      totalHeft: 0,
      totalDataSize: 0,
      totalSentinel: 0,
    }
  },
  computed: {
    // a computed getter
    spaceHuman: function () {
      // `this` points to the vm instance
      if (this.totalDataSize>TB) {
        return {
          num: this.$options.filters.formatNumber(this.totalDataSize/TB),
          unit: 'TB'
        }
      } else if (this.totalDataSize>GB) {
        return {
          num: this.$options.filters.formatNumber(this.totalDataSize/GB),
          unit: 'GB'
        }
      } else {
        return {
          num: this.$options.filters.formatNumber(this.totalDataSize/MB),
          unit: 'MB'
        }
      }
    }
  },
  methods: {
    async refreshData() {
      const ol = await getFarmerOutline()
      this.totalStake = ol.totalStake
      this.totalHeft = ol.totalHeft
      this.totalDataSize = ol.totalDataSize
      this.totalSentinel = ol.totalSentinel
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
.wrapper{
  width: 1024px;
  margin: 0 auto;
  padding: 30px 0;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);
  border-radius: 6px;
  background-color: white;

  display: flex;
  justify-content: space-around;
  text-align: center;
}
.stat {
  display: flex;
  flex-flow: column;
}
.value {
  color: #1e9ffa;
  font-size: 45px;
  font-weight: bold;
}
.unit {
  font-size: 20px;
}
@media only screen and (max-width: 1024px) {
  .value {
  font-size: 25px;
  }
  .wrapper {
    width: 100%
  }
}
</style>
