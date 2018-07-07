<template>
<div class="wrapper">
  <el-form :inline="true" :model="formInline">
    <el-form-item label="">
      <el-input clearable v-model="formInline.user" placeholder="请输入钱包地址"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">搜索</el-button>
    </el-form-item>
  </el-form>
  <el-dialog
    title="提示"
    :visible.sync="searchResultVisible"
    width="30%">
    <dl>
      <dt>Coffee</dt>
      <dd>Black hot drink</dd>
      <dt>Milk</dt>
      <dd>White cold drink</dd>
    </dl>
    <!-- <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </span> -->
  </el-dialog>
</div>
</template>

<script>

  import {getTopN} from '../api/topFarmer'
  export default {
    data() {
      return {
        formInline: {
          user: ''
        },
        searchResultVisible: false
      }
    },
    methods: {
      async onSubmit() {
        try {
          let filterData = await getTopN(this.formInline.user)
          console.log(filterData)
          return filterData;
        } catch (error) {
          if (error.response && error.response.data) {
            alert(error.response.data.message);
          } else {
            alert(error);
          }
        }
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
</style>
