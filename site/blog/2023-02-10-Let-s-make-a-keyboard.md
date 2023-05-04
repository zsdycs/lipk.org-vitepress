---
title: '一起做个机械键盘吧⌨️'
date: '2023-02-10'
slug: 'let-s-make-a-keyboard'
tableOfContents: true
pictureView: [
  {
    title: '标准键盘配列',
    src: '/images/2023-02-10-Let-s-make-a-keyboard(1).jpg',
    w: 477,
    h: 1089,
  },
]
coverPicture: {
  title: '标准键盘配列',
  src: '/images/2023-02-10-Let-s-make-a-keyboard(1).jpg',
}
---

> 本教程搭配开源键盘库 [zsdycs/ginpun](https://github.com/zsdycs/ginpun) 阅读更佳~

# 键盘主要部件

组成机械键盘的部件主要有 4 个。

1. 电路板
2. 外壳
3. 键轴
4. 键帽

这是所有机械键盘都会有的部件。大多数机械键盘还会有“定位板”，但是其实“定位板”可以和外壳结合起来一体成型的，所以“定位板”不一定是主要部件。

这里把电路板放在第一位，是由于从 0 到 1 做一个机械键盘的角度看，电路板的设计决定了一个键盘的形态，至于外壳设计是对最终形态起“锦上添花”作用的。

## 电路板

1. 主控芯片
2. 外围电路器件（电容、电阻、晶振等）
3. LED 灯
4. 热插拔轴座

### 主控芯片

机械键盘的电路板主要零部件是——主控芯片，键盘所用的主控芯片，也就是单片机一般分为两类，AVR 和 ARM 架构的。

AVR 架构的芯片由 Microchip 公司主导。最为知名的一枚芯片是 [ATmega32U4](https://www.microchip.com/en-us/product/ATmega32U4)，这颗芯片是 arduino 平台非常流行的开发板 [pro micro](https://github.com/sparkfun/Pro_Micro) 的主控芯片。但是据我了解，貌似没有国产厂家生产 AVR 架构的芯片作为替代，可能是这个架构太老了，也可能是因为专利或是没有开源吧。

ARM 架构的机械键盘芯片以意法半导体（ST.COM）公司的 STM32 为主。一般机械键盘采用 STM32F103 系列，也有使用更高性能规格的。这类芯片国产替代比较多，比如 GD32、APM32 等。

当然，除了以上两种芯片选型，还可以选择国产的 ESP32 系列，这是区别于 AVR 和 ARM 内核的芯片，内置有 WiFi 和蓝牙，对于开发蓝牙键盘是十分不错的选择。

之所以没有考虑 ESP32，是因为著名的开源键盘固件框架 [QMK 支持的 MCU 列表](https://docs.qmk.fm/#/compatible_microcontrollers) 中，并没有 ESP32 的身影。

芯片选型考虑的方面有很多，价格、体积、性能……由于我们仅仅是爱好者入门，所以选择资料最为多的 **ATmega32U4** 是最明智的选择。

### 最小系统

单片机的最小系统是指单片机工作的最简单的电路，就像人要思考，除了大脑🧠作为核心指挥，也要有例如心脏、肺和血管等协助才能工作。

我们不需要关心为什么单片机的最小系统为什么是这样子，只需要关心最小系统有什么。

ATmega32U4 的最小系统最少需要 4 颗电容和一颗晶振。

当然，严格来说在芯片供电（VCC）的脚位，44、34、24 以及 2 和 7 脚前各焊接一颗 100nF 的滤波电容才能使最小系统工作得更加稳定。只是实际测试下来，不焊接也不会有为什么问题。

知道一下就行，为了制作出来的键盘足够耐用，我们还是焊接了为好。

### 按键配列

按键配列，实际上是指的键帽的布局，因为键轴我们知道都是一样的，不同的按键宽度底下实际上是由卫星轴作为支撑的。

一个按键的最小长度是 1U，“U”是键帽长度的单位，常见宽度有，1U、1.5U、2U 等。

卫星轴的长度和键帽的长度是匹配的，我们设计按键配列时，要考虑的实际上是，我们设计出来的配列有没有合适的键帽来使用。

因为键帽这种东西，涉及到字符印刷和双色注塑等工艺，我们 DIY 的话 3D 打印出来的键帽手感上并没有成品的键帽来得舒适。

所以，我们设计按键配列时，我们设计出来的配列有没有合适的键帽来使用。

按键配列和电路板的电路设计密不可分，因为按键的位置决定的电路板按键的开孔和走线。

当我们决定了“按键配列”是怎么样的时候，才能着手设计电路的原理图和电路板的设计图。

![标准键盘配列](/images/2023-02-10-Let-s-make-a-keyboard(1).jpg)

## 外壳

键盘外壳主要有三种材质，金属、木头、塑料。

机械键盘的外壳可以按照材料的硬度划分好坏，因为材料越硬，就越不会吸收打字时机械轴声音，也不会有多余的微小的震动。

所以一般来说金属外壳的机械键盘，会有更加纯粹的打字手感。

木头和塑料则是类似的。当然木头时不常见的作为外壳的材料，会有新奇感受上的加成，木头摸起来的手感，会比塑料摸起来舒服。

但是考虑到成本，自制键盘外壳如果选择金属或者木头，因为我们只需要很小的量。

金属只能进行 CNC 打样，开机费、刀路编程费，加上材料成本就算是认识工厂的车间主任也是需要不小的时间和金钱的成本。

木头可以自己刀刻，花的时间和效果因人而异，如果碰巧有个刀法了得的雕刻朋友，可以尝试一下，雕刻一个键盘外壳是很有意义的事情。

木头也可以 CNC 机床加工，价格也是很贵的，上千块钱加工一个外壳，不值得。

所以我选择的是 3D 打印，这是一个对于 DIY 自制极其利好的技术，在外壳建模做好后，我在质询并了解了上面的信息后，是庆幸如今 3D 打印技术的成熟的。

外壳建模不复杂，其实总体来说就是立体长方形把中间掏空了。

# 来做 SG_V2 键盘吧

下面，我们就来做键盘库 [zsdycs/ginpun](https://github.com/zsdycs/ginpun) 中的 SG_V2，因为这把键盘使用的是标准的“按键配列”，可以替换的键帽很常见，可玩性很高，外观设计也很成熟。

待续~