<template>
  <div id="app" class="font-hei">
    <h1>Genaro Sharer 排行</h1>
    <Join />
    <Statistics />
    <Search />
    <Farmer />
  </div>
</template>

<script>
import Join from './components/Join.vue'
import Statistics from './components/Statistics.vue'
import Farmer from './components/Farmer.vue'
import Search from './components/Search.vue'

export default {
  name: 'app',
  components: {
    Join,
    Statistics,
    Farmer,
    Search
  }
}
</script>

<style>
body {
  margin: 0;
  width: 100%;
  margin: 0;

  background: url(/bg.jpg);
  background-position: top -100px center;
  background-size: auto 360px;
  background-repeat: repeat-x;
}
h1 {
  color: white;
}
.font-hei {font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;}
.font-kai {font-family: Baskerville, Georgia, "Liberation Serif", "Kaiti SC", STKaiti, "AR PL UKai CN", "AR PL UKai HK", "AR PL UKai TW", "AR PL UKai TW MBE", "AR PL KaitiM GB", KaiTi, KaiTi_GB2312, DFKai-SB, "TW\-Kai", serif;}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #646567;
  margin-top: 60px;
}
h1, h2, h3 {
  text-align: center;
}
</style>
