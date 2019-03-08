<template>
  <div class="search-page" v-title :data-title="title">
    <div class="search-top-box">
      <div class="search-border">
        <div class="search-input-border search-item">
          <span class="item search-item"></span>
          <form class="item input-item" action="#" >
            <input ref="foodName" type="search" maxlength="100"  placeholder="" v-model="dishName" v-on:keypress="searchSubmit" v-on:focus="getFocus" :style="{color:gray}"/>
          </form>
          <span class="item clear-item" v-on:click="clearInput" :style="{display:clear}"></span>
          <span class="item line-item"></span>
          <label class="item photo-item" >
              <input hidden type="file" id="image" accept="image/*" />
          </label>
        </div>
        <div class="search-item search-go-back" v-on:click="goBack">取消</div>
      </div>
    </div>  
    <div class="search-result">
      <ul class="search-result-list" :style="{display:look}">
        <li v-for="(item,index) in historyResult" v-bind:key="index">
          <span class="clock-item"></span>
          <span v-on:click="getItemName" class="text-item">{{item}}</span>
          <span class="clear-item" v-on:click="clearResultItem(index)"></span>
        </li>
      </ul>
      <p class="clear" v-on:click="clearResult" :style="{display:look}">
        <span class="remove-item"></span>
        清空搜索记录
      </p>
    </div>
    <div class="hot-search">
      <p class="hot-search-title">
        <span class="line-row"></span>
        热门搜索
      </p>
      <ul class="hot-list">
        <li v-for="(item,index) in hotList" :key="index">
          <p v-on:click="getDishDetail" :data-dish="item.id">{{item.name}}</p>
        </li>
      </ul>
    </div>
    <div class="search-match" :style="{display:match}"  v-on:touchstart="touchTap">
        <ul class="search-match-list" >
          <li v-for="(item,index) in matchList" v-bind:key="index">
            <p v-on:click="getItemName">{{item.name}}</p>
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
import router from "@/router"
import jQuery from 'jquery'
import Loading from "components/Loading/Loading"
import UserDialog from "components/UserDialog/UserDialog"
import Toast from "components/Toast/toast"
export default {
  name: 'SearchPage',
  data () {
    return {
      title: '查询菜品信息',
      look:'none',//搜索历史
      clear:'none',
      match:"none",
      gray:"#c7c5c5",
      isLoadingShow:false,
      maskVisible: false,
      userDialogVisible: false,
      UserDialogText: "",
      historyResult:[],
      matchList:[],
      hotList:[],
      dishName:""
    }
  },
  components:{
    Loading,
    UserDialog
  },
  watch:{
    dishName:{
      handler:function(val,oldval){  
        console.log(val);
        var len  = val.length;
        if(len >= 100){
          Toast("不能超过100个字符长度");
          return ;
        }
        this.matchSearchResult(val);  
      }, 
    },
    matchList:{
      handler:function(val,oldval){  
        console.log(val); 
      }, 
    },
    $route() {
        this.isLoadingShow = false,
        this.maskVisible =  false,
        this.userDialogVisible =  false
    }
  },
  props:[
    "apiUrl",//开发环境地址
    "picUrl",//测试环境地址
    "picViewUrl"
  ],
  mounted(){
    var that = this;
    this.getHotList(this.apiUrl);
    this.onloadImg();
    this.getHistorySearch();
  },
  methods:{
    onloadImg() {
      var _self = this;
      jQuery("#image").change(function(e) {
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
    },
    goBack(){
      router.push({path:"/"});
    },
    touchTap(){
      this.$refs.foodName.blur();
    },
    //清空搜索历史
    clearResult(){
      let arr = JSON.parse(localStorage.getItem("history"));
      arr.splice(0,arr.length);
      localStorage.setItem("history",JSON.stringify(arr));
      this.look = "none";
      this.match = "none";
    },
    //删除一条搜索历史
    clearResultItem(index){
      let arr = JSON.parse(localStorage.getItem("history"));
      arr.splice(index,1);
      this.historyResult = arr;
      localStorage.setItem("history",JSON.stringify(arr));
      if(arr.length == 0){
        this.look = "none";
      }
    },
    //点击历史或模糊匹配
    getItemName(e){
      let vl = e.target.innerText;
      let arr = [];
      this.$refs.foodName.value = vl;
      if(localStorage.getItem("history")){
        arr = JSON.parse(localStorage.getItem("history"));
      }
      if(arr.length > 9){
        arr.unshift(vl);
        arr.pop();
      }else{
        arr.unshift(vl);
      }
      localStorage.setItem("history",JSON.stringify(arr)) ;
      let hostUrl = this.apiUrl;
      router.push({name:'SearchResultPage',params:{dishName:vl}});
 
    },
    //热门搜索跳转详情
    getDishDetail(e){
      let vl = e.target.innerText;
      let id  = e.target.getAttribute("data-dish");
      let arr = [];
      // this.$refs.foodName.value = vl;
      if(localStorage.getItem("history")){
        arr = JSON.parse(localStorage.getItem("history"));
      }
      if(arr.length > 9){
        arr.unshift(vl);
        arr.pop();
      }else{
        arr.unshift(vl);
      }
      localStorage.setItem("history",JSON.stringify(arr)) ;
      let hostUrl = this.apiUrl;
      router.push({path: `/detail/${id}`});
      // this.$http.get(hostUrl+"/api/v1/dish/detail/"+id).then((res)=>{
      //   console.log(res);
      //   if(res.data.code === "0"){
      //       router.push({path: `/detail/${id}`});
      //   }else if(res.data.code === "20002"){
      //      Toast(res.data.msg);
      //     this.getHotList(this.apiUrl);
      //   }
      // }).catch((err)=>{
      // })
    },
    getFocus(e){
      // e.target.value = e.target.placeholder;
      // alert("聚焦");
    },
    //清空输入框
    clearInput(){
      this.dishName = "";
      this.clear = "none";
      this.matchList = "";
      this.match = "none";
      this.getHistorySearch();
    },
    // 获取历史记录
    getHistorySearch(){
      let arr = JSON.parse(localStorage.getItem("history"));
      if(arr == null){
        arr = [];
      }
      if(arr.length == 0){
        this.look = "none";
      }else{
        this.look = "block";
      }
      this.historyResult = this.unique(arr);
      localStorage.setItem("history",JSON.stringify(this.unique(arr))) ;
    },
    // 数组去重
    unique(arr){
      var res = [];
      for(var i=0; i<arr.length; i++){
        if(res.indexOf(arr[i]) == -1){
        res.push(arr[i]);
        }
      }
      return res;
    },
    //点击搜索-对应点击事件
    searchSubmit(e){
      let keyCode = e.keyCode;
      let hostUrl = this.apiUrl;
      let dishName = e.target.value || this.hotList[0].name;
      let arr = [];
      console.info(e.keyCode);
      if(keyCode === 13){
        e.preventDefault();
        if(localStorage.getItem("history")){
          arr = JSON.parse(localStorage.getItem("history"));
        }
        if(arr.length > 9){
          arr.unshift(dishName);
          arr.pop();
        }else{
          arr.unshift(dishName);
        }
        localStorage.setItem("history",JSON.stringify(arr));
        router.push({name:'SearchResultPage',params:{dishName:dishName}});
      }
    },
    //获取热门搜索词
    getHotList(hostUrl){
      this.$http.get(hostUrl+"/api/v1/search/hotSearch").then((res)=>{
        if(res.data.code == "0"){
          this.hotList = res.data.data;
          this.$refs.foodName.placeholder = this.hotList[0].name;
          localStorage.setItem("hotDish",this.hotList[0].name);
        }
      })
    },
    //模糊匹配-对应输入事件
    matchSearchResult(val){      
      this.gray = "#584F60";
      var hostUrl = this.apiUrl;
      var dishName = val;
      if(dishName  === ""){
        this.clear = "none";
        this.match = "none";
      }else{
        this.clear = "block";
        this.$http.get(hostUrl+"/api/v1/search/hints?name="+dishName).then((res)=>{
          if(res.data.code === "0"){
            this.matchList = res.data.data;
            this.match = "block";
          }else{
            this.matchList = "";
            this.match = "none";
          }          
        }).catch((err)=>{
          this.match = "block";
        })
      }
    },
    //获取字符串长度（汉字算两个字符，字母数字算一个）
    getByteLen(val){
      var len = 0;
      for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
          len += 2;
        }
        else {
          len += 1;
        }
      }
      return len;
    },
    showUserDialog(msg) {
      this.maskVisible = true;
      this.userDialogVisible = true;
      this.UserDialogText = msg;
    },
    closeUserDialo() {
      this.maskVisible = false;
      this.userDialogVisible = false;
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../common/less/base";
::-webkit-input-placeholder { /* WebKit browsers */
  color:#c7c5c5;
}
:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
  color:#c7c5c5;
}
::-moz-placeholder { /* Mozilla Firefox 19+ */
  color:#c7c5c5;
}
:-ms-input-placeholder { /* Internet Explorer 10+ */
  color:#c7c5c5;
}
.search-page{
  margin: 0 auto;
  width: 1080px;
  height: 100%;
  font-size: 15px;/*px*/
  position: relative;
}
.page-title{
  margin-top: 45px;
  font-size: 48px;
  color:#584F60;
  text-align: center;
}
.search-top-box{
  position: fixed;
  z-index: 99;
  width: 10rem;
  padding-top: 30px;
  padding-bottom: 30px;
  background: #fff;
  // border-bottom: 1px solid #f2f2f2;/*no*/
}
.search-border{
  display: flex;
  display: -webkit-flex;
  align-items: center;
  -webkit-align-items: center;
  width: 980px;
  height: 83px;
  margin: 0 auto;
  .search-item{
    flex: 1 1 auto;
    -webkit-flex: 1 1 auto;
  }
  .search-go-back{
    flex: 0 0 auto;
    -webkit-flex: 0 0 auto;
    padding-left:30px;
    font-size: 40px;
  }
  .search-input-border{
    display: flex;
    display: -webkit-flex;
    align-items: center;
    -webkit-align-items: center;
    padding:15px 30px;
    background: #ECF6F9;
    .borderRadius(30px);
    .search-item{
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      margin-right: 20px;
      width:45px;
      height: 45px;
      background: url("./search_icon.png") 100% 100% no-repeat;
      background-size: contain;
    }
    .input-item{
      flex: 1 1 auto;
      -webkit-flex: 1 1 auto;
      padding-left: 20px;
      font-size:40px;
      background: inherit;
      border-left: 1px solid  #DDDFE4;
      input{
        width: 100%;
        background: inherit;
        outline: none;
        -webkit-appearance:none;
        // color: #584F60;
        &[type=search]::-webkit-search-cancel-button{
          display: none;
        }
      }
    }
    .photo-item{
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width:50px;
      height: 45px;
      background: url("./photo_icon.png") 100% 100% no-repeat;
      background-size: cover;
      background-position: bottom;
    }
    .clear-item{
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width:45px;
      height: 45px;
      margin: 0 20px;
      background: url("./close_icon_2.png") 100% 100% no-repeat;
      background-size: cover;
    }
    .line-item{
      flex: 0 0 auto;
      -webkit-flex: 0 0 auto;
      display: inline-block;
      width:1px;/*no*/
      height: 40px;
      margin-right: 20px;
      background:#DDDFE4; 
    }
  }
}
//模糊匹配
.search-match{
  position: fixed;
  top:123px;
  bottom: 0;
  width:1080px;
  background: #fff;
  z-index: 99;
  overflow: auto;
  .search-match-list{
    width: 980px;
    margin: 0 auto;
    li{
      color: #584F60;
      font-size: 40px;
      border-bottom: 1px solid #eee;
      p{
        padding:30px 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
.search-result{
  padding-top: 128px;
  .search-result-list{
    width: 980px;
    max-height: 350px;
    overflow-y: scroll;
    margin: 0 auto;
    li{
      display: flex;
      display: -webkit-flex;
      align-items: center;
      -webkit-align-items: center;
      padding:30px 0;
      color: #584F60;
      border-bottom: 1px solid #eee;
    }
    .clock-item{
      flex: 0 0 auto;
      display: inline-block;
      margin-right: 26px;
      width:46px;
      height: 46px;
      background: url("~@/assets/images/clock_icon.png") 100% 100% no-repeat;
      background-size: contain;
    }
    .text-item{
      flex: 1 1 auto;
      font-size: 40px;
      padding-left: 15px;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      overflow: hidden;
    }
    .clear-item{
      flex: 0 0 auto;
      display: inline-block;
      width:46px;
      height: 46px;
      background: url("./close_icon_1.png") 100% 100% no-repeat;
      background-size: cover;
    }
  }
  .clear{
    width: 980px;
    margin:0 auto;
    padding: 30px 0;
    font-size: 40px;
    text-align: center;
    color: #666;
    border-bottom: 1px solid #eee;
    .remove-item{
      display: inline-block;
      width:49px;
      height: 43px;
      vertical-align: bottom;
      background: url("./archive_icon.png") 100% 100% no-repeat;
      background-size: cover;
    }
  }
}
.hot-search{
  margin: 82px auto 0 auto;
  width: 980px;
  .hot-search-title{
    color:#584F60 ;
    font-size:40px; 
    .line-row{
      display: inline-block;
      width: 12px;
      height: 45px;
      margin-right: 10px;
      background: #1ACEFB;
      vertical-align: middle;
    }
  }
  .hot-list{
    li{
      float: left;
      padding: 22px 28px 22px 0;
      p{
        padding:14px 40px;
        font-size: 40px;
        color: #584F60;
        background: #eee;
        word-break:break-all;
        .borderRadius(30px);
      }
    }
  }
}
</style>
