# 🎴 托业单词记忆大挑战

TOEIC Vocabulary Memory Game - 趣味学英语，挑战你的词汇量！

## 🎮 游戏特色

- **单人闯关模式**：5 个关卡，逐步提升难度
- **托业核心词汇**：50+ 商务职场高频单词
- **星级评价系统**：步数越少，星级越高
- **单词本功能**：随时查看和学习词汇
- **排行榜**：和同事朋友 PK 分数

## 🚀 部署到公网（3 种方式）

### 方式 1：Vercel 部署（推荐，永久免费）

#### 步骤：
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 上传 `toeic-game` 文件夹内容
5. 点击 "Deploy"
6. 获得永久访问链接！

**优点**：
- ✅ 永久免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 支持自定义域名

### 方式 2：Netlify 部署（拖拽部署）

#### 步骤：
1. 访问 https://app.netlify.com/drop
2. 将 `toeic-game/dist` 文件夹拖到页面
3. 获得访问链接！

**优点**：
- ✅ 最简单，无需注册
- ✅ 拖拽即可部署
- ✅ 自动生成链接

### 方式 3：GitHub Pages（适合开发者）

#### 步骤：
1. 创建 GitHub 仓库
2. 上传代码
3. 在 Settings → Pages 启用
4. 获得 `username.github.io/repo` 链接

## 📱 本地运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🎯 游戏规则

1. **翻牌配对**：点击卡牌翻开，找到**单词和对应释义**
2. **匹配消除**：配对成功则消除
3. **通关条件**：全部匹配完成即过关
4. **评分标准**：
   - ⭐⭐⭐：10 步以内
   - ⭐⭐：11-15 步
   - ⭐：15 步以上

## 📚 词库说明

包含 50+ 托业（TOEIC）核心商务词汇，如：
- agenda（议程）
- budget（预算）
- deadline（截止日期）
- revenue（收入）
- strategic（战略的）
- 等...

## 🌐 访问链接

部署成功后，分享给同事的链接格式：
```
https://your-app.vercel.app
```

## 📊 数据统计

游戏会自动保存：
- 通过关卡数
- 总积分
- 最佳成绩

数据保存在浏览器本地存储（LocalStorage）。

## 🎨 技术栈

- Vue 3（Composition API）
- Vite（构建工具）
- Element Plus（UI 组件）
- CSS3（动画效果）

## 📄 License

MIT

---

**🦞 开发：小龙虾**
**📅 日期：2026-03-16**

**享受游戏，快乐学英语！** 🎉
