<template>
<div class="wrapper">
  <el-form :inline="true" :model="formInline" ref="ruleForm" :rules="rules">
    <el-form-item label="" prop="address">
      <el-input clearable v-model="formInline.address" placeholder="请输入钱包地址"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">搜索</el-button>
    </el-form-item>
  </el-form>
  <el-dialog
    title="搜索"
    :visible.sync="searchResultVisible"
    width="30%">
    <div>
      <div><span class="farmer-prop">排名</span><span class="farmer-value">{{searchResult.order}}</span></div>
      <div><span class="farmer-prop">昵称</span><span class="farmer-value">{{searchResult.nickName}}</span></div>
      <div><span class="farmer-prop">地址</span><span class="farmer-value">{{searchResult.address}}</span></div>
      <div><span class="farmer-prop">GNX Stake 量</span><span class="farmer-value">{{searchResult.stake | formatNumber}}</span></div>
      <div><span class="farmer-prop">空间使用量</span><span class="farmer-value">{{searchResult.data_size | formatSize}}</span></div>
      <div><span class="farmer-prop">Sentinel</span><span class="farmer-value">{{searchResult.heft | formatNumber}}</span></div>
    </div>
  </el-dialog>
</div>
</template>

<script>

  import {getTopN, getFarmerStake} from '../api/topFarmer'
  export default {
    data() {
      return {
        formInline: {
          address: ''
        },
        rules: {
          address: [
            { required: true, message: '请输入钱包地址', trigger: 'blur' }
          ]
        },
        searchResultVisible: false,
        searchResult: {}
      }
    },
    methods: {
      async onSubmit() {
        const this2 = this
        this.$refs["ruleForm"].validate(async (valid) => {
          if(valid) {
            try {
              let filterData = await getTopN(this.formInline.address)
              console.log(filterData)
              if(filterData.length === 1) {
                let sr = filterData[0]
                this.searchResult = sr
                this.searchResultVisible = true

                getFarmerStake(sr.address).then(s => {
                  this2.$set(sr, 'stake', s)
                })
              } else {
                this.$message('没有搜到结果');
              }
            } catch (error) {
              if (error.response && error.response.data) {
                alert(error.response.data.message);
              } else {
                alert(error);
              }
            }
          }
        })
      }
    }
  }
</script>

<style scoped>
* {
  text-align: right;
}
.wrapper {
  width: 1024px;
  margin: 20px auto;
}
.el-input {
    width: 330px;
  }
  .el-form-item {
    margin-bottom: 0;
  }

@media only screen and (max-width: 1024px) {
.wrapper {
  display: none;
}
}
</style>
