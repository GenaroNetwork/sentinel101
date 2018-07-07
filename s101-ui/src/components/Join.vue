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
      } catch (error) {
        if (error.response && error.response.data) {
          alert(error.response.data.message);
        } else {
          alert(error);
        }
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
