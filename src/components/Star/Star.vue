<template>
  <div class="star">
    <span v-for="(itemClass,index) in itemClasses" :class="itemClass" class="star-item" :key="index"></span>
   </div>
</template>
<script type="text/ecmascript-6">
  const LENGTH = 5;
  const CLS_ON = 'on';
  const CLS_HALF = 'half';
  const CLS_OFF = 'off';
  export default {
    props: {
      score0: {
        type: Number
      }
    },
    //04-12-modify By QJP
    data(){
      return{
        score:{
          type:Number
        }
      }
    },
    computed: {
      itemClasses() {
        let result = [];
        this.score = this.score0 * 10;
        if(this.score > 50){
          this.score = 50;
        }
        let hasDecimal = this.score % 10 < 6 && this.score % 10 > 0 ? 1 : 0;
        let integer = Math.floor(this.score / 10) + (this.score % 10 >= 6 ? 1 : 0);
        for (let i = 0; i < integer; i++) {
          result.push(CLS_ON);
        }
        if (hasDecimal) {
          result.push(CLS_HALF);
        }
        while (result.length < LENGTH) {
          result.push(CLS_OFF);
        }
        return result;
      }
    }
  };
</script>
<style lang="less" scoped>
.star{
   font-size: 0;
   .star-item{
     display: inline-block;
     width: 38px;
     height: 38px;
     margin-right: 25px;
   }
   .on{
     background: url(./star_on.png) no-repeat;
     background-size: contain;
   }
   .half{
     background: url(./star_half.png) no-repeat;
     background-size: contain;
   }
   .off{
     background: url(./star_off.png) no-repeat;
     background-size: contain;
   }
}
</style>
