<template>
<div class="tb-wrap">
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="order" label="全球排名">
    </el-table-column>
    <el-table-column prop="nickName" label="昵称">
    </el-table-column>
    <el-table-column prop="address" label="地址" min-width="150">
      <template slot-scope="scope">
        <span class="addr" >{{ (scope.row.address) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="stake" :formatter="formatGNX" label="GNX Stake 量">
    </el-table-column>
    <el-table-column prop="spaceShared" :formatter="formatSpace" label="空间使用量">
    </el-table-column>
    <el-table-column prop="heft" label="Sharer 分数">
    </el-table-column>
  </el-table>
</div>
</template>

<script>
// const pageSize = 15
export default {
  data() {
    return {
      page:0,
      tableData: [{
        order: '1',
        nickName: '李三',
        address: '0xecc2784804dc1db60bce0a9f941c1f1fa76a5e3c',
        stake: 5000,
        spaceShared: 9899,
        heft: 8000
      }]
    }
  },
  methods: {
      formatGNX(row) {
          return (row.stake) + ' GNX'
      },
      formatSpace(row) {
          return (row.spaceShared) + ' GB'
      },
      formatAddr(row) {
        return row.address
      }
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
</style>
