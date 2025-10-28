### 源代码说明

- 构建程序：[vitepress](http://vitepress.dev) 版本 `1.1.0`。
- 打包部署：[node](https://nodejs.org/zh-cn/download/releases/) 版本 [v20.11.0](https://nodejs.org/download/release/v20.11.0/)。
- 主题源自：[hugo-ivy](https://github.com/yihui/hugo-ivy)。
- 目录结构：

```markdown
lipk.org-vitepress
│
├─ .github             # GitHub 配置文件夹
│     └─ ......
├─ .gitignore          # Git 忽略配置文件
├─ package.json        # 项目包文件
├─ pnpm-lock.yaml      # pnpm 依赖 lock 文件
├─ .vitepress          # 站点 vitepress 文件夹
│    ├─ config.ts      # vitepress 配置文件
│    ├─ shim.d.ts      # 工作区 TypeScript 类型声明文件
│    ├─ theme.d.ts     # 主题 TypeScript 类型声明文件
│    ├─ tsconfig.json  # TypeScript 工作区配置文件
│    └─ theme          # vitepress 主题文件夹
│         └─ ......
├─ .vscode             # 工作区 vs Code 配置文件夹
│    └─ ......
├─ make-font           # 字体生成模块，生成每个页面首次加载时的最小字体文件
│    └─ ......
├─ make-routes         # 路由生成模块，vitepress 居然没有站点的路由数据
│    └─ ......
├─ make-version        # 版本信息生成模块，页面 Footer 显示本项目的最后更新时间
│    └─ ......
└─ site                # 站点文件夹
     ├─ index.md       # 首页
     ├─ about.md       # 关于
     ├─ food.md        # 菜谱
     ├─ resume.md      # 简历
     ├─ blog           # 博客文件夹
     │    └─ ......
     ├─ components     # 页面组件文件夹
     │    └─ ......
     └─ public         # 站点静态资源文件夹
          └─ ......
```

以上目录结构生成来自 [Dir Tree Noter](http://dir.yardtea.cc/)📁。

### 代码运行

1. 下载安装符合版本的 [node v20.11.0](https://nodejs.org/download/release/v20.11.0/)。
2. 运行 `npm install pnpm -g` 安装 pnpm

命令行使用如下命令测试安装是否就绪：

```shell
node --version
# v20.11.0
```

2. 安装依赖软件

命令行：

```shell
pnpm install
```

3. 运行

命令行：

```shell
npm run dev
```

### 鸣谢

1. [GitHub](http://github.com)🏆。
2. [Yihui Xie](http://github.com/yihui)❤。
3. [Utterances](http://github.com/utterance/utterances)🔮。

以上项目的组织及所有者，为本项目的实现提供的支持。
