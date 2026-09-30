/**
 * 26年国庆活动 · 行程数据（2026-09-30 ~ 2026-10-09）
 *
 * 本文件是行程的“默认完成状态”来源：
 * 页面展示时优先读取这里的 done 字段；用户在页面上打勾后，
 * 勾选结果会记录到浏览器 localStorage，并以 localStorage 为准。
 */

/** 可勾选的行程/交通项 */
export interface EventCheckItem {
  /** 唯一 id（localStorage 记录的 key） */
  id: string;
  /** 展示文本 */
  text: string;
  /** 文件中默认的完成状态 */
  done: boolean;
}

/** 单日卡片 */
export interface EventDay {
  /** 例如 day0 */
  id: string;
  /** 例如 Day 0 */
  label: string;
  /** ISO 日期 YYYY-MM-DD，用于和当前日期比较自动变为结束状态 */
  date: string;
  /** 行程（可勾选） */
  schedule: EventCheckItem[];
  /** 交通（可勾选列表 或 纯文本说明） */
  transport: EventCheckItem[] | string;
  /** 住宿（纯文本，无住宿可省略） */
  stay?: string;
}

export interface EventInfo {
  /** 活动 id（localStorage 前缀） */
  id: string;
  title: string;
  subtitle: string;
  days: EventDay[];
}

const item = (id: string, text: string, done = false): EventCheckItem => ({
  id,
  text,
  done,
});

export const EVENT: EventInfo = {
  id: "26th-national-day-celebration",
  title: "26年国庆活动",
  subtitle: "2026 国庆 · 深圳 / 中山 / 潮汕 / 南澳",
  days: [
    {
      id: "day0",
      label: "Day 0",
      date: "2026-09-30",
      schedule: [
        item("d0-s1", "机场集合"),
        item("d0-s2", "酒店放置行李"),
        item(
          "d0-s3",
          "晚饭，凤兴鸡煲(宝安海雅店)（14分钟）（11:00-14:00，17:00-次日2:00） 备选 大悦城-陶陶居",
        ),
        item("d0-s4", "德记源发炖汤·肠粉（可选）"),
        item("d0-s5", "夜逛书城湾区之眼区域"),
      ],
      transport: [
        item("d0-t1", "D2923(苏州-虹桥，14:10-14:41)"),
        item("d0-t2", "CZ3562(虹桥T2-宝安T3，16:40-19:20)"),
      ],
      stay: "深圳全季宝安洪浪北地铁",
    },
    {
      id: "day1",
      label: "Day 1",
      date: "2026-10-01",
      schedule: [
        item("d1-s1", "书城湾区之眼"),
        item("d1-s2", "水贝金展珠宝广场"),
        item("d1-s3", "午饭"),
        item("d1-s4", "酒店放置行李"),
        item("d1-s5", "杨梅坑-快艇去山顶"),
        item("d1-s6", "美人鱼拍摄地-观光车回杨梅坑"),
        item("d1-s7", "杨梅坑晚饭"),
      ],
      transport: "打车",
      stay: "深圳桔钓沙",
    },
    {
      id: "day2",
      label: "Day 2",
      date: "2026-10-02",
      schedule: [
        item("d2-s1", "桔钓沙"),
        item("d2-s2", "下午两点左右顺风车回中山"),
        item("d2-s3", "回家后，骑小黑到酒店放置行李"),
        item("d2-s4", "强记吃饭"),
        item("d2-s5", "晚上婚礼布置"),
        item("d2-s6", "KTV"),
      ],
      transport: "无",
      stay: "中山全季东升",
    },
    {
      id: "day3",
      label: "Day 3",
      date: "2026-10-03",
      schedule: [
        item("d3-s1", "参加婚礼"),
        item("d3-s2", "中午、晚上，婚宴"),
        item("d3-s3", "夜市"),
      ],
      transport: "无",
      stay: "中山全季东升",
    },
    {
      id: "day4",
      label: "Day 4",
      date: "2026-10-04",
      schedule: [
        item("d4-s1", "早茶（午饭）"),
        item("d4-s2", "往潮汕在途"),
        item("d4-s3", "酒店放置行李"),
        item(
          "d4-s4",
          "晚饭，海楼阁·海鲜牛肉火锅·生腌鱼生·潮汕砂锅粥(枫春店)（10分钟）",
        ),
        item("d4-s5", "牌坊街、南门古夜市"),
      ],
      transport: [
        item("d4-t1", "C7644(小榄-广州南，13:06-13:33)，历时00:27"),
        item("d4-t2", "C7251(广州南-潮汕，13:54-16:26)，历时02:32"),
      ],
      stay: "潮州桔子古城牌坊街",
    },
    {
      id: "day5",
      label: "Day 5",
      date: "2026-10-05",
      schedule: [
        item("d5-s1", "开元寺"),
        item("d5-s2", "广济桥"),
        item("d5-s3", "午饭，蔡社牛肉城（47分钟）"),
        item("d5-s4", "往汕头在途"),
        item("d5-s5", "酒店放置行李"),
        item("d5-s6", "汕头小公园"),
        item("d5-s7", "老妈宫戏台"),
        item("d5-s8", "汕头美食"),
        item(
          "d5-s9",
          "晚饭，围炉夜话·潮汕卤水火锅(万象店)（11:00-21:30）（21分钟）",
        ),
      ],
      transport: "无",
      stay: "汕头全季万象城龙眼路",
    },
    {
      id: "day6",
      label: "Day 6",
      date: "2026-10-06",
      schedule: [
        item("d6-s1", "汕头博物馆"),
        item(
          "d6-s2",
          "午饭，三中阿林肠粉·炖汤(信逸雅园店)（07:00-15:00,17:00-21:00）（步行900米，14分钟）",
        ),
        item(
          "d6-s3",
          "往南澳在途，莱长渡口(莱芜长山尾)，进岛9:00、11:00、13:00，可能增开每小时一班",
        ),
        item("d6-s4", "长山尾灯塔"),
        item("d6-s5", "酒店放置行李"),
        item("d6-s6", "钱澳湾灯塔"),
        item("d6-s7", "田仔地质公园，礁石海浪"),
        item("d6-s8", "橘子海沙滩，日落"),
        item("d6-s9", "后宅镇吃饭"),
      ],
      transport: "无",
      stay: "南澳花间岭·芸汐",
    },
    {
      id: "day7",
      label: "Day 7",
      date: "2026-10-07",
      schedule: [
        item("d7-s1", "青澳湾，日出（待定，太早了）"),
        item("d7-s2", "自然之门（北回归线地标）"),
        item("d7-s3", "三囱崖灯塔（红白双子冰淇淋灯塔）"),
        item("d7-s4", "蛴仔澎风车山（42号风机俯瞰全岛）"),
        item("d7-s5", "环岛公路"),
        item("d7-s6", "天域山庄 斜坡景色"),
        item("d7-s7", "胖哥有炸·海鲜小炒"),
        item("d7-s8", "光明路 炒冰"),
        item("d7-s9", "金龙路 芋泥 豆沙 糯叽叽的水晶球 无米粿"),
        item("d7-s10", "龙滨路 大圆 橄榄面"),
      ],
      transport: "无",
      stay: "南澳花间岭·芸汐",
    },
    {
      id: "day8",
      label: "Day 8",
      date: "2026-10-08",
      schedule: [
        item("d8-s1", "午饭 TODO"),
        item(
          "d8-s2",
          "下午离岛往汕头站，出岛(南澳长山尾往莱芜):12:00、14:00、16:00(可能增开至每小时一班，首班09:00，末班18:00)",
        ),
        item("d8-s3", "晚饭 TODO"),
        item("d8-s4", "酒店放置行李"),
      ],
      transport: [item("d8-t1", "D9736(汕头-深圳北，20:31-23:01)，历时02:30")],
      stay: "待定",
    },
    {
      id: "day9",
      label: "Day 9",
      date: "2026-10-09",
      schedule: [item("d9-s1", "TODO"), item("d9-s2", "16:00到机场")],
      transport: [
        item("d9-t1", "FM9334(宝安T3-虹桥T2，17:30-20:05)"),
        item("d9-t2", "G7350(虹桥-苏州，21:42-22:07)，历时00:25"),
      ],
    },
  ],
};

/** 全部可勾选项（用于总进度统计） */
export const allCheckItems = (event: EventInfo): EventCheckItem[] => {
  const list: EventCheckItem[] = [];
  for (const day of event.days) {
    list.push(...day.schedule);
    if (Array.isArray(day.transport)) {
      list.push(...day.transport);
    }
  }
  return list;
};
