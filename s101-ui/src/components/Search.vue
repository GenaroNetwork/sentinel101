<template>
<div class="wrapper">
  <el-form class="form" :inline="true" :model="formInline" ref="ruleForm" :rules="rules">
    <el-form-item label="" prop="address">
      <el-input clearable v-model="formInline.address" placeholder="请输入钱包地址"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">{{ $t("framer.search") }}</el-button>
    </el-form-item>
  </el-form>
  <el-dialog
    title="搜索"
    :visible.sync="searchResultVisible"
    width="600px">
    <div>
      <table class="result">
        <tr>
          <td class="right-align">排名</td>
          <td>{{searchResult.order + 1}}</td>
        </tr>
        <tr>
          <td class="right-align">昵称</td>
          <td>{{searchResult.nickName}}</td>
        </tr>
        <tr>
          <td class="right-align">地址</td>
          <td>{{searchResult.address}}</td>
        </tr>
        <tr>
          <td class="right-align">GNX Stake 量</td>
          <td>{{searchResult.stake | formatNumber}}</td>
        </tr>
        <tr>
          <td class="right-align">空间使用量</td>
          <td>{{searchResult.data_size | formatSize}}</td>
        </tr>
        <tr>
          <td class="right-align">Sentinel</td>
          <td>{{searchResult.sentinel * 10000 | formatNumber}}</td>
        </tr>
      </table>
      <!-- <div><span class="farmer-prop">排名</span><span class="farmer-value">{{searchResult.order}}</span></div>
      <div><span class="farmer-prop">昵称</span><span class="farmer-value">{{searchResult.nickName}}</span></div>
      <div><span class="farmer-prop">地址</span><span class="farmer-value">{{searchResult.address}}</span></div>
      <div><span class="farmer-prop">GNX Stake 量</span><span class="farmer-value">{{searchResult.stake | formatNumber}}</span></div>
      <div><span class="farmer-prop">空间使用量</span><span class="farmer-value">{{searchResult.data_size | formatSize}}</span></div>
      <div><span class="farmer-prop">Sentinel</span><span class="farmer-value">{{searchResult.heft | formatNumber}}</span></div> -->
    </div>
  </el-dialog>
</div>
</template>

<script>

  import {getTopN} from '../api/topFarmer'
  import { isAddress } from 'web3-utils'
  export default {
    data() {
      return {
        formInline: {
          address: ''
        },
        rules: {
          address: [
            { required: true, message: '请输入钱包地址', trigger: 'blur' },
            { validator: (rule, value, callback) => {
              if (!isAddress(value)) {
                callback(new Error("这不是正确的钱包地址"));
              } else {
                callback();
              }
            }, trigger: 'blur' }
          ]
        },
        searchResultVisible: false,
        searchResult: {}
      }
    },
    methods: {
      async onSubmit() {
        this.$refs["ruleForm"].validate(async (valid) => {
          if(valid) {
            try {
              let filterData = await getTopN(this.formInline.address)
              console.log(filterData)
              if(filterData.length === 1) {
                let sr = filterData[0]
                this.searchResult = sr
                this.searchResultVisible = true
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
@media only screen and (max-width: 1024px) {
  .wrapper {
    display: none;
  }
}
</style>
