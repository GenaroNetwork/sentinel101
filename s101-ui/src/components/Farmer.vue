<template>
<div class="tb-wrap">
  <div class="table-header flex-wrap">
    <div class="order">全球排名</div>
    <div class="nickName">昵称</div>
    <div class="address">地址</div>
    <div class="stake">GNX Stake 量</div>
    <div class="spaceShared">空间使用量</div>
    <div class="heft">Sharer 分数</div>
  </div>
  <div class="table-row flex-wrap" v-for="row in showData" :key="row.address">
    <div class="order">{{row.order}}</div>
    <div class="nickName">{{row.nickName}}</div>
    <div class="address">{{row.address}}</div>
    <div class="stake">{{row.stake | formatNumber}} GNX</div>
    <div class="spaceShared">{{row.data_size | formatSize}}</div>
    <div class="heft">{{row.heft}}</div>
  </div>
  <div class="block">
  <el-pagination
    background
    :page-size="pageSize"
    layout="prev, pager, next"
    :total="tableData.length"
    @current-change="handleCurrentChange">
  </el-pagination>
</div>
</div>
</template>

<script>
import {getTopN, getFarmerStake} from '../api/topFarmer';
import * as humanSize from 'human-size';

export default {
  data() {
    return {
      page:0,
      tableData: [],
      showData: [],
      pageSize: 10
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
      },
      handleCurrentChange(currentPage) {
        this.showData = this.tableData.slice((currentPage - 1) * this.pageSize, currentPage * this.pageSize);
      }
  },
  async created() {
    const this2 = this
    await this2.fetchTopN()
    this2.refreshStake()
    this2.handleCurrentChange(1)
    setInterval(async ()=>{
      await this2.fetchTopN()
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
.flex-wrap {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: center;
}
.order {
  width: 80px;
  flex-shrink: 0;
}
.nickName {
  width: 80px;
  flex-shrink: 0;
}
.address {
  width: 180px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stake {
  width: 80px;
  flex-shrink: 0;
  flex-grow: 1;
}
.spaceShared {
  width: 120px;
  flex-shrink: 0;
}
.heft {
  width: 120px;
  flex-shrink: 0;
}

</style>
