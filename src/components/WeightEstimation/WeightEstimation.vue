<template>
  <div class="weight-estimation" v-title :data-title="title">
    <div class="back-btn" onclick="window.history.go(-1)"></div>
    <h1 class="weight-estimation-title">估算菜品重量</h1>
 
      <div class="img1">
      </div>
      <div class="img2">
      </div>

  </div>
</template>
<script>
export default {
  data() {
    return {
      title: "估算菜品重量"
    };
  },
  methods: {}
};
</script>
<style lang="less" scoped>
.weight-estimation {
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
    // margin: 52px 0 0 54px;
    z-index: 103;
  }
  .weight-estimation-title {
    width: 100%;
    height: 100px;
    margin: 65px 0 35px 0;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 48px;
    color: #584f60;
    border-bottom: 2px solid #dddfe4;
  }
  .img1,
  .img2 {
    width: 1000px;
    height: 651px;
    margin: 0 auto;
    background: url(./card1.png) no-repeat;
    background-size: contain;
  }
  .img2 {
    margin-top: 35px;
    background: url(./card2.png) no-repeat;
    background-size: contain;
  }
}
</style>
