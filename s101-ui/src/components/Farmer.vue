<template>
<div class="tb-wrap">
  <el-form class="form" :inline="true" :model="formInline" ref="ruleForm" :rules="rules">
    <el-form-item label="" prop="address">
      <el-input clearable v-model="formInline.address" :placeholder="$t('message.please_input_wallet_address')"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">{{ $t("farmer.search")}}</el-button>
    </el-form-item>
  </el-form>
  <div class="table-header flex-wrap">
    <div class="order">{{ $t("farmer.order") }}</div>
    <!-- <div class="nickName">昵称</div> -->
    <div class="address">{{ $t("farmer.address") }}</div>
    <div class="stake">{{ $t("farmer.stake") }}</div>
    <div class="spaceShared">{{ $t("farmer.space_shared") }}</div>
    <div class="member">{{ $t("farmer.member") }}</div>
    <div class="sentinel">{{ $t("farmer.sentinel") }}</div>
    <div class="info"></div>
  </div>
  <div class="table-row flex-wrap" :class="row.address === searchResult ? 'highlight' : ''" :id="'c' + row.address" v-for="row in showData" :key="row.address">
    <div class="row-up flex-wrap">
      <div class="order" v-bind:class="{top3: row.order < 3}">{{row.order + 1}}</div>
      <!-- <div class="nickName">{{nickName(row)}}</div> -->
      <div class="address">{{row.address}}</div>
      <div class="stake">{{row.stake | formatNumber}} GNX</div>
      <div class="spaceShared">{{row.data_size | formatSize}}</div>
      <div class="member"><a @click.stop.prevent="toggleShowInfo(row)">{{row.subFarmers && row.subFarmers.length > 0 ? row.subFarmers.length + '/10' : ''}}</a></div>
      <div class="sentinel">{{row.sentinel * 10000 | formatNumber}}</div>
      <div class="info" @click.stop.prevent="toggleShowInfo(row)">
        <i v-if="!row.showExtra" class="el-icon-arrow-down"></i>
        <i v-if="row.showExtra" class="el-icon-arrow-up"></i>
      </div>
    </div>
    <div class="row-down" v-if="row.showExtra">
      <div class="extra1">
        <div class="extra-row"><span class="leftc">{{ $t("farmer.stake")}}：</span> <span class="rightc">{{row.stake | formatNumber}} GNX</span></div>
        <div class="extra-row"><span class="leftc">{{ $t("farmer.spaceShared") }}：</span> <span class="rightc">{{row.data_size | formatSize}}</span></div>
      </div>
      <div>
        <div class="sub-farmer" :class="f.address === searchResult ? 'highlight' : ''" :id="'c' + f.address" v-for="f in row.subFarmers" :key="f.address">
          <!-- <div class="nickName">{{nickName(f)}}</div> -->
          <div class="address">{{f.address}}</div>
          <div class="stake">{{f.stake | formatNumber}} GNX</div>
          <div class="spaceShared">{{f.data_size | formatSize}}</div>
          <div class="sentinel">{{f.sentinel * 10000 | formatNumber}}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="block">
    <el-pagination
      background
      :page-size="pageSize"
      :current-page.sync="pageNo"
      layout="prev, pager, next"
      :total="tableData.length"
      @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import {getTopN} from '../api/topFarmer';
import * as humanSize from 'human-size';
import { isAddress } from 'web3-utils'

export default {
  data() {
    return {
      tableData: [],
      showData: [],
      pageNo: 1,
      pageSize: 15,
      // search:
      formInline: {
        address: ''
      },
      rules: {
        address: [
          { required: true, message: this.$i18n.t('message.please_input_wallet_address'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!isAddress(value)) {
              const error_text = this.$i18n.t('error_message.not_right_address');
              callback(new Error(error_text));
            } else {
              callback();
            }
          }, trigger: 'blur' }
        ]
      },
      searchResult: null
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
      nickName(row) {
        if(row.nickName) {
          return row.nickName
        }
        return row.address.substr(0, 4)
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
        newData.forEach((row, index) => {
          if(openAddress.includes(row.address)) {
            row.showExtra = true
          }
          row.order = index
        })
        this2.tableData = newData
      },
      handleCurrentChange(currentPage) {
        this.showData = this.tableData.slice((currentPage - 1) * this.pageSize, currentPage * this.pageSize);
      },
      async onSubmit() {
        const this2 = this
        function highLight(addr) {
          Vue.nextTick(() => {
            const e = document.querySelector('#c' + addr)
            if(e) {
              e.scrollIntoView({behavior: 'smooth'})
            }
          })
        }
        this.$refs["ruleForm"].validate((valid) => {
          if(!valid) {
            return;
          }
          const addr = this2.formInline.address
          this2.searchResult = addr
          let index = this2.tableData.findIndex(o => o.address === addr);
          if(index === -1) {
            // TODO: not a main account, search for sub account
            index = this2.tableData.findIndex(f => {
              if(f.subFarmers && f.subFarmers.length > 0) {
                return f.subFarmers.find(o => o.address == addr);
              }
            })
          }
          if(index === -1) {
            this2.$message('没有搜到结果')
          } else {
            const pageIndex = Math.floor(index / this2.pageSize) + 1
            this2.pageNo = pageIndex
            this2.handleCurrentChange(this2.pageNo)
            highLight(addr)
            if(this2.tableData[index].subFarmers) {
              this.$set(this2.tableData[index], 'showExtra', true)
            }
          }
        })
      }
  },
  async created() {
    const this2 = this
    await this2.fetchTopN()
    this2.handleCurrentChange(1)
    setInterval(async ()=>{
      await this2.fetchTopN()
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
  flex-grow: 0;
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
.spaceShared {
  width: 150px;
  flex-shrink: 0;
}
.member {
  width: 80px;
  flex-shrink: 0;
}
.member a {
  cursor: pointer;
  text-decoration:underline;
}
.sentinel {
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

.el-input {
  width: 330px;
}
.el-form-item {
  margin-bottom: 0;
}
.form {
  text-align: right;
}
.right-align {
  text-align: right;
  padding-right: 6px;
}
.result {
  margin: 0 auto;
  font-size: 16px;
}


.highlight {
  font-weight: bold
}

.row-down {
  box-sizing: border-box;
  padding: 15px 0 0 120px;
  padding-top: 15px;
  width: 100%;
}

.extra1 {
  display: none;
}
.extra1 .extra-row {
  flex-grow: 1;
}
.sub-farmer {
  display: flex;
  font-size: 16px;
  color: rgba(0,0,0,0.5);
  margin: 5px 0;
}

@media only screen and (max-width: 1024px) {
  .stake, .spaceShared, .member{
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
  .sentinel {
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
  .extra-row {
    font-size: 12px;
    justify-content: space-between;
    width: 100%;
  }
  .wrapper {
    display: none;
  }
  .extra1 {
    width: 100%;
    display: flex;
    border-bottom: 1px solid rgba(0,0,0,0.1)
  }
  .row-down {
    box-sizing: border-box;
    padding: 15px 0 0 60px;
    padding-top: 15px;
    width: 100%;
  }

  .sub-farmer {
    display: flex;
    font-size: 12px;
    color: rgba(0,0,0,0.5);
    margin: 5px 0;
  }
}
</style>
