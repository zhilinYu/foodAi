<template>
  <div class="nutrientlist-page" v-title :data-title="title">
    <div class="back-btn" onclick="window.history.go(-1)"></div>
    <h1 class="food-title">{{dishDetail.name}}</h1>
    <div class="container">
      <div class="nutrient-list">营养成分 <span class="food-g">食用量：100g</span> <span class="line-2"></span> <img src="./pie_chart.png" alt=""></div>
      <ul class="nutrient">
        <li><span>热量</span> <span>{{dishDetail.heatQuantify}}千卡</span></li>
        <li><span>蛋白质</span> <span>{{dishDetail.protein}}克</span></li>
        <li><span>脂肪</span> <span>{{dishDetail.fat}}克</span></li>
        <li><span>碳水化合物</span> <span>{{dishDetail.carbohydrate}}克</span></li>
        <li><span>胆固醇</span> <span>{{dishDetail.cholesterol}}克</span></li>
      </ul>
      <ul class="nutrient vitamin">
        <li><span>膳食纤维</span> <span>{{dishDetail.dietaryfiber}}克</span></li>
        <li><span>维生素A</span> <span>{{dishDetail.vitaminA}}克</span></li>
        <li><span>维生素C</span> <span>{{dishDetail.vitaminC}}克</span></li>
        <li><span>维生素E</span> <span>{{dishDetail.vitaminE}}克</span></li>
        <li><span>维生素B1</span> <span>{{dishDetail.vitaminBone}}克</span></li>
        <li><span>维生素B2</span> <span>{{dishDetail.vitaminBtwo}}克</span></li>
        <li><span>胡萝卜素</span> <span>{{dishDetail.carotene}}克</span></li>
        <li><span>钙</span> <span>{{dishDetail.calcium}}克</span></li>
        <li><span>铁</span> <span>{{dishDetail.iron}}克</span></li>
        <li><span>钠</span> <span>{{dishDetail.sodium}}克</span></li>
        <li><span>钾</span> <span>{{dishDetail.potassium}}克</span></li>
        <li><span>镁</span> <span>{{dishDetail.magnesium}}克</span></li>
        <li><span>锌</span> <span>{{dishDetail.zinc}}克</span></li>
        <li><span>铜</span> <span>{{dishDetail.copper}}克</span></li>
        <li><span>锰</span> <span>{{dishDetail.manganese}}克</span></li>
        <li><span>磷</span> <span>{{dishDetail.phosphorus}}克</span></li>
        <li><span>硒</span> <span>{{dishDetail.selenium}}克</span></li>
      </ul>
      <div class="bottom-bar" :class="[isIphoneX?'hidden':'']"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: "营养元素列表",
      dishDetail: {
        name: "",
        trafficLight: "",
        note: "",
        identifyHeat: 2 /*热度*/,
        heatQuantify: 0 /*热量*/,
        fat: 0 /*脂肪*/,
        protein: 0 /*蛋白质*/,
        carbohydrate: 0 /*碳水化合物*/,
        cholesterol: 0,
        vitaminA: 0,
        vitaminBone: 0,
        vitaminBtwo: 0,
        vitaminC: 0,
        vitaminE: 0,
        dietaryfiber: 0,
        carotene: 0,
        selenium: 0,
        calcium: 0,
        phosphorus: 0,
        manganese: 0,
        iron: 0,
        sodium: 0,
        potassium: 0,
        magnesium: 0,
        zinc: 0,
        copper: 0
      }
    };
  },
  props: ["apiUrl"],
  created() {
    this.getDishDetail(this.apiUrl, this.$route.params.dishId);
  },
  computed:{
    isIphoneX(){
       return /iphone/gi.test(navigator.userAgent) && (screen.height == 812 && screen.width == 375);   
    }
  },
  methods: {
    getDishDetail(hostUrl, id) {
      this.$http
        .get(hostUrl + "/api/v1/dish/detail/" + id, {
          params: {
            dishId: id,
            channelType: 3,
            userId: ""
          }
        })
        .then(res => {
          if (res.data.code == "0") {
            this.$data.dishDetail.imgUrl = res.data.data.imageUrl;
            this.$data.dishDetail.name = res.data.data.name;
            this.$data.dishDetail.trafficLight = res.data.data.trafficLight;
            this.$data.dishDetail.note = res.data.data.note;
            this.$data.dishDetail.identifyHeat = res.data.data.identifyHeat;
            this.$data.dishDetail.heatQuantify = res.data.data.heatQuantify;
            this.$data.dishDetail.cholesterol = res.data.data.cholesterol;
            this.$data.dishDetail.calcHeatQuantify =
              res.data.data.heatQuantify / 10;
            this.$data.dishDetail.vitaminA = res.data.data.vitaminA;
            this.$data.dishDetail.vitaminBone = res.data.data.vitaminBone;
            this.$data.dishDetail.vitaminBtwo = res.data.data.vitaminBtwo;
            this.$data.dishDetail.vitaminC = res.data.data.vitaminC;
            this.$data.dishDetail.vitaminE = res.data.data.vitaminE;
            this.$data.dishDetail.fat = res.data.data.fat;
            this.$data.dishDetail.protein = res.data.data.protein;
            this.$data.dishDetail.dietaryfiber = res.data.data.dietaryfiber;
            this.$data.dishDetail.carotene = res.data.data.carotene;
            this.$data.dishDetail.carbohydrate = res.data.data.carbohydrate;
            this.$data.dishDetail.selenium = res.data.data.selenium;
            this.$data.dishDetail.calcium = res.data.data.calcium;
            this.$data.dishDetail.phosphorus = res.data.data.phosphorus;
            this.$data.dishDetail.manganese = res.data.data.manganese;
            this.$data.dishDetail.iron = res.data.data.iron;
            this.$data.dishDetail.sodium = res.data.data.sodium;
            this.$data.dishDetail.potassium = res.data.data.potassium;
            this.$data.dishDetail.magnesium = res.data.data.magnesium;
            this.$data.dishDetail.zinc = res.data.data.zinc;
            this.$data.dishDetail.copper = res.data.data.copper;
          } 
        });
    }
  }
};
</script>
<style lang="less" scoped>
.nutrientlist-page {
  padding-bottom: 17px;
  .back-btn {
    width: 52px;
    height: 52px;
    background: url(./Rectangle2.png) no-repeat;
    background-size: contain;
    position: absolute;
    color: white;
    font-size: 52px; /*px*/
    margin-left: 52px;
    margin-top: -8px;
    // margin: 52px 0 0 54px;
    z-index: 103;
  }
  .food-title {
    width: 100%;
    height: 100px;
    margin: 65px 0 35px 0;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 48px;
    color: #584f60;
    border-bottom: 2px solid #dddfe4;
  }
  .container {
    width: 980px;
    height: auto;
    margin: 0 auto;
    .nutrient-list {
      width: 100%;
      height: 78px;
      font-family: PingFangSC-Medium;
      font-size: 56px;
      color: #584f60;
      margin: 32px 15px;
      display: flex;
      align-items: center;
      .food-g {
        font-family: PingFangSC-Regular;
        font-size: 30px;
        color: #737b91;
        margin: 0 400px 0 35px;
      }
      .line-2 {
        width: 3px;
        height: 58px;
        display: inline-block;
        background-color: #dddfe4;
        margin-right: 26px;
      }
      img {
        float: right;
        width: 48px;
        height: 49px;
      }
    }
    .nutrient {
      border-top: 14px solid #584f60;
      li {
        line-height: 112px;
        padding-left: 40px;
        background-color: #ecf6f9;
        border-bottom: 4px solid #ffffff;
        font-family: PingFangSC-Regular;
        font-size: 40px;
        color: #584f60;
        span:last-child {
          float: right;
          width: 50%;
          height: 100%;
          background-color: #e2f3f8;
          text-align: right;
          padding-right: 40px;
        }
      }
    }
    .vitamin {
      padding-bottom: 100px;
      li {
        background-color: #f9f9f9;
        span:last-child {
          background-color: #eeeeee;
        }
      }
    }
    .bottom-bar {
      width: 280px;
      height: 12px;
      margin: 0 auto;
      background: #584f60;
      border-radius: 9px;
      // margin-bottom: 117px;
      &.hidden{
        visibility: hidden;
      }
    }
  }
}
</style>
