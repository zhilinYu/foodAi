//api接口获取地址
var getApiUrl, getPicViewUrl,
  accessKeyId = "DROADQQUFNDAQZQRBMXI", //青云JS SDK  PUT object 相关参数
  bucketName = "cd-dish-pic",
  zone = "sh1a";
switch (process.env.srconfig) {
  case 'pro': //生产环境
    getApiUrl = 'https://ai.phicomm.com/h5'
    getPicViewUrl = 'https://aipic.phicomm.com/'
    break;
  case 'dev': //开发环境
    getApiUrl = 'https://aidev.phicomm.com/h5'
    getPicViewUrl = 'https://aipic.phicomm.com/'
    break;
  case 'test': //测试环境
    getApiUrl = 'https://aitest.phicomm.com/h5'
    getPicViewUrl = 'https://aipic.phicomm.com/'
    break;
  default: //默认开发
    getApiUrl = 'https://aidev.phicomm.com/h5'
    getPicViewUrl = 'https://aipic.phicomm.com/'
    break;
}


module.exports = {
  getApiUrl: getApiUrl,
  getPicViewUrl: getPicViewUrl,
  accessKeyId: accessKeyId,
  bucketName: bucketName,
  zone: zone
}


//打包的时候需要运行npm run build pro既可以完成生产环境的打包。
//打包的时候需要运行npm run build test既可以完成测试环境的打包。
