<template>
  <div class="network-error-Page" v-title :data-title="title">
    <div class="back-btn" @click="goback"></div>
    <h1 class="title">{{title}}</h1>
    <div class="background"><img :src="bgImg" alt=""></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      errorObj: {
        networkerror: "网络异常",
        onloaderror: "加载异常",
        servererror: "服务器异常"
      }
    };
  },
  computed: {
    title() {
      return this.errorObj[this.errorType];
    },
    errorType() {
      return this.$route.query.errorType || "servererror";
    },
    bgImg() {
      return require("./" + this.errorType + ".png");
    }
  },
  methods: {
    goback() {
      this.$router.back(-1);
    }
  }
};
</script>
<style lang="less" scoped>
.network-error-Page {
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
  width: 518px;
  height: 678px;
  margin: 128px auto;
  img {
    width: 518px;
    height: 678px;
  }
}
</style>
