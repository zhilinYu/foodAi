<template>
  <div class="detail-page" v-title :data-title="title">
    <div class="header" :style="ispc"><span class="back-icon" v-on:click="goBack" ></span></div>
    <div class="detail-title">
        
        <img v-if="dishDetail.imgUrl" :src="dishDetail.imgUrl" alt="">
        <!-- <img v-else src="./detail_background.png" alt=""> -->
    </div>
    <div class="detail-body">
        <div class="detail-info">
          <div class="detail-info-title">
            {{dishDetail.name}}
          </div>
           <span v-if="dishDetail.trafficLight==0" class="detail-info-icon color-b-g">绿灯食物-推荐</span>
           <span v-else-if="dishDetail.trafficLight==1" class="detail-info-icon color-b-y">黄灯食物-适量</span>
           <span v-else class="detail-info-icon color-b-r">红灯食物-少量</span>
            <div class="detail-info-des">
              {{dishDetail.note}}
            </div>
            <div class="detail-info-hot">
              识别热度<star :score0="dishDetail.identifyHeat"></star>
            </div>
        </div>
        <div class="detail-info">
          <div class="detail-info-cal"><span v-on:click="fadeUpUnit">重量{{rulerVal}}g<span class="more-icon"></span></span></div>
          <div class="detail-info-block">
            <div class="detail-info-data">
              <p class="color-t-b">{{dishDetail.heatQuantify}}</p>
              <p class="detail-data-unit">千卡</p>
            </div>
            <div class="detail-info-data" ref="cookes">             
            </div>
          </div>
          <div class="detail-info-more">
            <span v-on:click="goMore"> 更多营养元素<span class="more-icon"></span></span>
          </div>
        </div>
    </div>
    <div class="detail-bottom">
      <div class="detail-bottom-title">
        摄入<span class="orange-item">{{dishDetail.heatQuantify}}</span>千卡热量需要做以下运动来消耗
      </div>
      <div class="detail-bottom-list">
        <ul class="detail-bottom-item">
          <li><img src="./behavior_0.png" alt=""><p>走路{{sportsTime(dishDetail.heatQuantify,4)}}分钟</p></li>
          <li><img src="./behavior_1.png" alt=""><p>跑步{{sportsTime(dishDetail.heatQuantify,10)}}分钟</p></li>
          <li><img src="./behavior_2.png" alt=""><p>游泳{{sportsTime(dishDetail.heatQuantify,5)}}分钟</p></li>
          <li><img src="./behavior_3.png" alt=""><p>骑行{{sportsTime(dishDetail.heatQuantify,3)}}分钟</p></li>
          <li><img src="./behavior_4.png" alt=""><p>跳绳{{sportsTime(dishDetail.heatQuantify,7)}}分钟</p></li>
          <li><img src="./behavior_7.png" alt=""><p>篮球{{sportsTime(dishDetail.heatQuantify,7)}}分钟</p></li>
          <li><img src="./behavior_5.png" alt=""><p>滑雪{{sportsTime(dishDetail.heatQuantify,7)}}分钟</p></li>
          <li><img src="./behavior_6.png" alt=""><p>力量{{sportsTime(dishDetail.heatQuantify,4)}}分钟</p></li>
        </ul>
      </div>
    </div>
    <div class="ruler-block" v-bind:class="{fadeInUp:isActive,animated:isActive}" v-bind:style="{display:look}">
        <div class="calc-title">
          <p class="calc-name">{{dishDetail.name}}</p>
          <p class="calc-standard">{{calcHeatQuantify}}大卡/100克</p>
          <p class="calc-fn" v-on:click="goEstimate"><span class="calc-icon"></span>估算方法</p>
          <span class="close-icon" v-on:click="fadeOutUnit"></span>
        </div>
        <div style="width:100%;">
          <div id="heart-contain" :class="{'heart-contain':isRule}" style="width:100%;float:right;background:#f9f9f9"></div>			
        </div>
        <div class="calc-val">
          <span class="calc-num" :data-index="calcIndexVal.heatIndexVal">{{dishDetail.heatQuantify}}千卡</span>
          <span class="calc-unit">克<span class="gram-icon"></span></span>
        </div>
        <div class="sure-btn" v-on:click="refreshData">确定</div>
    </div>
    <div class="over-view" v-bind:class="{fadeIn:isActive,animated:isActive}"  v-bind:style="{display:look}"></div>
  </div>
</template>
<script>
// require("../../common/js/hidpi-canvas.min");
var echarts = require("echarts");
require("../../common/js/ruler");
import Star from '../Star/Star';
import router from '@/router';
import Toast from "components/Toast/toast"
import httpRequest from "../../common/js/util"
export default {
  data(){
    return{
      title:'菜品详情',
      isActive:true,
      look:'none',
      dishDetail:{
        imgUrl:"",
        name:"",
        trafficLight:"",
        note:"",
        identifyHeat:2,/*热度*/
        heatQuantify:0,/*热量*/
        fat:0,/*脂肪*/
        protein:0,/*蛋白质*/
        carbohydrate:0,/*碳水化合物*/
      },
      calcHeatQuantify:0,
      rulerVal:100,
      rulerObj:{},
      calcIndexVal:{
        heatIndexVal:0,
        fatIndexVal:0,
        proteinIndexVal:0,
        carbohydrateIndexVal:0,
      },
      pathUrl:"/result",
      ispc:{
        position:"fixed"
      },
      isRule:false
    }
  },
  props:[
    "apiUrl",//动态配置环境地址
    "picViewUrl"
  ],
  components:{
    Toast
  },
  created(){
    this.getDishDetail(this.apiUrl,this.$route.params.dishId);
    this.isRule = true; 
    var isSupportTouch = "ontouchend" in document ? true : false;
    if(!isSupportTouch){
      this.ispc.position = "absolute"; 
      this.isRule = true;     
    }
  },
  mounted(){      
    // cookChart.resize();
    this.$data.rulerObj = new Ruler("heart-contain",{
      maxNum:"500",        	//最大数值
      minNum:"1",			//最小数值
      initNum:"100",     		//初始数值
      decimalWei:"0",			//保留几位有效小数；默认为零
      cellNum:"10",			//两个大刻度的数值区间
      // name:"心率",				//名称
      // unit:"bpm"				//单位
    });
  },

  methods:{
    fadeUpUnit(){
      this.$data.look = 'block';
      this.$data.isActive = true;
      this.$data.rulerObj.syncData(parseInt(this.rulerVal));
      this.dishDetail.heatQuantify =this.dishDetail.heatQuantify;
      document.getElementsByTagName("html")[0].style.overflow ="hidden";
      document.getElementsByTagName("html")[0].style.position = "fixed";
    },
    fadeOutUnit(){
      this.$data.look = 'none';
      this.$data.isActive = false;
      document.getElementsByTagName("html")[0].style.overflow = "auto";
      document.getElementsByTagName("html")[0].style.position = "static";
    },
    getDishDetail(hostUrl,id){
      this.$http.get(hostUrl+"/api/v1/dish/detail/"+id).then((res)=>{
        if(res.data.code== "0"){
          this.$data.dishDetail.imgUrl =  res.data.data.imageUrl;
          this.$data.dishDetail.name =  res.data.data.name;
          this.$data.dishDetail.trafficLight =  res.data.data.trafficLight;
          this.$data.dishDetail.note =  res.data.data.note;
          this.$data.dishDetail.identifyHeat =  res.data.data.identifyHeat/10;  
          this.$data.dishDetail.heatQuantify =  res.data.data.heatQuantify;
          this.$data.calcHeatQuantify =   res.data.data.heatQuantify;
          this.$data.dishDetail.fat = res.data.data.fat;
          this.$data.dishDetail.protein = res.data.data.protein;
          this.$data.dishDetail.carbohydrate = res.data.data.carbohydrate;
          this.$data.calcIndexVal.heatIndexVal = res.data.data.heatQuantify/100;
          this.$data.calcIndexVal.fatIndexVal = res.data.data.fat/100;
          this.$data.calcIndexVal.proteinIndexVal = res.data.data.protein/100;
          this.$data.calcIndexVal.carbohydrateIndexVal = res.data.data.carbohydrate/100;
          this.drawCookes();
        }     
      }).catch((err)=>{

      })
    },
    drawCookes(){
      var cookChart = echarts.init(this.$refs.cookes);
      var option = {
        series : [{
          name: '访问来源',
          startAngle:90,
          type: 'pie',
          radius: ['15%','50%'],
          roseType: 'radius',
          color:['#50e3c2','#6aa2f8','#1acefb'],
          data:[
              {
                value:this.$data.dishDetail.carbohydrate*4,
                name:'碳水化合物\n'+this.PercentageOfHeat(this.$data.dishDetail.carbohydrate,this.$data.dishDetail.fat,this.$data.dishDetail.protein,1)+'%',
                labelLine:{length:2, lineStyle:{color:"#ccc"}},
                label:{color:"#50e3c2"}
              },              
              {
                value:this.$data.dishDetail.protein*4, 
                name:'蛋白质\n'+this.PercentageOfHeat(this.$data.dishDetail.carbohydrate,this.$data.dishDetail.fat,this.$data.dishDetail.protein,2)+'%',
                labelLine:{length:2, lineStyle:{color:"#ccc"}},
                itemStyle:{},
                label:{color:"#6aa2f8"}
              },
              {
                value:this.$data.dishDetail.fat*9,
                name:'脂肪\n'+this.PercentageOfHeat(this.$data.dishDetail.carbohydrate,this.$data.dishDetail.fat,this.$data.dishDetail.protein,3)+'%',
                labelLine:{length:2, lineStyle:{color:"#ccc"}},
                label:{color:"#1acefb",formatter:{}}
              }
          ]
        }]
      };
      cookChart.setOption(option);
    },
    // 规格计算
    refreshData(){
        var val  = this.$data.rulerObj.nodeData() || 100;
        this.$data.rulerVal = val;
        // console.log(this.$data.rulerObj.nodeData());        
        var b = this.$data.rulerVal;
        this.$data.dishDetail.heatQuantify = Math.round(this.$data.calcIndexVal.heatIndexVal*val);      
        // this.$data.dishDetail.fat = parseFloat(this.$data.calcIndexVal.fatIndexVal*val).toFixed(1);
        // this.$data.dishDetail.protein = parseFloat(this.$data.calcIndexVal.proteinIndexVal*val).toFixed(1);
        // this.$data.dishDetail.carbohydrate =parseFloat(this.$data.calcIndexVal.carbohydrateIndexVal*val).toFixed(1);
        this.drawCookes();
        this.$data.look = 'none';
        document.getElementsByTagName("html")[0].style.overflow = "auto";
        document.getElementsByTagName("html")[0].style.position = "static";
    },
    //运动时间计算
    sportsTime(hq,type){
        var t = 0;
        if(hq == 0){
          return 0;
        }else{
          t = hq/type<1?1:Math.round(hq/type);
          return t;
        }
    },
    //热量百分比计算
    PercentageOfHeat(c,f,p,t){
      var heatCount = parseFloat(c)*4 + parseFloat(f)*9 +parseFloat(p)*4;
      if(t == 1){
        return (parseFloat(c)*4/heatCount*100).toFixed(1);
      }else if (t == 2){
        return (parseFloat(p)*4/heatCount*100).toFixed(1);
      }else{
        return (parseFloat(f)*9/heatCount*100).toFixed(1);
      }
    },
    goBack(){
       router.back(-1);
    },
    goMore(){
       router.push({name:"NutrientListPage",params:{dishId:this.$route.params.dishId}});
    },
    goEstimate(){
      router.push({path:"/weightestimation"})
    }
  },
  components:{
    star:Star
  }
}
</script>
<style lang="less" scoped>
@import "../../common/less/base";
@import "../../common/less/calc";
@import "../../common/less/animate";
@font-face {
  font-family: 'BebasNeue';
  src: url('../../assets/fonts/BebasNeue.otf');
}
.animated{
  -webkit-animation-duration: .5s;
  animation-duration: .5s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.color-b-g{
  background:  #40D19E;
}
.color-b-r{
  background: #F95424;
}
.color-b-y{
  background: #FFB806 ;
}
.color-t-b{
  color: #1acefb;
  font-family: "BebasNeue";
  font-size:86px; 
}
.starIcon(@url){
  margin-left:16px; 
  display: inline-block;
  width: 38px;
  height: 38px;
  background: url(@url) 100% 100% no-repeat;
  background-size: cover;
  vertical-align: text-top;
}
.header{
  width: 1080px;
  height: 150px;
  top:0;
  z-index: 99;
  .back-icon{
    position: absolute;
    top:45px;
    left: 45px;
    display: inline-block;
    width: 64px;
    height: 64px;
    background: url("./back_icon.png") 100% 100% no-repeat;
    background-size: cover;
  }
}

.detail-page{
  position: relative;
}
.detail-title{
  position: relative;
  width: 1080px;
  height: 576px;
  background: #eee;
  img{
    width: 100%;
    height: 100%;
  }
}
.detail-body{
  height: 839px;
  position: relative;
  background: #f6f6f6;
  .detail-info{
    width: 1010px;
    padding: 26px 0;   
    background: #fff;
    box-shadow: 0 6px 43px 0 rgba(0,0,0,0.10);
    .borderRadius(5px);
    &:first-child{
      position: absolute;
      top:-98px;
      left: 50%;
      right: 0;
      margin-left: -505px;
      height: 273px;
    }
    &:last-child{
      position: absolute;
      top:255px;
      left: 50%;
      right: 0;
      margin-left: -505px;
      height: 502px;
    }
  }
  .detail-info-title{
    padding-left: 56px;
    font-size: 50px;
    font-weight: 500;
    color: #584f60;
    border-left: 3px solid #1acefb;/*no*/
  }
  .detail-info-icon{
    display: inline-block;
    height: 50px;
    margin-top: 14px;
    margin-left: 56px;
    padding:0 20px;
    line-height: 58px;
    color: #f8f8f8;
    font-size: 30px;
    .borderRadius(3px);
  }
  .detail-info-des{
    padding: 20px 56px;
    line-height: 45px;
    word-spacing: 2px;/*no*/
    font-size: 30px;
    color: #1acefb;
  }
  .detail-info-hot{
    padding-left: 56px;
    padding-bottom: 20px;
    color: #737b91;
    font-size: 30px;
    .star{
      display: inline-block;
      vertical-align: text-top;
      margin-left: 10px;/*no*/
    }
  }
  .detail-info-block{
    display: flex;
    display: -webkit-flex;
    align-items: center;
    -webkit-align-items: center;
    padding: 22px 22px 0 22px;
    .detail-info-data{
      flex: 1 1 auto;
      -webkit-flex: 1 1 auto;
      height: 400px;
      &:first-child{
        flex:  0 0 auto;
        -webkit-flex: 0 0 auto;
        width: 218px;
        height: 400px;
        padding-top: 120px;
        box-sizing: border-box;
        text-align: center;
        vertical-align: middle;
        border-right: 1px solid #dddfe4;/*no*/
      }
    }
  }
  .detail-data-unit{
    margin-top: 12px;
    font-size: 32px;
    color: #737b91;
  }
  .detail-info-cal{
    text-align: right;
    color: #737B91;
    font-size: 32px;
    padding:0 22px;
    .more-icon{
      display: inline-block;
      margin-left: 20px;
      width: 14px;
      height: 28px;
      background: url("./more_icon.png") 100% 100% no-repeat;
      background-size: cover;
      vertical-align: bottom;
    }
  }
  .detail-info-more{
    text-align: center;
    color: #5a7cb0;
    font-size: 32px;
    .more-icon{
      display: inline-block;
      margin-left: 30px;
      width: 14px;
      height: 28px;
      background: url("./more_icon.png") 100% 100% no-repeat;
      background-size: cover;
      vertical-align: unset;
    }
  }
}
.detail-bottom{
  width: 1080px;
  height:672px ;
  padding: 48px 30px;
  box-sizing: border-box;
  .detail-bottom-title{
    padding-left: 31px;
    border-left: 3px solid #1acefb;/*no*/
    font-size: 34px;
    color: #584F60;
  }
  .orange-item{
    padding:0 3px;/*no*/
    font-size: 58px;
    font-weight: 500;
    color: #ffb806;
    vertical-align: text-bottom;
  }
  .detail-bottom-item{
    display: flex;
    display: -webkit-flex;
    flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -webkit-flex-wrap:wrap;
    li{
      flex: 1 1 auto;
      -webkit-flex:1 1 auto;
      width: 25%;
      margin-top: 60px;
      text-align: center;
      img{
        width: 120px;
      }
      p{
        margin-top: 35px;
        font-size: 34px;
        color: #737b91;
      }
    }
  }
}
.ruler-block{
  position: fixed;
  bottom: 0;
  z-index: 999;
  width: 1080px;
  height: 834px;
  text-align: center;
  line-height: 55px;
  background: #fff;
  border-top-left-radius: 10px;/*no*/
  -webkit-border-top-left-radius: 10px;/*no*/
  -moz-border-top-left-radius: 10px;/*no*/
  border-top-right-radius: 10px;/*no*/
  -webkit-border-top-right-radius: 10px;/*no*/
  -moz-border-top-right-radius:10px;/*no*/
  .calc-title{
    position: relative;
    padding: 34px 0;
    .close-icon{
      position: absolute;
      top: 34px;
      right: 22px;
      display: inline-block;
      width: 45px;
      height: 45px;
      background: url("./close_icon.png") 100% 100% no-repeat;
      background-size: cover
    }
  }
  .calc-name{
    font-size: 50px;
    color: #584f60;
  }
  .calc-standard{
    padding-top: 13px;
    padding-bottom: 23px;
    font-size: 40px;
    color: #5a7cb0;
  }
  .calc-fn{
    font-size: 40px;
    color: #b9b9b9;
    .calc-icon{
      display: inline-block;
      width: 55px;
      height: 56px;
      margin-right: 10px;/*no*/
      vertical-align: text-top;
      background: url("./scales.png") 100% 100% no-repeat;
      background-size: cover;
    }
  }
  .calc-val{
    width: 100%;
    position: absolute;
    bottom:175px;
    .calc-num{
      float: left;
      padding-left:30px; 
      text-align: left;
      font-size: 40px;
      color: #5a7cb0;
    }
    .calc-unit{
      float: right;
      padding-right: 30px;
      text-align: right;
      font-size: 40px;
      color: #5a7cb0;
    }
    .gram-icon{
      display: inline-block;
      width: 54px;
      height: 54px;
      margin-left: 5px;/*no*/
      vertical-align: text-top;
      background: url("./gram-icon.png") 100% 100% no-repeat;
      background-size: cover;
    }
  }
  .sure-btn{
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 28px 0;
    font-size: 40px;
    color: #fff;
    background-image: linear-gradient(-245deg, #29E5E8 0%, #18CCFC 90%);
  }
  .heart-contain{
    height: 455px;
  }
}
.over-view{
  width: 10rem;
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 99;
  background: rgba(0, 0, 0, .5);
}

</style>
