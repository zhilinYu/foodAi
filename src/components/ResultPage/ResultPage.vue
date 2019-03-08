<template>
  <div class="result-page" v-title :data-title="title">     
    <router-link class="back-button" to="/"/>
    <div class="no-data" v-if="!firstPicResult.length">暂无数据...</div>
    <section class="result-food-item" v-for="(item,index) in firstPicResult" :key="index" v-show="firstPicResult.length" v-on:click="goToDetail(item.id)">
      <div class="result-item-top">
        <div class="food-img"><img :src="originalImageUrl" :onerror="errorImg"></div>
        <div class="food-description">
          <div class="food-name" v-text="item.name"></div>
          <div class="food-nutrition">
            <div class="nutrition-item heat">
              <span v-text="item.heatQuantify">--</span>
              <span>热量（kCal）</span>
            </div>
            <div class="nutrition-item fat">
              <span v-text="item.fat">--</span>
              <span>脂肪（g）</span>
            </div>
            <div class="nutrition-item protein">
              <span v-text="item.protein">--</span>
              <span>蛋白质（g）</span>
            </div>
          </div>
          <div class="food-nutrition-100">
            <span>每100g所含营养成分</span>
          </div>
        </div>
      </div>
      <div class="result-item-bottom">
        <div class="result-item-bottom-box">
          <div class="confidence">置信度
            <span>{{item.probability}}</span>
          </div>
          <span class="identify-hot">识别热度&nbsp;</span>
          <star class="start-bar" :score0="item.identifyHeat/10"></star>
          <!-- <div class="share-btn">
            <img src="./share_btn.png" alt="">
          </div> -->
        </div>
      </div>
    </section>

    <section class="result-food-item backup" v-for="(item,index) in backupPicResult" v-show="backupPicResult.length" :key="index+1" v-on:click="goToDetail(item.id)">
      <div class="result-item-top">
        <div class="food-description">
          <span class="bule-line"></span>
          <div class="food-name" v-text="item.name"></div>
          <div class="food-nutrition">
            <div class="nutrition-item heat">           
              <span>{{item.heatQuantify}}kCal</span>
              <span>热量<div class="line-heat"></div></span>             
            </div>
            <div class="nutrition-item fat">
              <span>{{item.fat }}g</span>
              <span>脂肪<div class="line-fat"></div></span>             
            </div>
            <div class="nutrition-item protein">
              <span>{{item.protein}}g</span>
              <span>蛋白质</span>
            </div>
          </div>
          <div class="food-nutrition-100">
            <span>每100g所含营养成分</span>
          </div>
        </div>
        <div class="food-img">
          <img :src="item.imageUrl" :onerror="errorImg">
          <!-- <div v-else class="else-img"></div> -->
        </div>
      </div>
      <div class="result-item-bottom">
        <div class="result-item-bottom-box">
          <div class="confidence">置信度
            <span>{{item.probability }}</span>
          </div>
          <span class="identify-hot">识别热度&nbsp;</span>
          <star class="start-bar" :score0="item.identifyHeat/10"></star>
          <div class="share-btn" @click.stop ="recoveryFun(item,index)">
            <span>原来是它</span>
            <img src="./check.png" alt="">
          </div>
        </div>
      </div>
    </section>
    
    <section class="recovery" v-show="firstPicResult.length" @click="goToNewFoodPage">
      <div>新菜品？快来告诉我这是什么菜</div>
    </section>
    
    <transition name="fade">
    <div id="mask" v-show="maskVisible" >
      <user-dialog class="user-dialog" v-show="userDialogVisible"  :text="UserDialogText" @dialogEnsure="dialogEnsure"  @dialogCancel="dialogCancel">
        <div class="btn-box" slot="btnBox">
            <button v-show="true" @click="dialogCancel">取消</button>
            <button v-show="true" @click="dialogEnsure">确定</button>
        </div>
      </user-dialog>
      <loading class="loading" :tipsText="'正在纠错...'" v-show="loadingVisible"/>
    </div>
    </transition>
  </div>
</template>
<script>
import jQuery from "jquery";
import axios from "axios";
import Star from "components/Star/Star";
import UserDialog from "components/UserDialog/UserDialog";
import Loading from "components/Loading/Loading";
import router from "@/router";
import { setTimeout } from "timers";
export default {
  name: "ResultPage",
  data() {
    return {
      title: "识别结果",
      startScore: 0,
      originalImageUrl: "",
      firstPicResult: [],
      backupPicResult: [],
      noData: false,
      maskVisible: false,
      userDialogVisible: false,
      loadingVisible: false,
      UserDialogText: "",
      errorImg: 'this.src="' + require("./error_img.png") + '"'
    };
  },
  props: ["apiUrl"],
  mounted() {
    this.getPageData();
  },
  components: {
    Star,
    UserDialog,
    Loading
  },
  methods: {
    getPageData() {
      var optionss = window.localStorage.getItem("resultData");
      // var optionss = this.$route.params["resultData"];
      if (optionss === null) return false;
      var ArrData = JSON.parse(optionss);
      var resultList = this.copy(ArrData[0]).resultList;
      this.originalImageUrl = ArrData[0].originalImageUrl;
      this.firstPicResult.push(resultList[0]);
      for (let i = 1; i < resultList.length; i++) {
        const element = resultList[i];
        this.backupPicResult.push(this.copy(element));
      }
    },
    copy(obj) {
      var newobj = {};
      for (var attr in obj) {
        newobj[attr] = obj[attr];
      }
      return newobj;
    },
    goToDetail(id) {
        this.$router.push({ path: `/detail/${id}` });
        localStorage.setItem("dishId", id);
        localStorage.setItem("channelType", 3);
        localStorage.setItem("userId", "");
    },
    recoveryFun(item, index) {
      this.UserDialogText = "确认识别的菜是“" + item.name + "”吗?";
      this.maskVisible = true;
      this.userDialogVisible = true;
      localStorage.setItem("recoveryData", JSON.stringify(item));
      localStorage.setItem("recoveryIndex", index);
    },
    dialogEnsure() {
      var optionss = localStorage.getItem("resultData");
      // var optionss = this.$route.params["resultData"];
      var ArrData = JSON.parse(optionss);
      var resultList = this.copy(ArrData[0]).resultList;
      var recoveryIndex = localStorage.getItem("recoveryIndex");
      // this.maskVisible = false;
      this.userDialogVisible = false;
      this.loadingVisible = true;
      this.backupPicResult.splice(recoveryIndex, 1);
      this.backupPicResult.unshift(this.firstPicResult[0]);
      this.firstPicResult[0] = this.copy(
        JSON.parse(localStorage.getItem("recoveryData"))
      );
      setTimeout(() => {
        this.maskVisible = false;
        this.loadingVisible = false;
        this.scrollTop();
      }, 300);
      var postData = {
          appid: 1,
          nonceStr: "asdasd",
          timestamp: "123456",
          data: {
            imageUrl: this.originalImageUrl,
            identifyDishName: this.firstPicResult[0].name,
            userDishName: JSON.parse(localStorage.getItem("recoveryData")).name,
            ossSign: localStorage.getItem("signature")
          },
          sign: "aaa"
      };
      jQuery.ajax({  
        type: "POST",  
        url: this.apiUrl + "/api/v1/dish/rectify",  
        data: JSON.stringify(postData),  
        contentType: "application/json; charset=utf-8",
        dataType: "json",  
        headers:{
          "channelType":3
        },
        success: function(data){  
          // console.log(data);
        }  
      }); 
    },
    dialogCancel() {
      this.maskVisible = false;
      this.userDialogVisible = false;
    },
    goToNewFoodPage() {
      this.$router.push({
        path: "/newfood"
      });
      localStorage.setItem("imageUrl", this.originalImageUrl);
      localStorage.setItem("identifyDishName", this.firstPicResult[0].name);
    },
    scrollTop() {
      var timer = null;
      cancelAnimationFrame(timer);
      timer = requestAnimationFrame(function fn() {
        var oTop =
          document.body.scrollTop || document.documentElement.scrollTop;
        if (oTop > 0) {
          document.body.scrollTop = document.documentElement.scrollTop =
            oTop - 50;
          timer = requestAnimationFrame(fn);
        } else {
          cancelAnimationFrame(timer);
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.position() {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.back-button {
  display: block;
  width: 52px;
  height: 52px;
  background: url(./black.png) no-repeat;
  background-size: contain;
  position: relative;
  left: 52px;
  top: 65px;
  padding-bottom:18px;
}
.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60%;
  font-size: 32px; /*px*/
}
.result-page {
  width: 1080px;
  // height: 100%;
  min-height: 1920px;
  background: #fdfdfd;
  position: relative;
  padding-bottom: 30px;
  .result-food-item {
    .result-item-top {
      position: relative;
      z-index: 100;
      width: 942px;
      height: 308px;
      margin: 0 auto;
      border-radius: 23px;
      background-color: #ffffff;
      box-shadow: 0 6px 58px 0 rgba(0, 0, 0, 0.1);
      margin-top: 95px;
      padding: 33px;
      .food-img {
        margin-right: 32px;
        float: left;
        img {
          width: 302px;
          height: 302px;
        }
      }
      .food-description {
        width: 600px;
        height: 100%; // background-color: #ccc;
        display: inline-block;
        .food-name {
          line-height: 87px;
          font-size: 62px;
          color: #584f60;
          margin-bottom: 10px;
        }
        .food-nutrition {
          .nutrition-item {
            width: 33.3%;
            height: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            float: left;
            .line-heat {
              width: 2px;
              height: 80px;
              background-color: #dddfe4;
              position: absolute;
              left: 250px;
              top: 130px;
              transform: rotate(25deg);
              -ms-transform: rotate(25deg); /* IE 9 */
              -moz-transform: rotate(25deg); /* Firefox */
              -webkit-transform: rotate(25deg); /* Safari 和 Chrome */
              -o-transform: rotate(25deg); /* Opera */
            }
            .line-fat {
              width: 2px;
              height: 80px;
              background-color: #dddfe4;
              position: absolute;
              left: 435px;
              top: 130px;
              transform: rotate(25deg);
              -ms-transform: rotate(25deg); /* IE 9 */
              -moz-transform: rotate(25deg); /* Firefox */
              -webkit-transform: rotate(25deg); /* Safari 和 Chrome */
              -o-transform: rotate(25deg); /* Opera */
            }
            span:first-child {
              font-family: BebasNeue;
              font-size: 66px;
              line-height: 103px;
              color: #1acefb;
              display: block;
            }
            span:last-child {
              font-family: PingFangSC-Regular;
              font-size: 32px;
              line-height: 45px;
              color: #737b91;
              margin-bottom: 20px;
              text-align: center;
              margin-right: -30px;
            }
          }
        }
        .food-nutrition-100 {
          width: 500px;
          height: 100%;
          span {
            font-family: PingFangSC-Regular;
            font-size: 32px;
            color: #dddfe4;
          }
        }
      }
    }
    .result-item-bottom {
      width: 920px;
      height: 200px;
      margin: 0 auto;
      margin-top: -50px;
      background: #ffffff;
      box-shadow: 0 6px 58px 0 rgba(0, 0, 0, 0.1);
      border-radius: 23.04px;
      .result-item-bottom-box {
        position: relative;
        top: 80px;
        font-size: 32px;
        color: #737b91;
        .confidence {
          position: relative;
          left: -290px;
          font-family: PingFangSC-Regular;
          span {
            font-family: HelveticaNeue;
            color: #1acefb;
          }
        }
        .identify-hot {
          position: relative;
          left: 30px;
          top: 30px;
        }
        .start-bar {
          margin-left: 190px;
          margin-top: -5px;
        }
        .share-btn {
          position: absolute;
          right: 30px;
          top: 30px;
          img {
            width: 54px;
            height: 56px;
          }
        }
      }
    }
  }
  .backup {
    .result-item-top {
      height: 250px;
      margin-top: 45px;
      .food-img {
        float: right;
        img {
          width: 245px;
          height: 245px;
        }
        .else-img {
          width: 245px;
          height: 245px;
          background-color: #a4a4a4;
        }
      }
      .food-description {
        margin-left: 40px;
        font-size: 0;
        .bule-line {
          position: absolute;
          left: 0;
          display: inline-block;
          width: 50px;
          height: 50px;
          border-left: solid #1acefb 2px;
          /*no*/
        }
        .food-name {
          height: 50px;
          font-size: 50px;
          margin-top: -20px;
          margin-bottom: 40px;
        }
        .food-nutrition {
          .nutrition-item {
            margin-left: -15px;
            span:first-child {
              font-family: PingFangSC-Medium;
              font-size: 40px;
              color: #5a7cb0;
              line-height: 70px;
            }
            span:last-child {
              margin-right: 0;
              margin-bottom: 30px;
            }
          }
        }
      }
    }
    .result-item-bottom {
      .result-item-bottom-box {
        .confidence {
          position: relative;
          left: 40px;
          top: 0px;
        }
        .share-btn {
          span {
            font-size: 40.32px;
            color: #737b91;
            position: relative;
            right: 10px;
            top: -15px;
          }
        }
      }
    }
  }
  .recovery {
    width: 855px;
    height: 115px;
    line-height: 115px;
    text-align: left;
    padding: 0 55px;
    margin: 70px auto;
    border-radius: 72px;
    box-shadow: 0 12px 29px 0 rgba(90, 124, 176, 0.34);
    font-size: 40px;
    color: #5a7cb0;
    cursor: pointer;
    font-family: PingFangSC-Regular;
    input {
      width: 100%;
      height: 100%;
      text-align: left;
    }
  }
}
</style>
