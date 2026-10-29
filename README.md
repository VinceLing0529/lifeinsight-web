# LifeInsight · 生命洞察

**三盘融合的 AI 命理分析系统** —— 在同一张盘里同时排出八字、紫微斗数与印度星盘，再由大模型交叉解读。

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)
![React](https://img.shields.io/badge/frontend-React_18-61dafb)

🌐 **在线 Demo**：部署中，上线后在此更新 · 网页版仓库即本仓库，命令行版见 [lifeinsight-paipan](https://github.com/VinceLing0529/lifeinsight-paipan)

---

## 为什么做三盘

单看一个体系总有盲区：八字看五行气势与大运，紫微看十二宫结构与四化，印度盘看行星力量与分盘。三个体系对同一个人给出的结论能互相印证、也互相纠错。这个项目做的事很直接：**输入一次出生信息，三套盘同时算完，结构化输出，再交给 AI 做融合解读。**

## 核心特性

- **三盘合一排盘** —— 八字（sxtwl）、紫微斗数（py-iztro）、印度星盘（flatlib）同盘计算，输出四柱五行、十二宫四化、行星宫位等完整结构化数据
- **真太阳时与全球时区** —— 按出生地经纬度自动查时区并做真太阳时校正，海外出生也能排
- **AI 融合解读** —— 接入大模型（OpenAI 兼容接口，可切换 DeepSeek），按性格 / 事业 / 感情 / 健康 / 综合生成分析报告，附 Mermaid 思维导图可视化
- **Prompt 管理后台** —— 解读用的 prompt 模板可在后台编辑、版本化，不用改代码重发版
- **兑换码系统** —— 自带兑换码生成与核销，方便做额度/会员类的运营（个人项目里算个彩蛋）

## 快速开始

环境要求：Python 3.8+、Node.js 16+

```bash
git clone https://github.com/VinceLing0529/lifeinsight-web.git
cd lifeinsight-web
```

后端（FastAPI，默认 http://localhost:8000）：

```bash
cd backend
pip install -r requirements.txt
cd app
python main.py
```

前端（React，默认 http://localhost:3000）：

```bash
cd frontend
npm install
npm start
```

AI 解读需要在后端 `.env` 里配置大模型 API Key（OpenAI 兼容接口）：

```bash
# .env 示例
DEEPSEEK_API_KEY=sk-...
# 或按 backend/README_DEEPSEEK.md 切换到 DeepSeek
```

不配置 Key 时，排盘与本地规则分析照常可用，只有 AI 报告不可用。

---

## 📖 使用指南

### 基本使用流程

1. **填写出生信息**
   - 出生日期和时间
   - 出生地经纬度（支持常用城市快选）
   - 性别选择

2. **查看命盘结果**
   - 八字四柱和五行分析
   - 紫微斗数十二宫和主星分布
   - 印度星盘行星位置和宫位信息

3. **生成分析报告**
   - 选择分析类型（性格、事业、感情、健康、综合）
   - ChatGPT智能分析或本地规则分析
   - 查看详细解读和建议

4. **可视化展示**
   - 生成思维导图
   - 下载PDF报告（开发中）

### API接口

#### 命盘计算
```http
POST /api/charts/calculate
Content-Type: application/json

{
  "birth_date": "2000-01-01",
  "birth_time": "00:00",
  "longitude": 116.4,
  "latitude": 39.9,
  "gender": 1,
  "location_name": "北京"
}
```

#### 时区查询
```http
GET /api/timezone?longitude=116.4&latitude=39.9
```

#### 生成思维导图
```http
POST /api/analysis/mindmap
Content-Type: application/json

{
  "chart_data": {...},
  "focus_area": "comprehensive"
}
```

#### ChatGPT分析
```http
POST /api/analysis/chatgpt
Content-Type: application/json

{
  "chart_data": {...},
  "analysis_type": "personality",
  "custom_question": "我适合什么职业？"
}
```

## 🔧 开发指南

### 项目结构

```
lifeinsight-web/
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── main.py         # 应用入口
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心工具
│   │   └── triple_chart_parser.py  # 三盘计算模块
│   └── requirements.txt
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── services/       # API服务
│   │   └── App.js         # 主应用
│   ├── public/
│   └── package.json
└── README.md
```

### 开发规范

- 后端遵循RESTful API设计
- 前端使用函数式组件和Hooks
- 统一的错误处理和用户反馈
- 响应式设计，支持移动端

### 测试

```bash
# 后端测试（开发中）
cd backend
python -m pytest

# 前端测试
cd frontend
npm test

# API连接测试
curl http://localhost:8000/health
```

## 🎯 路线图

### v1.0 (当前)
- [x] 基础三盘计算功能
- [x] 时区自动识别
- [x] 响应式界面设计
- [x] 思维导图生成
- [x] ChatGPT分析接口

### v1.1 (计划中)
- [ ] PDF报告生成
- [ ] 用户账户系统
- [ ] 历史记录管理
- [ ] 更多分析维度
- [ ] 批量分析功能

### v2.0 (未来)
- [ ] 移动端App
- [ ] 实时推运分析
- [ ] 社区分享功能
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## ⚠️ 免责声明

本系统提供的命理分析仅供参考和娱乐，不应作为人生重大决策的唯一依据。命运掌握在自己手中，积极向上的心态才是成功的关键。

## 📞 联系我们

- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮箱：contact@lifeinsight.com

---

<div align="center">
  <p>Made with ❤️ by LifeInsight Team</p>
  <p>© 2024 生命洞察命盘分析系统</p>
</div> 