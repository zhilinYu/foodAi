<template>
  <div class="help-page" v-title :data-title="title">
      <div class="page-title">
        <i class="left-icon" v-on:click="goBack"></i>
        <p>帮助说明</p>
      </div>
      <div class="help-item">
        <ul class="help-list">
          <li>
            <img src="./1.png" alt="">
          </li>
          <li>
            <img src="./2.png" alt="">
          </li>
          <li>
            <img src="./3.png" alt="">
          </li>
        </ul>
      </div>
  </div>
</template>
<script>
import router from "@/router"
export default {
  data(){
    return{
      title:"帮助说明",
      hostUrl:"",
    }
  },
  props:["apiUrl"],
  mounted(){
    this.hostUrl = this.apiUrl
  },
  methods:{
    goBack(){
      router.push({path:"/"});
    }
  }
}
</script>
<style lang="less" scoped>
.help-page{
  margin: 0 auto;
  width: 10rem;
  font-size: 15px;/*px*/
}
.page-title{
  position: fixed;
  width: 10rem;
  z-index: 9;
  padding-top: 45px;
  padding-bottom: 25px;
  font-size: 48px;
  color:#584F60;
  text-align: center;
  background: #f9f9f9;
  .left-icon{
    position: absolute;
    left: 40px;
    top:45px;
    display: inline-block;
    width: 52px;
    height: 52px;
    background: url("./Rectangle2.png") 100% 100% no-repeat;
    background-size: cover;
  }
}
.help-item{
  width: 10rem;
  .help-list{
    overflow: auto;
    li{
      // margin-top: 20px;
    }
    img{
      width: 100%;
      display: block;
    }
  }
}
</style>
