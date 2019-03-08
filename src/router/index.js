import Vue from 'vue'
import axios from "axios"
import Router from 'vue-router'
import MainPage from 'components/MainPage/MainPage'
import SearchPage from 'components/SearchPage/SearchPage'
import SearchResultPage from 'components/SearchResultPage/SearchResultPage'
import HelpPage from 'components/HelpPage/HelpPage'
import ResultPage from 'components/ResultPage/ResultPage'
import ClipperPage from 'components/ClipperPage/ClipperPage'
import Loading from 'components/Loading/Loading'
import DetailPage from 'components/DetailPage/DetailPage'
import NutrientListPage from 'components/NutrientListPage/NutrientListPage'
import WeightEstimation from 'components/WeightEstimation/WeightEstimation'
import Star from 'components/Star/Star'
import NoResultPage from 'components/NoResultPage/NoResultPage'
import ErrorPage from 'components/ErrorPage/ErrorPage'
import UserDialog from 'components/UserDialog/UserDialog'
import NewFoodPage from 'components/NewFoodPage/NewFoodPage'
import {getApiUrl,getPicViewUrl} from '../../config/api'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'MainPage',//菜品识别
      component: MainPage
    }, {
      path: '/search',
      name: 'SearchPage',//搜索
      component: SearchPage
    },{
      path: '/searchresult/:dishName',
      name: 'SearchResultPage',//搜索结果
      component: SearchResultPage
    },
    {
      path: '/help',
      name: 'HelpPage',//帮助指引
      component: HelpPage
    }, {
      path: '/result',
      name: 'ResultPage',//识别结果
      component: ResultPage
    },{
      path: '/clipper',
      name: 'ClipperPage',//图片处理
      component: ClipperPage
    },{
      path: '/detail/:dishId',
      name: 'DetailPage',//识别详情
      component: DetailPage
    },{
      path: '/nutrientlist/:dishId',//04-12 By QJP
      name: 'NutrientListPage',//更多营养元素列表
      component: NutrientListPage
    },{
      path: '/weightestimation',
      name: 'WeightEstimation',//估算菜品重量
      component: WeightEstimation
    },{
      path: '/noresult',
      name: 'NoResultPage',//识别无结果
      component: NoResultPage
    },{
      path: '/newfood',
      name: 'NewFoodPage',//新菜品输入
      component: NewFoodPage
    }
    //公共组件
    ,{
      path: '/error',
      name: 'ErrorPage',
      component: ErrorPage
    } 
  ]
})

// 全局路由守卫
router.beforeEach ((to, from, next) => {
  if (to.fullPath == "/result" && from.fullPath.indexOf("/clipper") != -1) {
    next();
    return false;
  }
  axios
  .post(getApiUrl + "/api/v1/dish/init", {
    userId: returnCitySN["cip"],
    province: returnCitySN["cname"].split("省")[0],
    city: returnCitySN["cname"].split("省")[1]
  })
  .then(res => {
    next();
  }).catch(error=>{
    if (error.toString() == "Error: Network Error") {
      window.location.reload();
    }
  });
  
})

export default router;