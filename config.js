const path = require('path');
const log4js = require('log4js');

// 文件过滤规则，不过滤可以改为空数组或者删除
const fileExt = ['.xlsx', '.cvs', '.xls']
// 关键字
const filterKeys = ['欢', '倩', '', null, undefined]

 
// 配置log4js
log4js.configure({
    replaceConsole: true,  // 版本已不支持此配置
    appenders: {
        // 控制台输出
        console: { type: 'console'},
        // out: { type: "stdout" },
        // 全部日志文件
        all: { 
          type: 'file',
          filename: path.join(__dirname, './logs/all-log.log'),
          maxLogSize: 104800,
          backups: 100
        },
        // 错误日志文件
        error: {
          type: 'dateFile',
          filename: path.join(__dirname, './logs/error'),
          alwaysIncludePattern: true,
          pattern: "yyyy-MM-dd-hh.log"
        }
    },
    categories: {
        // 默认日志，输出debug 及以上级别的日志
        default: { appenders: [ 'all', 'console' ], level: 'trace' },
        // 错误日志，输出error 及以上级别的日志
        error: { appenders: [ 'error' ], level: 'error' },
    }
});
const config = {
  fileExt: fileExt,
  filterKeys: filterKeys,
  logger: {
    nomal: log4js.getLogger(),
    error: log4js.getLogger('error')
  }
}

// 重构console打印方法
const nomalLogger = config.logger.nomal
console.log = nomalLogger.info.bind(nomalLogger)
console.dir = nomalLogger.trace.bind(nomalLogger)
console.error = nomalLogger.error.bind(nomalLogger)

module.exports = config