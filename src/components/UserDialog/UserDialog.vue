<template>
    <div class="user-dialog" v-show="!dialogShow" @click="!dialogShow" transition="fade">
        <!-- <div class="dialog-mask"></div> -->
        <div class="dialog">
          <img class="close-btn" src="./close-dialog.png" alt="关闭按钮"  @click="dialogCancel">
          <img class="dialog-img" src="./shala.png"/>
          <div class="dialog-text">
            <h1>{{title}}</h1>
            <p>{{text}}</p>
            <div class="btn-box">
              <button v-show="leftbtn.length" @click="dialogCancel">{{leftbtn}}</button>
              <button v-show="rightbtn.length" @click="dialogEnsure">{{rightbtn}}</button>
            </div>
          </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "Dialog",
  data() {
    return {
      dialogShow: false
    };
  },
  props: {
    title: {
      type: String, //标题
      default: "报告大人"
    },
    text: {
      type: String, //文本
      default: "是否确定取消？"
    },
    leftbtn: {
      type: String, 
      default: "取消" //默认显示取消按钮
    },
    rightbtn: {
      type: String, 
      default: "确定" //默认显示确定按钮
    }
  },
  mounted() {},
  methods: {
    dialogCancel() {
      this.$emit("dialogCancel");
    },
    dialogEnsure() {
      this.dialogShow = true;
      this.$emit("dialogEnsure");
    }
  }
};
</script>

<style lang="less" scoped>
.dialog-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 103;
}
.dialog {
  position: fixed;
  z-index: 104;
  top: 200px;
  .close-btn {
    width: 48px;
    height: 48px;
    position: absolute;
    left: 880px;
    top: 245px;
  }
}
img {
  width: 450px;
  height: 300px;
  position: absolute;
  left: 310px;
  top: 110px;
  z-index: 104;
}
.dialog-text {
  width: 680px;
  height: 528px;
  position: absolute;
  left: 150px;
  top: 304px;
  padding: 0 50px;
  background: #ffffff;
  border-radius: 26px;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  h1 {
    font-family: PingFangSC-Medium;
    font-size: 50px;
    line-height: 70px;
    margin: 40px 0;
    color: #584f60;
  }
  p {
    height: 110px;
    overflow: auto;
    font-family: PingFangSC-Regular;
    font-size: 40px;
    color: #584f60;
    margin-bottom: 20px;
  }
  button {
    width: 300px;
    height: 100px;
    background: #ffffff;
    border: 2px solid rgba(26, 206, 251, 0.8);
    box-shadow: 0 3px 6px 0 rgba(26, 206, 251, 0.6);
    border-radius: 50px;
    font-family: PingFangSC-Regular;
    font-size: 50px;
    color: #1acefb;
    margin: 0 10px;
    &:last-child {
      background-image: linear-gradient(90deg, #29e5e8 10%, #18ccfc 94%);
      box-shadow: 0 3px 10px 0 rgba(3, 108, 214, 0.3);
      color: #ffffff;
    }
  }
}
</style>
