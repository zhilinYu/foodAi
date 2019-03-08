<template>
    <div class="clipper-container" ref="clipper">
        <loading class="identifing" v-show="!visible" @close="close" :tipsText="LoadingTips" :isCloseShow="true"/>
        <div class="back-btn" @click="goback" v-show="visible"></div>
        <canvas ref="canvas"></canvas>
        <canvas v-if="!visible" ref="canvas_hidden"></canvas>
        <!-- 裁剪部分 -->
        <div class="clipper-part" v-show="visible">
            <div class="pCanvas-container">
                <div class="corner-top-left"></div>
                <div class="corner-top-right"></div>
                <div class="corner-bottom-left"></div>
                <div class="corner-bottom-right"></div>
                <canvas ref="pCanvas" class="pCanvas"></canvas>
            </div>
        </div>
        <!-- 底部操作栏 -->
        <div class="action-bar" v-show="visible">
            <div class="btn-ok" @click="_clipperAndUpload">开始识别</div>
        </div>

        <!-- 背景遮罩 -->
        <div class="mask" :class="{opacity: maskShow}"></div>

        <!-- 手势操作层 -->
        <div class="gesture-mask" ref="gesture" v-show="visible">
        </div>
        <div class="tips" v-show="visible">
          <span>将菜品填满识别框，识别更精确</span>
        </div>
        <transition name="fade">
          <div class="dialog" v-show="isShowDialog">
          <img class="dialog-img" src="./shala.png"/>
          <div class="dialog-text">
            <h1>报告大人</h1>
            <p>是否确定取消?</p>
            <div class="btn-box">
              <button @click="_cancel">取消</button>
              <button @click="_ensure">确定</button>
            </div>
          </div>
        </div>
        </transition>
    </div>
</template>


<script>
import Vue from "vue";
import jQuery from "jquery";
import axios from "axios";
import Loading from "components/Loading/Loading";
import Toast from "components/Toast/toast";
import browserMD5File from "browser-md5-file";
import { accessKeyId, bucketName, zone } from "../../../config/api";
export default {
  name: "ClipperPage",
  components: {
    Loading
  },
  props: ["apiUrl", "picViewUrl"],
  computed: {},
  watch: {
    img() {
      this.loadImgQueue.push(this.img);
      this._loadImg();
    },
    $route() {
     this._init_();
    }
  },
  data() {
    return {
      img: String,
      userIP: "",
      originXDiff: 0, //裁剪canvas与原图canvas坐标原点上的差值
      originYDiff: 0,

      clipperImgWidth: 610,
      clipperImgHeight: 610,

      maskShow: true,
      maskShowTimer: null,

      ctx: null,
      pCtx: null,

      actionBarHeight: 61,

      loadImgQueue: [], //加载图片队列
      $img: null,
      imgLoaded: false,
      imgLoading: false,
      imgStartWidth: null,
      imgStartHeight: null,
      imgCurrentWidth: null,
      imgCurrentHeight: null,
      imgX: null, //img对于canvas的坐标
      imgY: null,
      imgScale: 1, //图片目前的缩放倍数 范围是1-4
      imgMinScale: 1,
      imgMaxScale: 4,
      imgScaleStep: 60, //缩放步长，每60px加减0.1

      //图片canvas宽高
      cWidth: 0,
      cHeight: 0,

      //控制开始识别按钮和loading是否显示
      visible: true,
      LoadingTips: "正在识别...",
      isCloseIdentify: false,
      isShowDialog: false
    };
  },
  mounted() {
    this._setclipperImg();
    this._init_();
  },
  beforeDestroy() {
    let $gesture = this.$refs.gesture;
    $gesture.ontouchstart = null;
    $gesture.ontouchmove = null;
    $gesture.outouchend = null;
  },
  methods: {
    _init_(){
      this.visible = true;
      this.isShowDialog = false;
      setTimeout(() => {
        this._initClipper();
      }, 10);
      this._clearCanvas();
      this.getlocalStorage("dataUrl");
    },
    _setclipperImg() {
      var u = navigator.userAgent;
      var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1; //android终端
      var isIPad = /iPad/gi.test(navigator.userAgent); //iPad
      var isWindows = u.indexOf("Windows") > -1; //Windows终端
      var isIphoneX =
        /iphone/gi.test(navigator.userAgent) &&
        (screen.height == 812 && screen.width == 375); //IphoneX
      var isIphonePlus =
        /iphone/gi.test(navigator.userAgent) &&
        (screen.height == 736 && screen.width == 414); //大屏Iphone
      if (isAndroid || isIphoneX || isIphonePlus || isIPad) {
        this.clipperImgWidth *= 1.5;
        this.clipperImgHeight *= 1.5;
      }
      if (isWindows) {
        this.clipperImgWidth /= 1.5;
        this.clipperImgHeight /= 1.5;
      }
    },
    _initClipper() {
      this.loadImgQueue.push(this.img);
      this._initCanvas();
      this._loadImg();
      this._initEvent();
    },
    _initCanvas() {
      let $canvas = this.$refs.canvas,
        $pCanvas = this.$refs.pCanvas,
        clipperClientRect = this.$refs.clipper.getBoundingClientRect(),
        clipperWidth = parseInt(this.clipperImgWidth / window.devicePixelRatio),
        clipperHeight = parseInt(
          this.clipperImgHeight / window.devicePixelRatio
        );

      this.ctx = $canvas.getContext("2d");
      this.pCtx = $pCanvas.getContext("2d");

      //判断clipperWidth与clipperHeight有没有超过容器值
      if (clipperWidth < 0 || clipperWidth > clipperClientRect.width) {
        clipperWidth = 100;
      }
      if (clipperHeight < 0 || clipperHeight > clipperClientRect.height) {
        clipperHeight = 100;
      }

      //因为canvas在手机上会被放大，因此里面的内容会模糊，这里根据手机的devicePixelRatio来放大canvas，然后再通过设置css来收缩，因此关于canvas的所有值或坐标都要乘以devicePixelRatio
      $canvas.style.width = clipperClientRect.width + "px";
      $canvas.style.height = clipperClientRect.height + "px";
      $canvas.width = this._ratio(clipperClientRect.width);
      $canvas.height = this._ratio(clipperClientRect.height);

      $pCanvas.style.width = clipperWidth + "px";

      $pCanvas.style.height = clipperHeight + "px";
      $pCanvas.width = this._ratio(clipperWidth);
      $pCanvas.height = this._ratio(clipperHeight);

      //计算两个canvas原点的x y差值
      let cClientRect = $canvas.getBoundingClientRect(),
        pClientRect = $pCanvas.getBoundingClientRect();

      this.originXDiff = pClientRect.left - cClientRect.left;
      this.originYDiff = pClientRect.top - cClientRect.top;
      this.cWidth = cClientRect.width;
      this.cHeight = cClientRect.height;
    },
    _initEvent() {
      let $gesture = this.$refs.gesture,
        cClientRect = this.$refs.canvas.getBoundingClientRect(),
        scx = 0, //对于单手操作是移动的起点坐标，对于缩放是图片距离两手指的中点最近的图标。
        scy = 0,
        fingers = {}; //记录当前有多少只手指在触控屏幕

      //one finger
      let iX = this.imgX,
        iY = this.imgY;

      //two finger
      let figureDistance = 0,
        pinchScale = this.imgScale;

      $gesture.addEventListener(
        "touchstart",
        e => {
          if (!this.imgLoaded) {
            return;
          }

          if (e.touches.length === 1) {
            let finger = e.touches[0];

            scx = finger.pageX;
            scy = finger.pageY;
            iX = this.imgX;
            iY = this.imgY;
            fingers[finger.identifier] = finger;
          } else if (e.touches.length === 2) {
            let finger1 = e.touches[0],
              finger2 = e.touches[1],
              f1x = finger1.pageX - cClientRect.left,
              f1y = finger1.pageY - cClientRect.top,
              f2x = finger2.pageX - cClientRect.left,
              f2y = finger2.pageY - cClientRect.top;

            scx = parseInt((f1x + f2x) / 2);
            scy = parseInt((f1y + f2y) / 2);
            figureDistance = this._pointDistance(f1x, f1y, f2x, f2y);
            fingers[finger1.identifier] = finger1;
            fingers[finger2.identifier] = finger2;

            //判断变换中点是否在图片中，如果不是则去离图片最近的点
            if (scx < this.imgX) {
              scx = this.imgX;
            }
            if (scx > this.imgX + this.imgCurrentWidth) {
              scx = this.imgX + this.imgCurrentHeight;
            }
            if (scy < this.imgY) {
              scy = this.imgY;
            }
            if (scy > this.imgY + this.imgCurrentHeight) {
              scy = this.imgY + this.imgCurrentHeight;
            }
          }
        },
        false
      );
      $gesture.addEventListener(
        "touchmove",
        e => {
          e.preventDefault();

          if (!this.imgLoaded) {
            return;
          }

          this.maskShowTimer && clearTimeout(this.maskShowTimer);
          this.maskShow = false;

          if (e.touches.length === 1) {
            let f1x = e.touches[0].pageX,
              f1y = e.touches[0].pageY;
            this._drawImage(
              iX + f1x - scx,
              iY + f1y - scy,
              this.imgCurrentWidth,
              this.imgCurrentHeight
            );
          } else if (e.touches.length === 2) {
            let finger1 = e.touches[0],
              finger2 = e.touches[1],
              f1x = finger1.pageX - cClientRect.left,
              f1y = finger1.pageY - cClientRect.top,
              f2x = finger2.pageX - cClientRect.left,
              f2y = finger2.pageY - cClientRect.top,
              newFigureDistance = this._pointDistance(f1x, f1y, f2x, f2y),
              scale =
                this.imgScale +
                parseFloat(
                  (
                    (newFigureDistance - figureDistance) /
                    this.imgScaleStep
                  ).toFixed(1)
                );

            fingers[finger1.identifier] = finger1;
            fingers[finger2.identifier] = finger2;

            if (scale !== pinchScale) {
              //目前缩放的最小比例是1，最大是4
              if (scale < this.imgMinScale) {
                scale = this.imgMinScale;
              } else if (scale > this.imgMaxScale) {
                scale = this.imgMaxScale;
              }

              pinchScale = scale;
              this._scale(scx, scy, scale);
            }
          }
        },
        false
      );
      $gesture.addEventListener("touchend", e => {
        if (!this.imgLoaded) {
          return;
        }

        this.imgScale = pinchScale;

        //从finger删除已经离开的手指
        let touches = Array.prototype.slice.call(e.changedTouches, 0);

        touches.forEach(item => {
          delete fingers[item.identifier];
        });

        //迭代fingers，如果存在finger则更新scx,scy,iX,iY，因为可能缩放后立即单指拖动
        let i,
          fingerArr = [];

        for (i in fingers) {
          if (fingers.hasOwnProperty(i)) {
            fingerArr.push(fingers[i]);
          }
        }

        if (fingerArr.length > 0) {
          scx = fingerArr[0].pageX;
          scy = fingerArr[0].pageY;
          iX = this.imgX;
          iY = this.imgY;
        } else {
          this.maskShowTimer = setTimeout(() => {
            this.maskShow = true;
          }, 300);
        }

        //做边界值检测
        let x = this.imgX,
          y = this.imgY,
          pClientRect = this.$refs.pCanvas.getBoundingClientRect();


        if(x > pClientRect.left ){
          x = pClientRect.left;
        }else if (x + this.imgCurrentWidth < pClientRect.right) {
          x = pClientRect.right - this.imgCurrentWidth;
        }

        if (y > pClientRect.top) {
          y = pClientRect.top;
        }else if(y + this.imgCurrentHeight < pClientRect.bottom ){
          y = pClientRect.bottom - this.imgCurrentHeight;
        }

        if (this.imgCurrentWidth < pClientRect.width) {
          x = pClientRect.left + (pClientRect.width - this.imgCurrentWidth)/2;
        }
        if (this.imgCurrentHeight < pClientRect.height) {
          y = pClientRect.top + (pClientRect.height - this.imgCurrentHeight)/2;
        }

        if (this.imgX !== x || this.imgY !== y) {
          this._drawImage(x, y, this.imgCurrentWidth, this.imgCurrentHeight);
        }
      });
    },
    _loadImg() {
      if (this.imgLoading || this.loadImgQueue.length === 0) {
        return;
      }

      let img = this.loadImgQueue.shift();

      if (!img) {
        return;
      }

      let $img = new Image(),
        onLoad = e => {
          $img.removeEventListener("load", onLoad, false);
          this.$img = $img;
          this.imgLoaded = true;
          this.imgLoading = false;
          this._initImg($img.width, $img.height);
          this.$emit("loadSuccess", e);
          this.$emit("loadComplete", e);
          this._loadImg();
        },
        onError = e => {
          $img.removeEventListener("error", onError, false);
          this.$img = $img = null;
          this.imgLoading = false;

          this.$emit("loadError", e);
          this.$emit("loadComplete", e);
          this._loadImg();
        };

      this.$emit("beforeLoad");
      this.imgLoading = true;
      this.imgLoaded = false;
      $img.src = this.img;
      $img.crossOrigin = "Anonymous"; //因为canvas toDataUrl不能操作未经允许的跨域图片，这需要服务器设置Access-Control-Allow-Origin头
      $img.addEventListener("load", onLoad, false);
      $img.addEventListener("error", onError, false);
    },
    _initImg(w, h) {
      let eW = null,
        eH = null,
        maxW = this.cWidth,
        maxH = this.cHeight - this.actionBarHeight;

      //如果图片的宽高都少于容器的宽高，则不做处理
      if (w <= maxW && h <= maxH) {
        eW = w;
        eH = h;
      } else if (w > maxW && h <= maxH) {
        eW = maxW;
        eH = parseInt(h / w * maxW);
      } else if (w <= maxW && h > maxH) {
        eW = parseInt(w / h * maxH);
        eH = maxH;
      } else {
        //判断是横图还是竖图
        if (h > w) {
          eW = parseInt(w / h * maxH);
          eH = maxH;
        } else {
          eW = maxW;
          eH = parseInt(h / w * maxW);
        }
      }
      if (eW <= maxW && eH <= maxH) {
        //记录其初始化的宽高，日后的缩放功能以此值为基础
        this.imgStartWidth = eW;
        this.imgStartHeight = eH;
        this._drawImage((maxW - eW) / 2, (maxH - eH) / 2, eW, eH);
      } else {
        this._initImg(eW, eH);
      }
    },
    _drawImage(x, y, w, h) {
      this._clearCanvas();
      this.imgX = parseInt(x);
      this.imgY = parseInt(y);
      this.imgCurrentWidth = parseInt(w);
      this.imgCurrentHeight = parseInt(h);

      //更新canvas
      this.ctx &&
        this.ctx.drawImage(
          this.$img,
          this._ratio(x),
          this._ratio(y),
          this._ratio(w),
          this._ratio(h)
        );

      //更新pCanvas，只需要减去两个canvas坐标原点对应的差值即可
      this.pCtx &&
        this.pCtx.drawImage(
          this.$img,
          this._ratio(x - this.originXDiff),
          this._ratio(y - this.originYDiff),
          this._ratio(w),
          this._ratio(h)
        );
    },
    _clearCanvas() {
      let $canvas = this.$refs.canvas,
        $pCanvas = this.$refs.pCanvas;

      $canvas.width = $canvas.width;
      $canvas.height = $canvas.height;
      $pCanvas.width = $pCanvas.width;
      $pCanvas.height = $pCanvas.height;
    },
    _ratio(size) {
      return parseInt(window.devicePixelRatio * size);
    },
    _pointDistance(x1, y1, x2, y2) {
      return parseInt(Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    },
    _scale(x, y, scale) {
      let newPicWidth = parseInt(this.imgStartWidth * scale),
        newPicHeight = parseInt(this.imgStartHeight * scale),
        newIX = parseInt(
          x - newPicWidth * (x - this.imgX) / this.imgCurrentWidth
        ),
        newIY = parseInt(
          y - newPicHeight * (y - this.imgY) / this.imgCurrentHeight
        );

      this._drawImage(newIX, newIY, newPicWidth, newPicHeight);
    },
    _clipperAndUpload(e) {
      let imgData = null;
      try {
        imgData = this.$refs.pCanvas.toDataURL();
      } catch (e) {
        console.error(
          "请在response header加上Access-Control-Allow-Origin，否则canvas无法裁剪未经许可的跨域图片"
        );
      }
      setTimeout(()=>{
        this._clearCanvas();
        this.img = imgData;
      },10)
      this.visible = false;
      this.isCloseIdentify = false;
      // 上传图片并识别
      this.qingStorPutObj(imgData);
      // window.localStorage.setItem("imgData", imgData);
    },
    _cancel() {
      // this.$emit("cancel");
      this.isShowDialog = false;
    },
    _ensure() {
      this.isCloseIdentify = true;
      this.isShowDialog = false;
      this.visible = true;
      this.getlocalStorage("dataUrl");
    },
    //public
    goback() {
      this.$router.back(-1);
    },
    getBase64(dataURL) {
      return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    },
    close() {
      this.isShowDialog = true;
    },
    getQuery(data) {
      // 取到路由带过来的参数
      let routerParams = this.$route.query[data];
      // 将数据放在当前组件的数据内
      this.img = routerParams;
    },
    getlocalStorage(data) {
      // 取到本地存储的参数
      let params = window.localStorage.getItem(data);
      this.img = params;
    },
    //使用青云JS SDK上传文件
    qingStorPutObj(dataurl) {
      var config = new qingstor_sdk.Config(accessKeyId, "");
      var bucket = new qingstor_sdk.QingStor(config).Bucket(bucketName, zone);
      var filename = this.$route.query.filename;
      var file = this.dataURLtoBlob(dataurl, filename);
      browserMD5File(file, (err, md5) => {
        // Send signed request.
        axios
          .get(this.apiUrl + "/api/v1/sign/getH5QingAuthorization", {
            params: {
              md5String: md5,
              contentType: file.type
            }
          })
          .then(response => {
            if (response.data.code != 0) {
              if (response.data.code == "-1") {
                this.$router.push({
                  path: "/error",
                  name: "ErrorPage",
                  query: {
                    errorType: "servererror"
                  }
                });
              } else {
                response.data.msg && Toast(response.data.msg);
                this.visible = true;
                this.getlocalStorage("dataUrl");
                this.isShowDialog = false;
                return false;
              }
            }
            const data = response.data.data;
            const putObjectRequest = bucket.putObjectRequest(
              decodeURIComponent(data.url),
              {
                body: file,
                "Content-Length": file.size,
                "Content-MD5": md5,
                "Content-Type": file.type
              }
            );
            localStorage.setItem("signature", data.signature);
            // Apply signature.
            putObjectRequest.applySignature(data.qsSign);
            putObjectRequest.operation.headers["X-QS-Date"] = data.date;
            // console.log(putObjectRequest.getStringToSign());
            //Put object
            putObjectRequest.send((error, response) => {
              if (error != null) {
                if (!this.isCloseIdentify) {
                  Toast("网络异常，请检查网络后重试");
                  this._ensure();
                  return false;
                }
              }
              if (response.status == 201 || response.status == 200) {
                //图片上传成功开始识别
                this.identifyPic(decodeURIComponent(data.url), data.signature);
              } else {
                Toast("图片上传失败");
                this._ensure();
              }
            });
            // setTimeout(()=>{
            //   if (this.$route.path == "/clipper") {
            //     Toast("识别超时");
            //     this._ensure();
            //     return false;
            //   }
            // },30000);
          })
          .catch(error => {
            if (error.toString() == "Error: Network Error") {
              Toast("网络异常，请检查网络后重试");
              this._ensure();
            }
          });
      });
    },
    //dataURL转换为Blob对象
    dataURLtoBlob(dataurl, filename) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    },
    //生成从minNum到maxNum的随机数
    randomNum(minNum, maxNum) {
      switch (arguments.length) {
        case 1:
          return parseInt(Math.random() * minNum + 1, 10);
          break;
        case 2:
          return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
          break;
        default:
          return 0;
          break;
      }
    },
    identifyPic(url, Sign) {
      axios({
        method: "post",
        url: this.apiUrl + "/api/v1/dish/identify",
        data: {
          appid: 1,
          nonceStr: "asdasd",
          timestamp: "123456",
          data: {
            images: [this.picViewUrl + url],
            identifyType: 0,
            topN: 10, //返回预测结果的数量, 默认返回10个,最大50
            ossSign: Sign
          },
          sign: "aaa"
        }
      })
        .then(res => {
          if (this.isCloseIdentify) return false;
          var response = res.data;
          if (response.code == "0") {
            if (response.data[0].isDish == "true") {
              if (response.data[0].resultList.length == 0) {
                Toast("未查询到相关菜品信息");
                this.visible = true;
                this.getlocalStorage("dataUrl");
                return false;
              }
              this.visible = true;
              var resultStr = JSON.stringify(response.data);
              window.localStorage.setItem("resultData", resultStr);
              this.$router.push({
                path: "/result",
                name: "ResultPage",
                params: {
                  resultData: resultStr
                }
              });
            } else {
              //识别无结果
              var Num = this.randomNum(0, 7);
              var noResultImgUrl = response.data[0].resultList[Num].imageUrl;
              this.$router.push({
                path: "/noresult",
                name: "NoResultPage",
                query: {
                  noResultImgUrl: noResultImgUrl
                }
              });
            }
          } else if (response.code == "-1") {
            this.$router.push({
              path: "/error",
              name: "ErrorPage",
              query: {
                errorType: "servererror"
              }
            });
          } else {
            response.msg && Toast(response.msg);
            this.visible = true;
            this.isShowDialog = false;
            this.getlocalStorage("dataUrl");
          }
        })
        .catch(error => {
          if (!this.isCloseIdentify) {
            if (error.toString() == "Error: Network Error") {
              Toast("网络异常，请检查网络后重试");
            }
            this.visible = true;
            this.getlocalStorage("dataUrl");
          }
        });
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../common/less/base";
.position() {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.corner() {
  width: 57px;
  height: 57px;
  content: "";
}
.identifing {
  z-index: 200;
  .position();
  top: 72%;
}
.back-btn {
  width: 52px;
  height: 52px;
  background: url(./Rectangle.png) no-repeat;
  background-size: contain;
  position: absolute;
  color: white;
  font-size: 52px; /*px*/
  margin: 60px 0 0 52px;
  z-index: 103;
}
.clipper-container {
  width:1080px;
  height:100%;
  margin: 0 auto;
  position:relative;
  overflow: hidden;
  // .position();
  line-height: 0;
  background: rgba(0, 0, 0, 0.5);
  .clipper-part {
    .position();
    z-index: 102;
    .pCanvas-container {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px solid #1acefb;
      // .border-1px(#1ACEFB);
      .corner-top-right {
        .corner();
        border-top: 3px solid #1acefb; /*no*/
        border-right: 3px solid #1acefb; /*no*/
        position: absolute;
        right: 0;
        top: 0;
      }
      .corner-top-left {
        .corner();
        border-top: 3px solid #1acefb; /*no*/
        border-left: 3px solid #1acefb; /*no*/
        position: absolute;
        left: 0;
        top: 0;
      }
      .corner-bottom-right {
        .corner();
        border-bottom: 3px solid #1acefb; /*no*/
        border-right: 3px solid #1acefb; /*no*/
        position: absolute;
        right: 0;
        bottom: 0;
      }
      .corner-bottom-left {
        .corner();
        border-bottom: 3px solid #1acefb; /*no*/
        border-left: 3px solid #1acefb; /*no*/
        position: absolute;
        left: 0;
        bottom: 0;
      }
      // .pCanvas{
      //   width: 600px;/*px*/
      //   height: 600px;/*px*/
      // }
    }
  }
  .action-bar {
    box-sizing: content-box;
    .position();
    top: auto;
    z-index: 103;
    height: 216px;
    line-height: 216px;
    background: rgba(0, 0, 0, 0.6);
    .btn-ok {
      text-align: center;
      line-height: 216px;
      font-size: 32px; /*px*/
      color: #ffffff;
      letter-spacing: 0;
      background: none;
      margin: 0 auto;
    }
  }
  .mask {
    .position();
    z-index: 101;
    transition: opacity 500ms;
    background-color: #000;
    opacity: 0;
    &.opacity {
      opacity: 0.5;
    }
  }
  .gesture-mask {
    .position();
    top: 150px;
    bottom: 216px;
    z-index: 103;
  }
}
.tips {
  width: 576px;
  height: 75px;
  margin: 0 auto;
  text-align: center;
  line-height: 75px;
  font-size: 22px; /*px*/
  // font-weight: 700;
  border-radius: 40px;
  background: rgba(0, 0, 0, 0.5);
  color: #e3e3e3;
  position: absolute;
  bottom: 20%;
  left: 25%;
  z-index: 104;
}

//对话框
.dialog {
  position: absolute;
  top: 200px;
  left: 150px;
  z-index: 200;
}
img {
  width: 450px;
  height: 300px;
  position: relative;
  left: 160px;
  top: 110px;
}
.dialog-text {
  width: 680px;
  height: 528px;
  padding: 0 50px;
  background: #ffffff;
  border-radius: 26px;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  h1 {
    font-family: PingFangSC-Medium;
    font-size: 50px;
    line-height: 70px;
    margin: 60px 0;
    color: #584f60;
  }
  p {
    width: 100%;
    height: 80px;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 40px;
    color: #584f60;
    margin-bottom: 20px;
  }
  button {
    width: 300px;
    height: 100px;
    line-height: 100px;
    background: #ffffff;
    border: 2px solid rgba(26, 206, 251, 0.8);
    box-shadow: 0 3px 6px 0 rgba(26, 206, 251, 0.6);
    border-radius: 50px;
    font-family: PingFangSC-Regular;
    font-size: 50px;
    color: #1acefb;
    &:last-child {
      margin-left: 30px;
      background-image: linear-gradient(90deg, #29e5e8 10%, #18ccfc 94%);
      box-shadow: 0 3px 10px 0 rgba(3, 108, 214, 0.3);
      color: #ffffff;
    }
  }
}

//动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
