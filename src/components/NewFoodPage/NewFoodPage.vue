<template>
  <div class="new-food" v-title :data-title="title">
    <router-link class="back-btn" to="/result"></router-link>
    <h1 class="new-food-title">新菜品？快来告诉我这是什么菜?</h1>
    <div class="new-food-img-container">
      <div class="image-box">
        <img class="new-food-img" :src="imageUrl" v-if="imageUrl">
        <img v-else src="./food.png" alt="">
      </div>
      <input type="text" ref="inputDom" placeholder="  请输入15字内的菜品名" class="new-food-input" maxlength="30" v-model="inputFoodName" @keyup="inputFoodNameFun">
      <img src="./clear.png" class="clear-btn" v-show="inputFoodName.length" @click="inputFoodName=''">
      <div class="submit-btn" :class="[inputFoodName==''?'disabled':'']" @click="submitFun">提交</div>
    </div>
   <transition name="fade">
    <div id="mask" v-show="maskVisible">
      <user-dialog class="user-dialog" v-show="userDialogVisible" :text="UserDialogText" @dialogEnsure="dialogEnsure"  @dialogCancel="dialogCancel"/>
      <loading class="loading" :tipsText="'正在提交...'" v-show="loadingVisible"/>
    </div>
    </transition>
  </div>
</template>
<script>
import Vue from "vue";
import axios from "axios";
import { setTimeout } from "timers";
import Loading from "components/Loading/Loading";
import Toast from "components/Toast/toast";
import UserDialog from "components/UserDialog/UserDialog";
export default {
  data() {
    return {
      title: "新菜品输入",
      imageUrl: localStorage.getItem("imageUrl") || "",
      identifyDishName: localStorage.getItem("identifyDishName") || "",
      inputFoodName: "",
      maskVisible: false,
      userDialogVisible: false,
      loadingVisible: false,
      UserDialogText: ""
    };
  },
  watch: {
    $route() {
      this.maskVisible = false;
      this.loadingVisible = false;
      this.userDialogVisible = false;
    }
  },
  components: {
    Loading,
    UserDialog
  },
  props: ["apiUrl"],
  mounted() {},
  methods: {
    goToDetail(id) {
      this.$router.push({ path: `/detail/${id}` });
      localStorage.setItem("dishId", id);
      localStorage.setItem("channelType", 3);
      localStorage.setItem("userId", "");
    },
    setMaxLength(maxLen) {
      var w = 0;
      var tempCount = 0;
      for (var i = 0; i < this.inputFoodName.length; i++) {
        //charCodeAt()获取字符串中某一个字符的编码
        var c = this.inputFoodName.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
          w++;
        } else {
          w += 2;
        }
        if (w > maxLen) {
          this.inputFoodName = this.inputFoodName.substr(0, i);
          break;
        }
      }
    },
    checkInputName() {
      var value = this.inputFoodName;
      if(value=='') return false;
      var tmpArr = value.split(""),
        flag = 0;
      var reg = /^[A-Za-z0-9\u4e00-\u9fa5\s]+$/gi; //只能为中文，字母，数字，空格
      for (let i = 0; i < tmpArr.length; i++) {
        const element = tmpArr[i];
        if (!element.match(reg)) {
          flag = i;
          break;
        }
      }
      if (!reg.test(value) || value.match(/^[ ]+$/)) {
        this.inputFoodName = this.inputFoodName.substr(0, flag);
        Toast({
          message: "输入不正确",
          position: "middleBottom",
          duration: 1000
        });
        return false;
      }
      return true;
    },
    inputFoodNameFun() {
      this.setMaxLength(30);
      this.checkInputName();
    },
    dialogEnsure() {
      this.maskVisible = false;
      this.userDialogVisible = false;
      this.$router.back(-1);
    },
    dialogCancel() {
      this.maskVisible = false;
      this.userDialogVisible = false;
    },
    submitFun() {
      if (this.inputFoodName == "") {
        return false;
      }
      if (!this.checkInputName()) return false;
      this.maskVisible = true;
      this.loadingVisible = true;
      var param = {
        appid: 1,
        nonceStr: "asdasd",
        timestamp: "123456",
        data: {
          imageUrl: this.imageUrl,
          identifyDishName: this.identifyDishName,
          userDishName: this.inputFoodName,
          ossSign: localStorage.getItem("signature")
        },
        sign: "aaa"
      };
      axios({
        url: this.apiUrl + "/api/v1/dish/newdish",
        method: "post",
        data: param
      })
        .then(res => {
          setTimeout(() => {
            this.maskVisible = false;
            this.loadingVisible = false;
            if (res.data.code == "0") {
              if (res.data.data.isNewDish == "false") {
                //不是新菜品进入详情页
                this.goToDetail(res.data.data.dishId);
              } else if (res.data.data.isNewDish == "true") {
                //是新菜品页面提示成功或失败
                Toast({
                  message: "添加成功，感谢你的支持",
                  position: "middleBottom",
                  duration: 2000
                });
              }
            } else if (res.data.code == "20004") {
              this.UserDialogText = "神游太久，访问超时，重新识别方可提交~";
              this.maskVisible = true;
              this.userDialogVisible = true;
            }else {
              Toast({
                message: "添加失败",
                position: "middleBottom",
                duration: 2000
              });
            }
          }, 1000);
        })
        .catch(error => {
          if (error.toString() == "Error: Network Error") {
            Toast({
              message: "网络异常，请连接网络后重试",
              position: "middleBottom",
              duration: 2000
            });
          }
          this.maskVisible = false;
          this.loadingVisible = false;
        });
    }
  }
};
</script>
<style lang="less" scoped>
.new-food {
  width: 100%;
  height: 100%;
  background:#fdfdfd;
  box-shadow: inset 0 -2px 0 0 rgba(238, 239, 241, 0.5);
  // position: relative;
  .back-btn {
    width: 52px;
    height: 52px;
    background: url(./Rectangle2.png) no-repeat;
    background-size: contain;
    position: absolute;
    color: white;
    margin-left: 52px;
    margin-top: 65px;
    z-index: 103;
  }
  .new-food-title {
    width: 100%;
    height: 100px;
    padding-top: 65px;
    // margin-bottom: 35px;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 48px;
    color: #584f60;
    // border-bottom:1px solid #EEEFF1;
  }
  .new-food-img-container {
    width: 920px;
    height: 574px;
    padding: 44px;
    margin: 0 auto;
    background: #ffffff;
    box-shadow: 0 6px 58px 0 rgba(0, 0, 0, 0.1);
    border-radius: 23.04px;
    .image-box {
      width: 920px;
      height: 460px;
      overflow: hidden;
      img {
        width: 920px;
        height: 920px;
        position: relative;
        top: -200px;
      }
    }
    .new-food-input {
      width: 700px;
      height: 60px;
      line-height: 60px;
      margin-top: 50px;
      font-family: PingFangSC-Regular;
      font-size: 40px;
      color: #584f60;
    }
    .clear-btn {
      width: 50px;
      height: 50px;
      position: absolute;
      left: 720px;
      top: 725px;
    }
    .submit-btn {
      width: 180px;
      height: 82px;
      line-height: 82px;
      float: right;
      margin-top: 38px;
      text-align: center;
      font-family: PingFangSC-Regular;
      font-size: 40px;
      color: #ffffff;
      border: none;
      cursor: pointer;
      background-image: linear-gradient(90deg, #29e5e8 10%, #18ccfc 94%);
      box-shadow: 0 3px 10px 0 rgba(3, 108, 214, 0.3);
      border-radius: 10px;
      &.disabled {
        background-image: linear-gradient(90deg, #8be5fd 10%, #93f1f3 94%);
        box-shadow: 0 3px 10px 0 rgba(3, 108, 214, 0.3);
        border-radius: 10px;
      }
    }
  }
}

//设置placeholder颜色
input::-webkit-input-placeholder {
  color: #dddfe4;
}

input::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #dddfe4;
}

input:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #dddfe4;
}

input:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #dddfe4;
}
</style>
