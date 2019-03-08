<template>
  <div class="no-result-Page" v-title :data-title="title">
    <router-link class="back-btn" to="/"></router-link>
    <h1 class="title">识别无结果</h1>
    <div class="background"><img :src="bgSrc"></div>
  </div>
</template>
<script>
export default {
  name:"NoResultPage",
  data() {
    return {
      title: "识别无结果",
      bgSrc: require("./no_bg1.png")
    };
  },
  mounted(){
    if (this.$route.query.noResultImgUrl) {
      this.bgSrc = this.$route.query.noResultImgUrl
    } 
  }
};
</script>
<style lang="less" scoped>
.no-result-Page {
  position: relative;
  width:100%;
  height:100%;
  min-height:1920px;
  .back-btn {
    width: 52px;
    height: 52px;
    background: url(./Rectangle2.png) no-repeat;
    background-size: contain;
    position: absolute;
    color: white;
    font-size: 52px; /*px*/
    margin-left: 52px;
    margin-top: -5px;
    z-index: 103;
  }
}
.title {
  width: 100%;
  height: 100px;
  margin: 65px 0 35px 0;
  text-align: center;
  font-family: PingFangSC-Regular;
  font-size: 48px;
  color: #584f60;
  border-bottom: 2px solid #dddfe4;
}
.background {
  width: 790px;
  height: 790px;
  margin: 128px auto;
  // background: url(./no_bg.png) no-repeat;
  background-repeat: no-repeat;
  background-size: cover;
  img {
    width: 790px;
    height: 790px;
  }
}
</style>
