const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path')
// exceljs 所需的 polyfills
require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime')
console.log(process.argv)
const config = require('./config.js')
// const regFilter = /欢|倩/g

const doExcel = (reg) => {
  const sourceDir = path.resolve(__dirname, './sources')
  const targetDir = path.resolve(__dirname, './target')
  fs.readdir(sourceDir, (err, files) => {
    const fileNames = files
    if (fileNames && fileNames.length) {
      fileNames.forEach(file => {
        console.log(`正在对文件${file}建立读写通道, 请耐心等待...`)
        const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(`${sourceDir}/${file}`);
        const workbookWrite = new ExcelJS.stream.xlsx.WorkbookWriter({filename: `${targetDir}/${file}`});//创建一个流式写入器
        
        workbookReader.read();
        let sheet = {}
        workbookReader.on('worksheet', worksheet => {
          console.log(`正在对文件${file}----${worksheet.name}进行读写操作，请耐心等待...`)
          sheet = workbookWrite.addWorksheet(worksheet.name);//添加工作表
          worksheet.on('row', (row, index) => {
            if (row._number > 1) {
              const rowValues = row.values || []
              for (let i = 0; i < rowValues.length; i++) {
                if (reg.test(rowValues[i])) {
                  sheet.addRow(rowValues).commit();
                  break
                }
              }
              // 构造大数据量
              // let j = 0
              // while (j < 69400) {
              //   sheet.addRow(rowValues).commit();
              //   j++
              // }
            } else {
              sheet.addRow(row.values).commit();
            }
          });
        });
    
        workbookReader.on('shared-strings', sharedString => {
          console.dir(sharedString)
        });
    
        workbookReader.on('hyperlinks', hyperlinksReader => {
          console.dir(hyperlinksReader)
        });
    
        workbookReader.on('end', () => {
          sheet.commit();//提交工作表
          workbookWrite.commit()//提交工作簿，即写入文件
          console.log('end')
          console.log(`请打开以下目录查看文件名为${file}的Excel文件,如没有文件请重试！！！`)
          console.log('vv\nvv\nvv\nvv')
          console.log(targetDir)
        });
        workbookReader.on('error', (rerr) => {
          console.dir(rerr)
          throw rerr
        });
      })
    } else {
      console.error(`${targetDir}没有文件`)
    }
  })
}
if (config && config.filterKeys && Array.isArray(config.filterKeys) && config.filterKeys.length) {
  console.log(config.filterKeys)
  const filterKeys = config.filterKeys.filter(item => item)
  const regFilter = new RegExp(`${filterKeys.join('|')}`, 'g')
  console.log(regFilter)
  doExcel(regFilter)
} else {
  console.error('参数错误: config.js--filterKeys')
  return
}