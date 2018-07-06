<template>
<div class="tb-wrap">
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="order" label="全球排名">
    </el-table-column>
    <el-table-column prop="nickName" label="昵称">
    </el-table-column>
    <el-table-column prop="address" label="地址" min-width="150">
      <template slot-scope="scope">
        <span class="addr" >{{ (scope.row.address) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="stake" :formatter="formatGNX" label="GNX Stake 量">
    </el-table-column>
    <el-table-column prop="spaceShared" :formatter="formatSpace" label="空间使用量">
    </el-table-column>
    <el-table-column prop="heft" label="Sharer 分数">
    </el-table-column>
  </el-table>
</div>
</template>

<script>
import {getTopN, getFarmerStake} from '../api/topFarmer'
import * as humanSize from 'human-size'
// const pageSize = 15
export default {
  data() {
    return {
      page:0,
      tableData: []
    }
  },
  methods: {
      formatGNX(row) {
        if(row.stake) {
          return (row.stake) + ' GNX'
        } else {
          return '--'
        }
      },
      formatSpace(row) {
        if(row.data_size) {
          return humanSize(row.data_size, 2)
        } else {
          return 0
        }
      },
      formatAddr(row) {
        return row.address
      },
      async fetchTopN() {
        let this2 = this
        this2.tableData = await getTopN()
      },
      async refreshStake() {
        const this2 = this
        this2.tableData.forEach((row) => {
          getFarmerStake(row.address).then(s => {
            this2.$set(row, 'stake', s)
          })
        })
        return 
      }
  },
  async created() {
    const this2 = this
    await this.fetchTopN()
    setInterval(()=>{
      this2.refreshStake()
    }, 5000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tb-wrap {
  margin: 0 auto;
  width: 80%;
}
.addr {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
