var buildtype = process.argv.slice(2)[0]||'development'
console.log('---------------start build-----------------' + buildtype)
var obj = {
  ODE_ENV: '"production"'
}

switch (buildtype) {
  case 'pro': //生产环境
    process.env.srconfig = 'pro'
    obj.srconfig = '"pro"'
    break;
  case 'test': //测试环境
    process.env.srconfig = 'test'
    obj.srconfig = '"test"'
    break;
  case 'dev': //开发环境
    process.env.srconfig = 'dev'
    obj.srconfig = '"dev"'
    break;
  default: //默认开发
    process.env.srconfig = ''
    obj.srconfig = '""'
    break;
}

module.exports = obj;

