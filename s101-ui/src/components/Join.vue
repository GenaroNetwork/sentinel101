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
  export default {
    data() {
      return {
        formInline: {
          user: '',
          nickname: ''
        }
      }
    },
    methods: {
      onSubmit() {
        console.log(this.formInline.user)
        console.log(this.formInline.nickname)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  text-align: center;
}
</style>
