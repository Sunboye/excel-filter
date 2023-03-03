const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path')
const config = require('./config.js')
// exceljs 所需的 polyfills
require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime')

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

const fileType = (files) => {
  console.log(files)
  const allowExts = config && config.fileExt && config.fileExt.length ? config.fileExt : []
  if (files && files.length) {
    return files.filter(item => {
      const filePath = `${sourceDir}/${item}`
      return allowExts && allowExts.length ? !fs.statSync(filePath).isDirectory() && allowExts.includes(path.extname(filePath)) : !fs.statSync(filePath).isDirectory()
    }) || []
  }
  return []
}

const doExcel = (reg) => {
  fs.readdir(sourceDir, (err, files) => {
    const fileNames = fileType(files)
    console.log(fileNames)
    if (fileNames && fileNames.length) {
      console.log('正在解析Excel文件, 请耐心等待...')
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
          console.log('vv')
          console.log(targetDir)
        });
        workbookReader.on('error', (readerErr) => {
          console.dir(readerErr)
          throw readerErr
        });
      })
    } else {
      console.error(`${targetDir}未发现文件`)
    }
  })
}

// 程序入口
check()
