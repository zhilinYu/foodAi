<template>
  <div class="search-result-page" v-title :data-title="title">
    <div class="search-top-box">    
      <div class="search-border">
        <div class="search-item search-go-last" v-on:click="goLast" :style="{display:backIcon}"></div>
          <div class="search-input-border search-item">
            <span class="item search-item"></span>
            <form class="item input-item" action="#" >
              <input ref="foodName" type="search" placeholder="" maxlength="100" v-on:keypress="searchSubmit"  v-on:input="matchSearchResult" v-on:focus="getFocus"/>
            </form>
            <span class="item clear-item" v-on:click="clearInput" :style="{display:clear}"></span>
            <span class="item line-item"></span>
            <label class="item photo-item">
              <input hidden type="file" id="picImage" accept="image/*"/>
            </label>
          </div>
          <div class="search-item search-go-back" v-on:click="goBack" :style="{display:match}">取消</div>
        </div>
      </div>
      <div class="search-match" :style="{height:h}">
        <ul class="search-match-list" v-infinite-scroll="loadMore"  infinite-scroll-distance="80" infinite-scroll-immediate-check="true">
          <li v-for="(item,index) in resultList" :key="index" :data-dish="item.id" v-on:click="getDishDetail(item.id)">
            <div class="picture-item">
              <img v-if="item.imageUrl" :src="item.imageUrl"/>
            </div>
            <div class="text-item">
              <p class="text-title">{{item.name}}</p>
              <p class="text-tip">
                <span v-if="item.trafficLight == 0" class="g-tip">绿灯食物-推荐</span>
                <span v-else-if="item.trafficLight == 1" class="y-tip">黄灯食物-适量</span>
                <span v-else class="r-tip">红灯食物-少量</span>
              </p>
              <p class="text-info">{{item.note}}</p>
              <p class="text-power">
                <span>热量 {{item.heatQuantify}}千卡</span>
                <span>脂肪 {{item.fat}}克</span>
                <span>蛋白质 {{item.protein}}克</span>
              </p>
            </div>
          </li>          
        </ul>
        <div class="no-more" v-show="noMore">- &nbsp;没有更多了&nbsp; -</div>    
        <div class="" v-show="isLoad">
          <div id="loading-box">
                <div class="object" id="object_one"></div>
                <div class="object" id="object_two"></div>
                <div class="object" id="object_three"></div>
          </div>
          <div class="loading-tips">加载中...</div>
        </div>
        <div class="loading-tips" v-show="loadFail">加载失败</div>
        <div class="search-mohu" :style="{display:match}" v-on:touchstart="touchTap">
            <ul class="search-mohu-list" >
              <li v-for="(item,index) in matchList" v-bind:key="index">
                <p v-on:click="getItemName" class="text-item">{{item.name}}</p>
              </li>
            </ul>
        </div>

      </div>
      <div class="clear" :style="{display:look}">
        <p>
            <span class="remove-item"></span>
          没有查询到相关菜品
          </p>
          <p>-&nbsp;END&nbsp;-</p>
      </div>
      <div class="hot-search" :style="{display:look}">
        <p class="hot-search-title">
          <span class="line-row"></span>
          热门搜索
        </p>
        <ul class="hot-list">
          <li v-for="(item,index) in hotList" :key="index">
            <p v-on:click="getDishDetail(item.id)" :data-dish="item.id">{{item.name}}</p>
          </li>
        </ul>
      </div>
    <transition name="fade">
      <div id="mask" v-show="maskVisible">
        <user-dialog class="user-dialog" v-show="userDialogVisible" :leftbtn="''" :text="UserDialogText" @dialogEnsure="closeUserDialo"  @dialogCancel="closeUserDialo"/>
        <loading class="loading" :tipsText="'正在加载...'" v-show="isLoadingShow"/>
      </div>
    </transition>
  </div>
</template>
<script>
import jQuery from "jquery";
import router from "@/router";
import Loading from "components/Loading/Loading";
import UserDialog from "components/UserDialog/UserDialog";
import Toast from "components/Toast/toast";
import { setTimeout } from "timers";
// import Vue from 'vue'
// import {InfiniteScroll } from 'mint-ui'
// Vue.use(InfiniteScroll);
export default {
  name: "",
  data() {
    return {
      title: "搜索结果",
      pageNum: 0, //总共页数
      currPage: 1, //当前请求页
      gray: "#c7c5c5",
      isLoad: false, //加载样式
      noMore: false, //列表末端没有更多提醒
      isMore: false, //没有更多了
      loadFail: false, //加载失败
      tips: "努力加载中...",
      clear: "none",
      match: "none", //模糊匹配显示
      backIcon: "block",
      look: "none",
      resultList: [],
      matchList: [],
      hotList: [], //热门菜品
      isLoadingShow: false, //图片loading
      maskVisible: false,
      userDialogVisible: false,
      UserDialogText: "",
      h: "100%",
      opTime: ""
    };
  },
  watch:{
    $route() {
        this.isLoadingShow = false,
        this.maskVisible =  false,
        this.userDialogVisible =  false
    }
  },
  components: {
    Loading,
    UserDialog,
    Toast
  },
  props: ["apiUrl", "picViewUrl"],
  created() {},
  mounted() {
    this.getSearchList();
    this.onloadImg();
  },
  methods: {
    //调用相机相册获取图片
    onloadImg() {
      var _self = this;
      jQuery("#picImage").change(function(e) {
        if (this.files && this.files[0]) {
          lrz(this.files[0]).then(ret => {
            var type = this.files[0].type,
              regImage = /^image\/(jpeg|png|jpg|bmp)$/,
              file = this.files[0],
              oimg = new Image();
            oimg.src = ret.base64;
            if (!regImage.test(type)) {
              Toast("不支持的图片类型");
              return false;
            }
            oimg.onload = function() {
              if (oimg.width < 100 || oimg.height < 100) {
                _self.showUserDialog("图片太小，不能识别~");
                return false;
              }
              _self.maskVisible = true;
              _self.isLoadingShow = true;
              window.localStorage.setItem("dataUrl", ret.base64);
              setTimeout(function() {
                router.push({
                  path: "/clipper",
                  name: "ClipperPage",
                  query: {
                    // dataUrl: ret.base64,
                    filename: file.name,
                    filesize: file.size
                  }
                });
              }, 1000);
            };
          });
        }
      });
    },
    touchTap() {
      this.$refs.foodName.blur();
    },
    // 返回主页
    goBack() {
      this.match = "none";
      this.backIcon = "block";
      this.$refs.foodName.value = this.$route.params.dishName;
      document.getElementsByTagName("html")[0].style.overflow = "auto";
      document.getElementsByTagName("html")[0].style.position = "static";
    },
    // 返回上一页
    goLast() {
      router.push({ path: "/" });
    },
    // 获取焦点
    getFocus(e) {
      this.matchSearchResult(e);
    },
    // 清空输入框
    clearInput() {
      // this.matchList = "";
      // this.clear = "none";
      router.push({ path: "/search" });
    },
    //点击搜索
    searchSubmit(e) {
      let keyCode = e.keyCode;
      let hostUrl = this.apiUrl;
      let dishName = e.target.value;
      this.noMore = false;
      this.currPage = 1;
      let arr = [];
      console.log(dishName);
      if (keyCode === 13) {
        e.preventDefault();
        if (localStorage.getItem("history")) {
          arr = JSON.parse(localStorage.getItem("history"));
        }
        if (arr.length > 9) {
          arr.unshift(dishName);
          arr.pop();
        } else {
          arr.unshift(dishName);
        }
        localStorage.setItem("history", JSON.stringify(arr));
        if (dishName == "") {
          return;
        }
        this.clear = "none";
        this.$refs.foodName.blur();
        router.push({
          name: "SearchResultPage",
          params: { dishName: dishName }
        });
        this.$http
          .post(hostUrl + "/api/v1/search/list", {
            data: { name: dishName, operationTime: this.opTime },
            curPage: 1,
            pageSize: 15
          })
          .then(res => {
            console.log(res);
            if (res.data.code === "0") {
              this.$data.resultList = "";
              var dataList = res.data.data.data;
              if (dataList.length == 0) {
                this.look = "block";
                this.noMore = false;
                this.match = "none";
                this.backIcon = "block";
                this.getHotList(hostUrl);
                // this.h = 0;
              } else {
                this.look = "none";
                this.resultList = dataList;
                console.log(this.currPage);
                this.pageNum = res.data.data.pageCount;
                this.match = "none";
                this.backIcon = "block";
                // this.h = "100%";
                if (res.data.data.pageCount === 1) {
                  this.noMore = true;
                }
              }
              document.getElementsByTagName("html")[0].style.overflow = "auto";
              document.getElementsByTagName("html")[0].style.position =
                "static";
            }
          })
          .catch(err => {});
      }
    },
    //点击模糊匹配项搜索菜品
    getItemName(e) {
      let vl = e.target.innerText;
      let arr = [];
      this.$refs.foodName.value = vl;
      let hostUrl = this.apiUrl;
      this.match = "none";
      this.backIcon = "block";
      this.clear = "none";
      this.currPage = 1;
      if (localStorage.getItem("history")) {
        arr = JSON.parse(localStorage.getItem("history"));
      }
      if (arr.length > 9) {
        arr.unshift(vl);
        arr.pop();
      } else {
        arr.unshift(vl);
      }
      localStorage.setItem("history", JSON.stringify(arr));
      router.push({ name: "SearchResultPage", params: { dishName: vl } });
      this.$http
        .post(hostUrl + "/api/v1/search/list", {
          data: { name: vl, operationTime: this.opTime },
          curPage: 1,
          pageSize: 15
        })
        .then(res => {
          console.log(res);
          if (res.data.code === "0") {
            var dataList = res.data.data.data;
            if (dataList.length === 0) {
              this.look = "block";
              this.noMore = false;
              this.getHotList(hostUrl);
            } else {
              this.$data.resultList = dataList;
              this.pageNum = res.data.data.pageCount;
              this.matchList = "";
              if (res.data.data.pageCount === 1) {
                this.noMore = true;
              }
            }
          } else if (res.data.code == "-1") {
          }
        })
        .catch(err => {});
    },
    //获取搜索列表
    getSearchList() {
      let hostUrl = this.apiUrl;
      let dishName = this.$route.params.dishName;
      let nowData = new Date();
      let yyyy = this.formatTime(nowData);
      this.$refs.foodName.value = dishName;
      this.$http
        .post(hostUrl + "/api/v1/search/list", {
          data: { name: dishName, operationTime: yyyy },
          curPage: 1,
          pageSize: 15
        })
        .then(res => {
          if (res.data.code === "0") {
            var dataList = res.data.data.data;
            if (dataList.length == 0) {
              this.look = "block";
              this.noMore = false;
              this.getHotList(hostUrl);
            } else {
              this.$data.resultList = res.data.data.data;
              this.pageNum = res.data.data.pageCount;
              this.opTime = res.data.data.operationTime;
              this.matchList = "";
              if (res.data.data.pageCount === 1) {
                this.noMore = true;
              }
            }
          }
        })
        .catch(err => {});
    },
    //获取热门搜索词
    getHotList(hostUrl) {
      this.$http
        .get(hostUrl + "/api/v1/search/hotSearch")
        .then(res => {
          console.log(res);
          if (res.data.code == "0") {
            this.hotList = res.data.data;
          }
        })
        .catch(err => {});
    },
    //热门搜索跳转详情
    getDishDetail(dishId, e) {
      let id = dishId || e.target.getAttribute("data-dish");
      router.push({ path: `/detail/${id}` });
    },
    //模糊匹配
    matchSearchResult(e) {
      var hostUrl = this.apiUrl;
      var dishName = e.target.value;
      if (dishName === "") {
        // this.clear = "none";
        // this.look = "none";
        // this.match = "block";
        // this.matchList = "";
        // this.backIcon = "none";
        router.push({ path: "/search" });
      } else {
        this.clear = "block";
        this.backIcon = "none";
        this.$http
          .get(hostUrl + "/api/v1/search/hints?name=" + dishName)
          .then(res => {
            console.log(res);
            if (res.data.code === "0") {
              var dataList = res.data.data;
              if (dataList.length == 0) {
                this.match = "block";
              } else {
                this.matchList = res.data.data;
                this.match = "block";
              }
              document.getElementsByTagName("html")[0].style.overflow =
                "hidden";
              document.getElementsByTagName("html")[0].style.position = "fixed";
            } else {
              this.matchList = "";
              this.match = "none";
              document.getElementsByTagName("html")[0].style.overflow = "auto";
              document.getElementsByTagName("html")[0].style.position =
                "static";
            }
          })
          .catch(err => {});
      }
    },
    // 加载更多
    loadMore() {
      var hostUrl = this.apiUrl;
      let dishName = this.$refs.foodName.value;
      if (this.currPage <= this.pageNum) {
        this.currPage++;
        this.isLoad = true;
        this.noMore = false;
        this.$http
          .post(hostUrl + "/api/v1/search/list", {
            data: { name: dishName, operationTime: this.opTime },
            curPage: this.currPage,
            pageSize: 15
          })
          .then(res => {
            if (res.data.code == "0") {
              var dataList = res.data.data.data;
              dataList.forEach((item, index) => {
                this.resultList.push(item);
              });
              this.isLoad = false;
              this.loadFail = false;
              if (dataList.length < 15) {
                this.noMore = true;
              }
            } else if (res.data.code == "-1") {
            }
          })
          .catch(err => {
            this.loadFail = true;
            this.isLoad = false;
          });
      }
    },
    showUserDialog(msg) {
      this.maskVisible = true;
      this.userDialogVisible = true;
      this.UserDialogText = msg;
    },
    closeUserDialo() {
      this.maskVisible = false;
      this.userDialogVisible = false;
    },
    formatTime(date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();
      return (
        [year, month, day].map(this.formatNumber).join("-") +
        " " +
        [hour, minute, second].map(this.formatNumber).join(":")
      );
    },
    formatNumber(n) {
      n = n.toString();
      return n[1] ? n : "0" + n;
    }
  }
};
</script>
<style lang="less" scoped>
@import "../../common/less/base";
::-webkit-input-placeholder {
  /* WebKit browsers */
  color: #c7c5c5;
}
:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #c7c5c5;
}
::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #c7c5c5;
}
:-ms-input-placeholder {
  /* Internet Explorer 10+ */
  color: #c7c5c5;
}
.search-result-page {
  width: 1080px;
  height: 100%;
  font-size: 15px; /*px*/
  background: #fff;
  position: relative;
}
.page-title {
  margin-top: 45px;
  font-size: 48px;
  color: #584f60;
  text-align: center;
}
.search-top-box {
  position: fixed;
  z-index: 99;
  width: 10rem;
  padding-top: 30px;
  padding-bottom: 30px;
  background: #fff;
  border-bottom: 1px solid #f2f2f2; /*no*/
}
.search-border {
  display: flex;
  display: -webkit-flex;
  align-items: center;
  -webkit-align-items: center;
  width: 980px;
  height: 83px;
  margin: 0 auto;
  .search-item {
    flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
  }
  .search-go-back {
    flex: 0 0 auto;
    -webkit-flex: 0 0 auto;
    padding-left: 30px;
    font-size: 40px;
  }
  .search-go-last {
    flex: 0 0 auto;
    -webkit-flex: 0 0 auto;
    display: inline-block;
    width: 45px;
    height: 56px;
    margin-right: 20px;
    background: url("./last_icon.png") 100% 100% no-repeat;
    background-size: cover;
  }
  .search-input-border {
    display: flex;
    display: -webkit-flex;
    align-items: center;
    -webkit-align-items: center;
    padding: 15px 30px;
    background: #ecf6f9;
    .borderRadius(30px);
    .search-item {
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      margin-right: 20px;
      width: 45px;
      height: 45px;
      background: url("./search_icon.png") 100% 100% no-repeat;
      background-size: contain;
    }
    .input-item {
      flex: 1 1 auto;
      -webkit-flex: 1 1 auto;
      padding-left: 20px;
      font-size: 40px;
      background: inherit;
      border-left: 1px solid #dddfe4;
      input {
        width: 100%;
        background: inherit;
        outline: none;
        -webkit-appearance: none;
        color: #666;
        &[type="search"]::-webkit-search-cancel-button {
          display: none;
        }
      }
    }
    .photo-item {
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width: 50px;
      height: 45px;
      background: url("./photo_icon.png") 100% 100% no-repeat;
      background-size: cover;
    }
    .clear-item {
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width: 45px;
      height: 45px;
      margin: 0 20px;
      background: url("./close_icon_2.png") 100% 100% no-repeat;
      background-size: cover;
    }
    .line-item {
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width: 1px; /*no*/
      height: 40px;
      margin-right: 20px;
      background: #dddfe4;
    }
  }
}

//模糊匹配
.search-mohu {
  position: fixed;
  z-index: 99;
  top: 123px;
  bottom: 0;
  width: 10rem;
  background: #fff;
  overflow: auto;
  .search-mohu-list {
    width: 980px;
    margin: 0 auto;
    li {
      color: #584f60;
      font-size: 40px;
      border-bottom: 1px solid #eee;
      p {
        padding: 30px 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
// 搜索匹配列表
.search-match {
  position: relative;
  height: 100%;
  padding-top: 108px;
  box-sizing: border-box;
  font-size: 12px; /*px*/
  background: #f9f9f9;
  .search-match-list {
    margin-top: 30px;
    // overflow: auto;
    li {
      position: relative;
      margin-top: 30px;
      padding: 36px 42px;
      background: #fff;
      &:first-child {
        margin-top: 0;
      }
    }
    .picture-item {
      position: absolute;
      width: 270px;
      height: 216px;
      background: #eee;
      img {
        width: 100%;
        height: 100%;
        background: #f9f9f9;
      }
    }
    .text-item {
      padding-left: 300px;
      font-size: 40px;
      p {
        line-height: 55px;
      }
      .text-title {
        font-size: 40px;
        color: #584f60;
      }
      .text-tip {
        font-size: 32px;
        color: #fff;
        span {
          display: inline-block;
          padding: 0 20px;
          .borderRadius(3px);
        }
        .y-tip {
          background: #ffb806;
        }
        .r-tip {
          background: #f95424;
        }
        .g-tip {
          background: #40d19e;
        }
      }
      .text-info {
        height: 60px;
        font-size: 32px;
        color: #1acefb;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        // -moz-binding:url('./ellipsis.xml#ellipsis');
        overflow: hidden;
      }
      .text-power {
        display: flex;
        display: -webkit-flex;
        font-size: 32px;
        color: #737b91;
        span {
          flex: 1 1 auto;
          -webkit-flex: 1 1 auto;
        }
      }
    }
  }
  .infinite-scroll {
    text-align: center;
  }
  .loading-circular {
    width: 80px;
    height: 80px;
    margin-right: 20px;
    vertical-align: middle;
  }
  .no-more {
    padding-top: 44px;
    padding-bottom: 50px;
    font-size: 29px;
    text-align: center;
    color: #dddfe4;
  }
}
//热门搜索
.hot-search {
  margin: 82px auto 0 auto;
  width: 980px;
  .hot-search-title {
    color: #584f60;
    font-size: 40px;
    .line-row {
      display: inline-block;
      width: 12px;
      height: 45px;
      margin-right: 10px;
      background: #1acefb;
      vertical-align: middle;
    }
  }
  .hot-list {
    li {
      float: left;
      padding: 22px 28px 22px 0;
      p {
        padding: 14px 40px;
        font-size: 40px;
        color: #584f60;
        background: #eee;
        .borderRadius(30px);
      }
    }
  }
}
.clear {
  width: 980px;
  margin: 0 auto;
  padding: 30px 0;
  text-align: center;
  .remove-item {
    display: inline-block;
    width: 48px;
    height: 44px;
    background: url("./basket_icon.png") 100% 100% no-repeat;
    background-size: contain;
  }
  p {
    &:first-child {
      color: #666;
      font-size: 40px;
      border-bottom: 1px solid #dddfe4;
    }
    padding: 38px 0;
    color: #dddfe4;
  }
}
#loading-box {
  width: 1080px;
  height: 135px;
  margin: 0 auto;
  z-index: 104;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  -webkit-justify-content: center;
  align-items: center;
  -webkit-align-items: center;
}
.loading-tips {
  padding-bottom: 50px;
  font-family: PingFangSC-Medium;
  color: #584f60;
  letter-spacing: 0;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}
.object {
  width: 75px;
  height: 75px;
  float: left;
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
  75% {
    -webkit-transform: scale(0.5);
  }
}
@keyframes object_one {
  75% {
    transform: scale(0.5);
    -webkit-transform: scale(0.5);
  }
}
@-webkit-keyframes object_two {
  75% {
    -webkit-transform: scale(0.5);
  }
}
@keyframes object_two {
  75% {
    transform: scale(0.5);
    -webkit-transform: scale(0.5);
  }
}
@-webkit-keyframes object_three {
  75% {
    -webkit-transform: scale(0.5);
  }
}
@keyframes object_three {
  75% {
    transform: scale(0.5);
    -webkit-transform: scale(0.5);
  }
}
</style>
