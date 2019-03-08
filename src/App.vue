<template>
  <div id="app">
    <keep-alive>
    <!-- <transition name="slide">
      <router-view ref="clipper" :apiUrl="apiUrl" :picViewUrl="picViewUrl"/>
    </transition> -->
    <router-view ref="clipper" :apiUrl="apiUrl" :picViewUrl="picViewUrl"/>
    </keep-alive>
  </div>
</template>

<script>
import { getApiUrl, getPicViewUrl } from "../config/api";

export default {
  name: "app",
  data() {
    return {
      apiUrl: getApiUrl, //获取api地址，在common/api.js中动态配置生产、开发、测试地址
      picViewUrl: getPicViewUrl //图片地址
    };
  }
};
</script>

<style lang="less">
@import "./common/less/base";
#app {
  width: 1080px;
  height: 100%;
  margin: 0 auto;
  position: relative;
}

#mask {
  width: 1080px;
  height: 100%;
  min-height: 1920px;
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 103;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.6);
}
.loading {
  position: fixed;
  top: 45%;
  margin-left: 340px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all .3s ease-in-out;
}
.slide-leave-active {
  transition: all .3s ease-in-out;
}
.slide-enter, .slide-leave-to
/* .slide-leave-active for below version 2.1.8 */ {
  transform: translateX(80%);
  // opacity: 0;
}
</style>
