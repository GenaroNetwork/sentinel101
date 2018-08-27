<template>
    <div class="wrapper locale">
        <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
            {{ selecedLocale }}
            <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="lang in langs" :key="lang.id" :value="lang.lang" :command="lang">{{ lang.txt }}</el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
    </div>
</template>

<style>
    .wrapper{
        width: 1024px;
        margin: 0 auto;
        display: flex;
        justify-content: flex-end;
        text-align: right;
    }
    .locale {
        margin-top: -30px;
        line-height: 15px;
    } 
    .el-dropdown {
        padding: 5px;
        border: 1px solid white;
    }
    .el-dropdown-link {
        color: white;
    }
</style>

<script>
export default {
    data() {
        return {
            selecedLocale: localStorage.getItem("selectedLocaleTxt") || '繁體中文 ',
            langs: [
                { id: 1, lang: 'zh_hk', txt: '繁體中文 '},
                { id: 2, lang: 'en_us', txt: 'English'},
            ]
        }
    },
    methods: {
       handleCommand(command) {
           this.$i18n.locale = command.lang;
           localStorage.setItem('selectedLocaleTxt', command.txt);
           localStorage.setItem('selectedLocale', command.lang);
           this.selecedLocale = command.txt;
       }
    }
}
</script>
