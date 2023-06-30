<!--
 * @Author: yangss
 * @Position: 
 * @Date: 2023-06-27 18:37:07
 * @LastEditors: yangss
 * @LastEditTime: 2023-06-30 11:15:10
 * @FilePath: \excel-filter\README.md
-->
# excel-filter
根据设置的关键字对Excel文件进行模糊过滤操作，过滤后的数据生成新的Excel文件


## 功能概述
根据自定义的关键字对Excel文件进行过滤操作，Excel一行内任意一个cell的内容包含关键字，则保留该行，否则删除该行，过滤后的数据生成新的Excel文件


## 使用说明

### 依赖环境

1. 安装[nodejs](https://nodejs.org/zh-cn/)，版本 >= 10

### 支持
1. 支持xlsx格式文件（其他格式未验证）
2. 多sheet页

### 使用步骤

1. 进入目录 /excel-filter下
2. 保证CMD 或者 其他控制台在当前目录下，执行  `npm install` 命令，安装依赖（因为网络原因，可能需要稍作等待）
3. 把源文件（要转换的文件）放在 /source 下
4. 本目录下， `config.js` 文件，filterKeys配置关键字,数组类型
5. 执行 `npm run xlsx` 或者 `npm run excel` 执行脚本，执行完成之后，在 /target 目录下找处理后的Excel文件


### 使用场景
 - `npm run xlsx`: 文件IO读写，基于node-xlsx插件，不支持超大文件读写（满足日常需求，经测试，小几十万行数据是没问题的）
 - `npm run excel`: 流式IO，基于exceljs插件，没有文件大小限制，建议用于超大文件


 ## 更新日志

- 集成log4js日志管理模块[commit](https://github.com/sunboye/excel-filter/commit/be47ce2b1ec86e224abec4e8f206874d8dc4c1ac)