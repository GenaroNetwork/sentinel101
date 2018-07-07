<template>
<div class="tb-wrap">
  <div class="table-header flex-wrap">
    <div class="order">排名</div>
    <div class="nickName">昵称</div>
    <div class="address">地址</div>
    <div class="stake">GNX Stake 量</div>
    <div class="spaceShared">空间使用量</div>
    <div class="heft">Sentinel</div>
    <div class="info"></div>
  </div>
  <div class="table-row flex-wrap" v-for="row in showData" :key="row.address">
    <div class="row-up flex-wrap">
      <div class="order" v-bind:class="{top3: row.order < 3}">{{row.order + 1}}</div>
      <div class="nickName">{{row.nickName}}</div>
      <div class="address">{{row.address}}</div>
      <div class="stake">{{row.stake | formatNumber}} GNX</div>
      <div class="spaceShared">{{row.data_size | formatSize}}</div>
      <div class="heft">{{row.heft | formatNumber}}</div>
      <div class="info" @click.stop.prevent="toggleShowInfo(row)">
        <i v-if="!row.showExtra" class="el-icon-arrow-down"></i>
        <i v-if="row.showExtra" class="el-icon-arrow-up"></i>
      </div>
    </div>
    <div class="row-down" v-if="row.showExtra">
      <div class="extra-row"><span class="leftc">GNX Stake 量</span> <span class="rightc">{{row.stake | formatNumber}}</span></div>
      <div class="extra-row"><span class="leftc">空间使用量</span> <span class="rightc">{{row.data_size | formatSize}}</span></div>
    </div>
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
      pageSize: 15
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
      toggleShowInfo(row) {
        if(row.showExtra) {
            this.$set(row, 'showExtra', false)
        } else {
            this.$set(row, 'showExtra', true)
        }
      },
      async fetchTopN() {
        let this2 = this
        // remember opend
        let openAddress = this2.tableData.filter(row => row.showExtra === true).map(row => row.address)
        let newData = await getTopN()
        newData.forEach(row => {
          if(openAddress.includes(row.address)) {
            row.showExtra = true
          }
        })
        this2.tableData = newData
      },
      refreshStake() {
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
  margin: 30px auto;
  width: 1024px;
  font-size: 18px;
}
.table-header {
  font-weight: bold;
  padding: 10px 10px 10px 0;
}
.table-row {
  padding: 20px 10px 20px 0;
  margin: 10px 0;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
  border-radius: 6px;
  flex-direction: column;
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
  width: 120px;
  flex-shrink: 0;
  text-align: center;
}
.top3 {
  color: #1e9ffa;
  font-size: 24px;
}
.nickName {
  width: 120px;
  flex-shrink: 0;
}
.address {
  width: 180px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  padding-right: 15px;
}
.stake {
  width: 150px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 15px;
}
.spaceShared {
  width: 150px;
  flex-shrink: 0;
}
.heft {
  width: 120px;
  flex-shrink: 0;
  text-align: right;
}
.info {
  display: none;
}


.row-up {
  width: 100%;
}
@media only screen and (max-width: 1024px) {
  .stake, .spaceShared{
    display: none;
  }

  .tb-wrap {
    width: 100%;
    font-size: 14px;
  }

  .order {
  width: 60px;
  }
  .address {
  flex-shrink: 1;
  }
.nickName {
  width: 80px;
  flex-shrink: 0;
}
.heft {
  width: 60px;
  flex-shrink: 0;
}

.info {
  width: 30px;
  flex-shrink: 0;
  display:unset;
  color: rgba(0,0,0,0.4);
  text-align: center;
}
.row-down {
  padding-top: 15px;
  width: 100%;
}
.row-down .leftc {
  padding-left: 24px;
}
.row-down .rightc {
  padding-right: 30px;
}
.extra-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
}
</style>
