const xlsx = require('node-xlsx')
const fs = require('fs');
const path = require('path')
const config = require('./config.js')
// const regFilter = /欢|倩/g
console.log(process.argv)
const sourceDir = path.resolve(__dirname, './sources')
const targetDir = path.resolve(__dirname, './target')

const mkdir = () => {
  console.log(`正在创建目录${targetDir}...`)
  fs.mkdir(targetDir, (err, data) => {
    if (err) {
      console.error(err)
      throw err
    } else {
      console.log(`创建目录${targetDir}成功`)
      check()
    }
  })
}

const check = () => {
  fs.exists(targetDir, (isExist) => {
    if (isExist) {
      if (config && config.filterKeys && Array.isArray(config.filterKeys) && config.filterKeys.length) {
        const filterKeys = config.filterKeys.filter(item => item)
        const regFilter = new RegExp(`${filterKeys.join('|')}`, 'g')
        console.log(regFilter)
        doExcel(regFilter)
      } else {
        console.error('参数错误: config.js--filterKeys')
      }
    } else {
      console.error(`${targetDir}目录不存在...`)
      mkdir()
    }
  })
}
const doExcel = (reg) => {
  fs.readdir(sourceDir, (err, files) => {
    const fileNames = files
    if (fileNames && fileNames.length) {
      console.log(fileNames)
      console.log('正在解析Excel文件, 请耐心等待...')
      fileNames.forEach(file => {
        console.log(file)
        const tagetData = []
        const sheetList = xlsx.parse(path.resolve(`${sourceDir}/${file}`));
        // console.log(sheetList)
        sheetList.forEach((sheet, sindex) => {
          const sheetDatas = sheet.data || []
          // console.log(sheet)
          const rowData = {
            name: sheet.name,
            data: []
          }
          sheetDatas.forEach((row, rindex) => {
            console.log(rindex)
            if (rindex > 0) {
              for (let i = 0; i< row.length; i++) {
                // console.log(row[i])
                if (reg.test(row[i])) {
                  rowData.data.push(row)
                  break
                }
                // 构造大数据量
                // let j = 0
                // while (j < 2000) {
                //   rowData.data.push(row)
                //   j++
                // }
              }
            } else {
              rowData.data.push(row)
            }
          })
          tagetData.push(rowData)
        })
        console.log(`数据量级：${tagetData[0].data ? tagetData[0].data.length : 0}`)
        console.log('正在转换Buffer数据, 请耐心等待...')
        //将经过处理的数据写入新的xlsx文件中
        const buffer = xlsx.build(tagetData);
        // const buffer = Buffer.from(tagetData);
        console.log('正在写入文件，写入操作比较耗时，请耐心等待，在没有出现进一步提示或者报错情况下，请勿操作...')
    
        // 同步写入
        fs.writeFileSync(path.resolve(`${targetDir}/export_ ${file}`), buffer, {'flag':'w'});
        console.log("写入完成。");
        console.log(`请打开以下目录查看文件名为export_${file}的Excel文件,如没有文件请重试！！！`)
        console.dir(targetDir)
    
        // 异步写入
        // fs.writeFile(path.resolve(targetDir + '/export_' + fileName), buffer, {'flag':'w'}, (werr, data) => {
        //   if (werr) {
        //     console.log(werr)
        //     throw werr
        //   } else {
        //     console.log("写入完成。");
        //     console.log(`请打开以下目录查看文件名为export_${file}的Excel文件,如没有文件请重试！！！`)
        //     console.dir(targetDir)
        //   }
        // })
    
        // 流写入
        // const writerStream = fs.createWriteStream(path.resolve(targetDir + '/export_' + fileName), {'flag':'w'});
        // // 使用 utf8 编码写入数据 
        // writerStream.write(buffer, 'UTF8');
        // // 标记文件末尾
        // writerStream.end();
        // // 处理流事件 --> finish 事件
        // writerStream.on('finish', function() {
        //   /*finish - 所有数据已被写入到底层系统时触发。*/
        //   console.log("写入完成。");
        //   console.log(`请打开以下目录查看文件名为export_${file}的Excel文件,如没有文件请重试！！！`)
        //   console.dir(targetDir)
        // });
        // writerStream.on('drain', function () {
        //   console.log("内存干了");
        // });
        // writerStream.on('error', function(err2){
        //   console.log(err2.stack);
        //   throw err2
        // });
      })
    } else {
      console.error(`${targetDir}未发现文件`)
    }
  })
}

// 程序入口
check()
