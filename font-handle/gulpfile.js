const gulp = require("gulp");
const gulpConnect = require("gulp-connect");
const gulpCpFile = require("./gulp-cp-file");
const fontSpider = require("./gulp-font-spider");

function mark_font(done) {
  gulp
    .src("../site/**/*.md")
    .pipe(
      gulpCpFile({
        src: "./fontSource/",
        dest: "fontSource/",
        fileNameList: [
          // 'SourceHanSerifCN-Bold.ttf',
          // 'SourceHanSerifCN-ExtraLight.ttf',
          // 'SourceHanSerifCN-Heavy.ttf',
          "SourceHanSerifCN-Light.ttf",
          "SourceHanSerifCN-Medium.ttf",
          // 'SourceHanSerifCN-Regular.ttf',
          "SourceHanSerifCN-SemiBold.ttf",
        ],
      })
    )
    // .pipe(
    //   fontSpider({
    //     ignore: ["main.css"],
    //     silent: true,
    //     extraFontFaceRule: [
    //       {
    //         "font-family": "source-han-serif-sc",
    //         "font-weight": "100",
    //         src: "url('./fontSource/SourceHanSerifCN-Light.ttf')",
    //         "font-display": "swap",
    //       },
    //       {
    //         "font-family": "source-han-serif-sc",
    //         "font-weight": "normal",
    //         src: "url('./fontSource/SourceHanSerifCN-SemiBold.ttf')",
    //         "font-display": "swap",
    //       },
    //       {
    //         "font-family": "source-han-serif-sc",
    //         "font-weight": "bolder",
    //         src: "url('./fontSource/SourceHanSerifCN-Medium.ttf')",
    //         "font-display": "swap",
    //       },
    //     ],
    //     backup: false,
    //     debug: false,
    //   })
    // )
    .pipe(gulp.dest("../site/public"))
    .pipe(gulpConnect.reload());
  done();
}

exports.default = gulp.series(mark_font);
