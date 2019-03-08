<template>
  <div class="loading-warp">
    <div id="loading-box">
  				<div class="object" id="object_one"></div>
  				<div class="object" id="object_two"></div>
  				<div class="object" id="object_three"></div>
  	</div>
    <div class="loading-tips" v-text="tipsText"></div>
    <div class="btn-close" @click="_close" v-if="isCloseShow"></div>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'Loading',
  beforeCreate(){
    console.log('loading_beforeCreate');
  },
  created(){
    console.log('loading_created');
  },
  beforeMount(){
    console.log('loading_beforeMount');
  },
  mounted(){
    console.log('loading_mounted');
  },
  beforeUpdate(){
    console.log('loading_beforeUpdate');
  },
  updated() {
    console.log('loading_updated');
  },
  beforeDestroy() {
    console.log('loading_beforeDestroy');
  },
  props:{
    visible: {
        type: Boolean,
        default: true
    },
    tipsText: {
      type: String,
      default: "加载中..."
    },
    isCloseShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
        return {

        }
  },
  methods: {
    _close(){
      this.$emit('close');
    }
  }
}
</script>

<style scoped>

#loading-box{
  width:100%;
  height: 135px;
  margin: 0 auto;
  z-index: 104;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading-tips{
  font-family: PingFangSC-Medium;
  color: #E3E3E3;
  letter-spacing: 0;
  font-size: 32px;
  margin-top: 41px;
  font-weight: 900;
  color: #FFFFFF;
  text-align: center;
}
.object{
  width: 135px;
  height: 135px;
  float: left;
}
.btn-close{
  width: 116px;
  height: 116px;
  margin: 82px auto;
  background: url(./close_icon.png) no-repeat;
  background-size: contain;
}
#object_one {
  background-image: url(./food1big.png);
  background-size: contain;
  -webkit-animation: object_one 1.5s infinite;
  animation: object_one 1.5s infinite;
  }
#object_two {
  background-image: url(./food2big.png);
  background-size: contain;
  -webkit-animation: object_two 1.5s infinite;
  animation: object_two 1.5s infinite;
  -webkit-animation-delay: 0.25s;
    animation-delay: 0.25s;
  }
#object_three {
  background-image: url(./food3big.png);
  background-size: contain;
    -webkit-animation: object_three 1.5s infinite;
  animation: object_three 1.5s infinite;
  -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
  }
@-webkit-keyframes object_one {
75% { -webkit-transform: scale(0.5); }
}
@keyframes object_one {

  75% {
    transform: scale(0.5);
    -webkit-transform: scale(0.5);
  }
}
@-webkit-keyframes object_two {
  75% { -webkit-transform: scale(0.5); }
}
@keyframes object_two {
  75% {
    transform: scale(0.5);
    -webkit-transform:  scale(0.5);
  }
}
@-webkit-keyframes object_three {

  75% { -webkit-transform: scale(0.5); }
}
@keyframes object_three {

  75% {
    transform: scale(0.5);
    -webkit-transform: scale(0.5);
  }
}
</style>
