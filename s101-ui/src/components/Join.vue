<template>
  <el-form :inline="true" :model="formInline" class="demo-form-inline">
    <el-form-item label="">
      <el-input v-model="formInline.user" placeholder="请输入钱包地址"></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input v-model="formInline.nickname" placeholder="昵称"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">加入 Genaro Sharer 全球排名</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { register } from "../api/topFarmer";
export default {
  data() {
    return {
      formInline: {
        user: "",
        nickname: ""
      }
    };
  },
  methods: {
    async onSubmit() {
      try {
        await register(this.formInline.user, this.formInline.nickname);
        this.$message({
          message: '成功加入排名',
          type: 'success'
        });
        this.formInline.user = '';
        this.formInline.nickname = '';
      } catch (error) {
        let message = '';
        if (error.response && error.response.data) {
          message = error.response.data.message;
        } else {
          message = error.message;
        }
        this.$message.error({message});
      }
    }
  }
};
</script>

<style scoped>
* {
  text-align: center;
}
</style>
