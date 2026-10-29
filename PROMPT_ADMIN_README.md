# AI提示词管理系统

## 概述

这是一个专门用于管理AI命理分析系统中四个核心模块提示词的后台管理系统。通过这个系统，您可以轻松地调整和优化AI分析的质量和方向。

## 功能特性

### 🎯 四个核心模块
1. **优劣混合分析** (analysis) - 结合三盘找出用户的优势与劣势，深度剖析命理结构
2. **思维导图呈现** (mindmap) - 用思维导图方式呈现命理构造与人生主线
3. **运势预测报告** (fortune) - 基于当前时间未来12个月运势详细预测，助用户把握人生机遇
4. **个性化建议** (qa) - 五维30个核心问题深度解答，提供个性化建议

### 🔧 管理功能
- **实时编辑** - 在线编辑prompt模板，支持语法高亮
- **实时预览** - 预览prompt格式化后的效果，包含示例数据
- **版本管理** - 自动记录修改时间和版本号
- **一键重置** - 快速恢复到默认模板
- **自动保存** - 修改后自动保存到文件系统

## 使用方法

### 1. 访问管理界面
在浏览器中访问：`http://localhost:3000/prompt-admin`

或者在首页Header中点击"管理"按钮。

### 2. 选择要编辑的模块
在左侧面板中选择要编辑的prompt模块：
- 📊 优劣混合分析
- ⭐ 思维导图呈现  
- 🔮 运势预测报告
- 💡 个性化建议

### 3. 编辑prompt内容
在右侧编辑区域中修改prompt模板内容。支持以下变量：

#### 用户基本信息变量
- `{gender_str}` - 性别
- `{birth_date}` - 出生日期
- `{birth_time}` - 出生时间
- `{true_solar_time}` - 真太阳时
- `{location_name}` - 出生地点
- `{longitude}` - 经度
- `{latitude}` - 纬度
- `{timezone}` - 时区

#### 八字命理变量
- `{bazi_year_pillar}` - 年柱
- `{bazi_month_pillar}` - 月柱
- `{bazi_day_pillar}` - 日柱
- `{bazi_hour_pillar}` - 时柱
- `{bazi_day_master}` - 日主
- `{bazi_body_strength}` - 身强身弱
- `{bazi_five_elements}` - 五行统计
- `{bazi_ten_gods}` - 十神配置
- `{bazi_enhanced_analysis}` - 详细八字分析

#### 其他命理数据
- `{ziwei_data}` - 紫微斗数数据
- `{vedic_data}` - 印度星盘数据

#### 运势预测专用变量
- `{current_month}` - 当前月份
- `{prediction_start}` - 预测开始月份
- `{prediction_end}` - 预测结束月份
- `{prediction_months}` - 预测月份列表

### 4. 预览效果
点击"预览"按钮查看prompt格式化后的效果，包含示例数据。

### 5. 保存修改
点击"保存"按钮保存修改，系统会自动更新版本号和时间戳。

### 6. 重置到默认
如果需要恢复到默认模板，点击"重置"按钮。

## API接口

### 获取所有prompt模板
```
GET /api/prompt-admin/prompts
```

### 获取指定prompt模板
```
GET /api/prompt-admin/prompts/{prompt_name}
```

### 更新prompt模板
```
PUT /api/prompt-admin/prompts/{prompt_name}
Content-Type: application/json

{
    "content": "新的prompt内容",
    "version": "1.1.0"
}
```

### 重置prompt模板
```
POST /api/prompt-admin/prompts/{prompt_name}/reset
```

### 预览prompt模板
```
GET /api/prompt-admin/prompts/{prompt_name}/preview
```

## 文件存储

prompt模板文件存储在：`backend/data/prompts/` 目录下
- `analysis.json` - 优劣混合分析模板
- `mindmap.json` - 思维导图呈现模板
- `fortune.json` - 运势预测报告模板
- `qa.json` - 个性化建议模板

## 注意事项

1. **变量格式** - 所有变量必须使用 `{变量名}` 的格式
2. **JSON格式** - 确保AI返回的JSON格式正确，避免解析错误
3. **版本控制** - 建议在修改前记录当前版本，以便回滚
4. **测试验证** - 修改后建议生成一个测试报告验证效果
5. **备份重要** - 重要修改前建议备份当前模板

## 故障排除

### 常见问题

1. **模板加载失败**
   - 检查文件权限
   - 确认JSON格式正确
   - 查看后端日志

2. **变量格式化错误**
   - 检查变量名是否正确
   - 确认变量在数据中存在
   - 查看错误信息中的具体变量名

3. **保存失败**
   - 检查文件写入权限
   - 确认磁盘空间充足
   - 查看后端错误日志

### 日志查看

后端日志位置：控制台输出
前端日志位置：浏览器开发者工具Console

## 技术支持

如有问题，请检查：
1. 后端服务是否正常运行 (http://localhost:8000)
2. 前端服务是否正常运行 (http://localhost:3000)
3. 网络连接是否正常
4. 浏览器控制台是否有错误信息 