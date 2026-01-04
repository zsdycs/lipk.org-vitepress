---
title: '简历'
# titleTemplate: '简历 - :title'
notComment: true
notPostNav: true
# pictureView: [
#   {
#     title: '我的照片',
#     src: '/images/resume.jpg',
#   }
# ]
notEditInfo: true
---

<!-- <figure class="image">
  <img loading="lazy" src="/images/resume.jpg" alt="我的照片" title="我的照片" height="150">
  <figcaption class="image-description notPrint">我的照片</figcaption>
</figure> -->

## 基本信息

<div class="resume-basics-box">
  <ul>
    <li>姓名：李鹏坤</li>
    <li>教育：苏州大学，软件工程（本科学士）</li>
    <li>邮箱：<a href="mailto:mail@lipk.org">mail@lipk.org</a><span class="print">；手机：17328166404</span></li>
    <li>GitHub：<a href="https://github.com/zsdycs" target="_blank">https://github.com/zsdycs</a></li>
    <li>个人网站：<a href="https://lipk.tech" target="_blank">https://lipk.tech</a>（国内）<a href="https://lipk.org" target="_blank">https://lipk.org</a>（国外）</li>
    <li class="print-li">在线简历：<a href="https://lipk.tech/resume" target="_blank">https://lipk.tech/resume</a></li>
    <!-- <li>籍贯：广东 · 中山。</li>
    <li>位置：江苏 · 苏州。</li> -->
  </ul>
</div>

## 个人概况

- 拥有多框架开发经验（Vue / React / Angular），深入理解 Vue 响应式系统、虚拟 DOM 及核心运行机制。
- 深度理解 JavaScript 高级特性与运行机制，涵盖 执行上下文、ES5/ES6 继承、代理和反射、DOM 事件流及事件循环。
- 具备复杂前端系统与可视化应用经验，熟练使用 Mapbox-GL、MQTT、WebSocket、ECharts、D3 构建实时数据可视化大屏。
- 熟悉前端工程化与构建体系，能够基于 Vite / Webpack 进行工程架构设计、性能优化与构建流程定制。
- 具备系统化的前端性能优化能力，能够定位并解决 加载性能、渲染瓶颈及内存泄漏问题。
- 具备 Uni-App 与微信小程序 多端开发经验，对包体积控制、性能调优有实践沉淀。
- 具备 DevOps 能力，熟悉 Linux / Nginx / Docker / Jenkins，可独立完成前端项目的部署、发布与运维。
- 具备良好的技术钻研能力，能够从 依赖库源码层面 定位和解决问题，长期参与开源社区并贡献代码，在 GitHub 上有被采纳的 [PR](https://github.com/search?q=type:pr+author:zsdycs&type=Issues) 和有价值的 [Issues](https://github.com/search?q=type%3Aissue+author%3Azsdycs&type=Issues&p=2)。

<!-- 执行上下文4、ES5/ES6 继承8、代理和反射9、DOM 事件流17、事件循环27 -->

# print-page-break1 { .print-page-break }

## 工作经历

- **苏州申智核智能科技有限公司**，2023.02 ~ 2025.12，*高级前端开发工程师*，兼任*项目经理、技术面试官*。
  - 负责公司前端技术选型，搭建前端核心基础库，制定并落地前端开发规范与最佳实践。
  - 解决项目中复杂的技术问题，推进性能优化、技术重构与版本升级，保障项目长期可维护性。
  - 与客户进行需求沟通与分析，将业务需求拆解为前后端技术方案与开发任务，并协调资源、把控项目整体进度与风险。
  - 推动公司从 SVN 向私有 GitLab 的代码与文档协作体系迁移，并搭建 GitLab + Jenkins 自动化构建与部署流程，实现研发流程规范化。
- **苏州京东工品汇信息科技有限公司**，2021.10 ~ 2023.02，*中级前端开发工程师*。
  <!-- - Vue + 公司内部 UI 框架，使用 Git 进行协同办公。
  - 根据 PRD  设计书、原形设计和 UI  设计完成页面开发
  - 负责产品全模块前端开发的需求变更及 bug  处理工作
  - 优化页面及公共组件功能及交互，并优化、拆分和重写代码
  - 负责新人代码 review
  - 对前端开发任务工时进行评估 -->
- **方舟信息技术（苏州）有限公司**，2019.06 ~ 2021.10，*初级前端开发工程师*。
  <!-- - Angular + Ant Design、Angular + 公司内部 UI 框架、Ruby + Rails + JQ + PostgreSQL 以及 Vue + Ant Design 等，使用 Git 进行协同办公。 -->
- **用友网络科技股份（苏州）有限公司**，2018.09 ~ 2019.04，*Web 前端开发实习生*。
  <!-- - React + 钉耙的前端开发、Express + MongoDB + UI 框架 Semantic UI + Vue.js 搭建动态站点的全栈开发，使用 Git 进行协同办公。 -->

# print-page-break2 { .print-page-break }

## 主要工作项目

- 「核应急指挥系统（KCC）」，项目负责人
  - 该系统部署于红沿河、大亚湾、防城港三大核电基地应急指挥中心。前端分为“平台服务”、“流程服务”、“标准服务”、“管理后台”、“数据传输管理”等多个站点，通过自研的 iframe 通信架构实现前端微服务，前端关键功能包含：实时大屏、GIS、审批工作流引擎、Office 文档在线编辑、数据自动同步、消息提醒、钉钉小程序等。在发展的过程中，由各站点独立仓库转为 monorepo 库，各基地以不同分支区分。将核心组件独立，形成 @szh-fc 前端核心库，发布于私有 Nexus 仓库
  - **自研的 iframe 通信架构**
    - 借助 postMessage、CustomEvent、Promise 和 AbortController，封装了 iframe 间的数据通信与监听流程，使子应用在被嵌入时能初始化并实时接收主应用公共数据，解决多 iframe 场景下的初始化同步与状态检测问题。
    - 用 Vue 实例和浏览器 postMessage 建了一个既能在页面内（Vue 事件总线）又能跨 iframe 通信的总线，解决了父子页面之间事件分发与回调管理的一致性问题。
  - **@szh-fc 前端核心库**
    - @szh-fc/utils 工具方法库，关键方法：主应用数据接收等待器、可取消的 iframe 事件监听器、iframe 事件发送器。
    - @szh-fc/shared 公共的、纯 JS 的、lib 类型的代码库，包含：auto-update（自动更新页面）、bus（集成 iframe 事件通信的 VueBus 事件增强）、receive-main-app-data（在加载时获取、订阅 iframe 主应用数据）、mqtt-client（创建连接、订阅主题、发布消息、取消订阅、销毁连接）、opcua-ws-connect（按点监控、分发数据回调、处理旧连接切换）、opcua-ws（opcua 连接创建和断开）。
    - @szh-fc/ne-ui 公共 UI 组件库，主要包含：HTML 组件（frame-view、icon-fonts等）、页面行为组件（iframe-bus、mqtt-base、opcua-base）、公共 CSS。
    - @szh-fc/http HTTP 通信库，包含项目用到的所有 RESTFUL API 调用方法，通过自定义事件类 EventEmitter，以发布-订阅的设计模式与业务代码解耦，各项目实现自定义错误处理。
    - @szh-fc/build-tools 处理编译发布的命令行工具库，主要包含：szh-build（编译发布，\*全流程处理）、szh-replace、szh-rm、szh-version（根据 git 信息，生成版本页）、szh-config-sync-watch（实现配置监听并同步），由项目根目录的“.szh-build.js”配置文件或命令行参数进行配置。
  - **亮点功能**
    - 基于 Canvas 图形计算 实现实时数据状态决策引擎，通过上下文的getImageData方法，像素级颜色查找，替代复杂数学建模，实现状态判定，并通过图形配置实现业务规则解耦，显著提升系统性能与可维护性。
- 「[京东京采云](https://www.jdbusiness.com/jdsolution_cy.html)」，项目组成员
  - 该 SRM 系统通过 13 个 Vue2 服务组成，微前端基于 [qiankun](https://qiankun.umijs.org/)。独立负责多个模块服务的开发，参与 JDSRM-UI 组件的问题修复工作。编写的上传下载组件成为系统标准，拆分、整理并优化了大量页面的代码逻辑和页面结构，使代码易于维护。
- 「北人亦创国际会展中心展会系统」，项目前端负责人
  - 基于 Uni-App 框架实现的**微信小程序**，基于 RuoYi-UI 开发的后台管理系统，功能包含：资料上传下载、餐饮及酒店预订、列表无限滚动、订单信息二维码生成及小程序扫码核销等。

<!-- - 「快递上门系统」
  - 独立开发，**微信原生小程序**，实现类 Material Design 的表单组件。后台管理基于 Element 开发。
- 「[日本環境省](https://www.env.go.jp/) 的“地方公共団体実行計画策定・管理等支援システム”」
  - 该项目基于 Angular，参与该系统 2019、2020 年度“施行状況調査”的开发工作。该调查问卷有 5 个类别，3 类调查对象，各个对象内容不同，设问互有关联及矛盾验证。
- 「[日本警察庁](https://www.npa.go.jp/)“サイバー攻撃分析センタ”」
  - 该项目基于 Angular，编码要求极高，每周一次逐行 code review，使我对个人代码 style lint、非空处理和变量命名等有较高的要求。
- 「日本“島根県健康管理システム”」
  - 是一个 ruby 项目，开发环境使用 VirtualBox 和 Vagrant。为了我的 ruby 代码可以得到 lint 审查，于是就有了 [Ruby-rubocop 使用方法](https://www.lipk.org/blog/2020/05/15/how-to-use-ruby-rubocop/) 。
- 「[VRAINERS 動物病院](https://www.vrainers.jp/) 」
  - V3.1 版本的开发，该项目使用了：gRPC、Angular10、[material](https://next.material.angular.io/components)、docker。用 [zeplin](https://zeplin.io/)（layout）、[backlog](https://backlog.com/)（设计书）及 github（代码及 issue）。
- 「日本 [“建設キャリアアップシステム”](https://www.ccus.jp/p/info)」
  - 是个庞大的基于 Angular 的系统， [stubby](https://www.npmjs.com/package/stubby) route.json 中的 request 仍有 1053 个。参与了“2020 下期開発”的工作，案件 396 个，参与了约 30% 的案件编码工作。 -->

## 主要开源项目

- [zsdycs/lipk.org-vitepress](https://github.com/zsdycs/lipk.org-vitepress) 网站
  - 从 Hugo 转到 Vitepress 的静态网站。基于 Vitepress 开发的自定义主题，页面字体子集化，动态生成目录，SEO 优化，Bing、Google 搜索“李鹏坤”，结果排名第一。
- [beaudar/beaudar](https://github.com/beaudar/beaudar) 表达
  - 基于 GitHub issue 的轻量评论插件，基于 [Utterances](https://utteranc.es/) 开发，构建由 Parcel 转为 Vite，处理了“异常及错误处理、仓库分支项配置、精确化的评论与Issues映射”等若干问题修复及新功能。
- [zsdycs/ginpun](https://github.com/zsdycs/ginpun) 开源键盘
  - 固件基于 [QMK](https://github.com/qmk/qmk_firmware)，主控为 ATmega32u4。启发于 [system76/launch](https://github.com/system76/launch)，采用 Gasket 机械结构，外壳专为 3D 打印而设计。

<!-- # print-page-break2 { .print-page-break } -->

<!-- ## 教育背景

- 2017.09 ~ 2019.07 **苏州大学**，软件工程学士。
  - 必修课：
    JAVA 程序设计、软件系统分析与设计、软件项目管理、计算机网络、软件质量保证、计算机安全技术、信息系统与企业管理、Linux 系统及应用、CASE 等。
- 2016.09 ~ 2019.07 **苏州市职业大学**，软件技术专科生。
  - 必修课：
    程序逻辑设计与编程规范 (C)、C# 应用程序设计 (WinFrom)、 SQL Server 数据库应用、数据结构、 APP 产品交互设计、 ASP.net 商务网站设计、 Web 系统 UI 设计、iOS 开发技术、计算机网络基础、面向对象程序设计 (JAVA)、实用软件工程与 UML、Web 前端开发等。 -->

<!-- ## 技能证书

- 国家计算机三级（办公软件应用模块高级操作员级）
- 国家计算机四级（语言程序设计编制模块 C# 语言程序员级） -->

<!-- ## 计算机水平

- 开发工具：VS Code ~~VS、DW、Axure、Eclipse~~。
- 框架：Vue、React、Angular，Express、Koa，Element、Ant Design、Semantic UI 等，JavaScript 生态的框架。
- 编程语言：JavaScript、TypeScript、NodeJs、HTML、CSS、Sass ~~C#、JAVA、 PHP、 C~~。
- 数据库：MongoDB ~~MySQL、SQL Server、Oracle~~。
- 应用软件：Git、SVN、Word、Excel、PowerPoint、PS ~~AE、AU、PR~~ 等。
- 操作系统：Windows、MacOS、Linux。 -->

<!-- # print-page-break3 { .print-page-break } -->

<!-- ## 校内活动

- 计算机工程学院团委宣传部，干事。
  - 拍摄学院及学校活动的新闻照片。
  - 新闻稿、微信推文的撰写工作。
  - 在任职期获“优秀工作者”称号。
- 计算机工程学院攻玉工作室，负责人。
  - 大一下学期加入工作室。
  - 大二工作室换届当选为负责人。
  - “纽斯杯”大学生创业设计大赛。
  - 苏州市职业大学创新创意作品大赛。
  - 计算机工程学院“互联网+”创新创业大赛。
  - 苏州市职业大学第二十届职业生涯节大学生创业设计大赛。
  - 第三届“郑和杯”中德青年创新创业大赛。
  - “赢在苏州”第十届苏州青年精英创业大赛。 -->

<!-- ## 荣誉奖励

- 2016-2017 连续两年获“院级优秀共青团员”。
- 苏州市职业大学大学生创新创意作品大赛三等奖。
- 计算机工程学院“纽斯杯”大学生创业设计大赛一等奖。
- 苏州市职业大学第二十届职业生涯规划节大学生创业设计大赛三等奖。
- 第三届“郑和杯”中德青年创新创业大赛优胜奖。
- 计算机工程学院“互联网+创新创业大赛”最佳作品奖、优秀作品奖。
- 苏州市职业大学 2016 级新生军训“优秀学员”。
- 及其他院、校各类文娱体育活动比赛奖项不一一列出。 -->

<!-- ## 自我评价

1. 良好的沟通与表达能力，善于聆听，乐观幽默，以诚待人。
2. 良好的心态和责任感，吃苦耐劳，擅于团队合作，勇于面对挑战。
3. 良好的自主学习能力，善于发现、解决问题，勤于研究不断提高。 -->

---

<a class="notPrint" href="javascript:void(0);" onclick="window.print()" title="推荐使用基于 Chromium 的浏览器">打印简历</a>



