<template>
    <div class="index-page" v-title :data-title="title">
      <div class="index-page-bottom">
        <ul>
          <li v-on:click="goToHelp">
            <span class="index-icon-help"></span>
          </li>
          <li>
            <label>
              <input class="index-photo" type="file" accept="image/*" />
            </label>
          </li>
          <li v-on:click="goToSearch">
              <span class="index-icon-search"></span>
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
import Vue from "vue";
import lrz from "lrz";
import { setTimeout } from "timers";
import { setCookie ,getCookie} from "common/js/util";
import Loading from "components/Loading/Loading";
import UserDialog from "components/UserDialog/UserDialog";
import Toast from "components/Toast/toast";
export default {
  name: "MainPage",
  data() {
    return {
      title: "菜品识别",
      sysCheck: true,
      maskVisible: false,
      userDialogVisible: false,
      UserDialogText: "",
      isLoadingShow: false
    };
  },
  props: [
    "apiUrl" //动态配置环境地址
  ],
  components: {
    Loading,
    UserDialog,
    Toast
  },
  watch: {
    $route() {
      this.isLoadingShow = false;
      this.userDialogVisible = false;
      this.maskVisible = false;
    }
  },
  mounted() {
    // this.initApp(this.apiUrl);
    this.onloadImg();
  },
  methods: {
    goToHelp() {
      // jQuery("#picture").trigger("click");
      router.push({ path: "/help" });
    },
    goToSearch() {
      router.push({ path: "/search" });
    },
    //04-12添加-初始化接口
    initApp(hostUrl) {
      console.log(returnCitySN["cip"] + "," + returnCitySN["cname"]);
      // alert(returnCitySN["cip"]+','+returnCitySN["cname"]);
      this.$http
        .post(hostUrl + "/api/v1/dish/init", {
          userId: returnCitySN["cip"],
          province: returnCitySN["cname"].split("省")[0],
          city: returnCitySN["cname"].split("省")[1]
        })
        .then(res => {
          // console.log(res);
        });
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
    onloadImg() {
      var _self = this;
      jQuery(".index-photo").change(function(e) {
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
              window.localStorage.setItem("dataUrl",ret.base64);
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
input[type="file"] {
  display: none;
}
.index-page {
  width: 1080px;
  height: 100%;
  position: relative;
  background: url("./background_index.png") 100% 100% no-repeat;
  background-size: cover;
  background-position: top center;
}
.index-page-bottom {
  position: absolute;
  bottom: 165px;
  width: 100%;
  ul {
    display: flex;
    display: -webkit-flex;
    align-items: baseline;
    -webkit-align-items: baseline;
    width: 85%;
    margin: 0 auto;
    li {
      flex: 1 1 auto;
      -webkit-flex: 1 1 auto;
      padding: 10px 5px;
      box-sizing: border-box;
      text-align: center;
      &:first-child {
        text-align: right;
      }
      &:last-child {
        text-align: left;
      }
      label {
        display: inline-block;
        width: 150px;
        height: 120px;
        background: url("./photo_index.png") 100% 100% no-repeat;
        background-size: cover;
        background-position-x: 10px;
      }
      .index-icon-search {
        display: inline-block;
        width: 60px;
        height: 60px;
        background: url("./search_index.png") 100% 100% no-repeat;
        background-size: cover;
      }
      .index-icon-help {
        display: inline-block;
        width: 60px;
        height: 60px;
        background: url("./help_index.png") 100% 100% no-repeat;
        background-size: cover;
      }
    }
  }
}

</style>
