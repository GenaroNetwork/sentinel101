<template>
  <el-form :inline="true" :model="formInline" class="wrapper">
    <el-form-item label="">
      <el-input clearable v-model="formInline.user" placeholder="请输入钱包地址"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">搜索</el-button>
    </el-form-item>
  </el-form>
</template>

<script>

  import {getTopN} from '../api/topFarmer'
  export default {
    data() {
      return {
        formInline: {
          user: ''
        }
      }
    },
    methods: {
      async onSubmit() {
        try {
          let allData = await getTopN();
          let filterData = await getTopN(this.formInline.user);
          filterData.forEach(fd => {
            for(let i = 0, length = allData.length; i < length; i++){
              if(allData[i].nickName == fd.nickName) {
                fd.order = allData[i].order;
                return;
              }
            }
            fd.order = -1;
          });
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
  margin: 20px 0
}
.el-input {
    width: 330px;
  }
  .el-form-item {
    margin-bottom: 0;
  }
</style>
