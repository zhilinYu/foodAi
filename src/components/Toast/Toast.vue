<template>
    <transition name='fade'>
    <div v-show='visible' :class='position' class='toast'>
         <span>{{message}}</span>
    </div>
    </transition>
</template>

<script>
    export default {
        data() {
            return {
                visible: false,
                message : '',
                position : ''
            };
        }
    }
</script>


<style>
.toast {
    position: fixed;
    left:50%;
    transform:translate(-50%,-50%) scale(1);
    word-wrap:break-word;
    padding:10px;
    text-align: center;
    z-index:9999;
    font-size:36px;
    max-width:80%;
    color: #fff;
    border-radius: 10px;
    padding: 26px;
    background: rgba(0,0,0,0.7);
    overflow: hidden;
}
.toast.middle{
    top:50%;
}
.toast.middleBottom{
    top:58%;
}
.toast.top{
    top:10%;
}
.toast.bottom{
    top:90%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>