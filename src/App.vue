<template>
  <div id="app">
    <div class="ebook">
      <title-bar :ifTitleAndMenuShow="false"></title-bar>
      <div class="read-wrapper">
        <div id="read">
          <div class="empty" v-if="!bookAvailable">
            <div id="loading">
              <div class="spinner">
                <div class="spinner-container container1">
                  <div class="circle1"></div>
                  <div class="circle2"></div>
                  <div class="circle3"></div>
                  <div class="circle4"></div>
                </div>
                <div class="spinner-container container2">
                  <div class="circle1"></div>
                  <div class="circle2"></div>
                  <div class="circle3"></div>
                  <div class="circle4"></div>
                </div>
                <div class="spinner-container container3">
                  <div class="circle1"></div>
                  <div class="circle2"></div>
                  <div class="circle3"></div>
                  <div class="circle4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mask" v-swipeleft="nextPage" v-swiperight="prevPage" >
          <div class="left"  @click="toggleTitleAndMenu" ></div>
          <div class="center"  @click="toggleTitleAndMenu"></div>
          <div class="right"   @click="toggleTitleAndMenu"></div>
        </div>
      </div>

      <menu-bar
        :ifTitleAndMenuShow="ifTitleAndMenuShow"
        :fontSizeList="fontSizeList"
        :defaultFontSize="defaultFontSize"
        @setFontSize="setFontSize"
        :themeList="themeList"
        :defaultTheme="defaultTheme"
        @setTheme="setTheme"
        :bookAvailable="bookAvailable"
        :progress="progress"
        @onProgressChange="onProgressChange"
        :navigation="navigation"
        @jumpTo="jumpTo"
        ref="menuBar"
      ></menu-bar>
    </div>
  </div>
</template>
<script>
import TitleBar from "@/components/TitleBar";
import MenuBar from "@/components/MenuBar";
import Epub from "epubjs";
let DOWNLOAD_URL = "./static/es.epub";
let bookName = "es";
global.ePub = Epub;
export default {
  components: {
    TitleBar,
    MenuBar,
  },
  name: "home",
  data() {
    return {
      ifTitleAndMenuShow: false,
      fontSizeList: [
        { fontSize: 12 },
        { fontSize: 14 },
        { fontSize: 16 },
        { fontSize: 18 },
        { fontSize: 20 },
        { fontSize: 22 },
        { fontSize: 24 },
      ],
      defaultFontSize: 16,
      themeList: [
        {
          name: "default",
          style: {
            body: {
              color: "#000",
              background: "#fff",
            },
          },
        },
        {
          name: "eye",
          style: {
            body: {
              color: "#000",
              background: "#ceeaba",
            },
          },
        },
        {
          name: "gold",
          style: {
            body: {
              color: "#000",
              background: "rgb(241, 236, 226)",
            },
          },
        },
      ],
      defaultTheme: 0,
      // 图书是否处于可用状态
      bookAvailable: false,
      navigation: {},
      isbook: true,
      progress: 0
    };
  },
  methods: {
    getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
      var r = window.location.search.substr(1).match(reg); // 匹配目标参数
      if (r != null) return unescape(r[2]);
      return null; // 返回参数值
    },
    vueTouch(s) {
      if (s == "nextPage") {
        this.nextPage();
      }
    },
    // 根据链接跳转到指定位置
    jumpTo(href) {
      localStorage.setItem(bookName, href);
      this.rendition.display(href);
      this.hideTitleAndMenu();
    },
    hideTitleAndMenu() {
      // 隐藏标题栏和菜单栏
      this.ifTitleAndMenuShow = false;
      // 隐藏菜单栏弹出的设置栏
      this.$refs.menuBar.hideSetting();
      // 隐藏目录
      this.$refs.menuBar.hideContent();
    },
    // progress 进度条的数值（0-100）
    onProgressChange(progress) {
      const percentage = progress / 100;
      const location =
        percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0;
      this.rendition.display(location);
    },
    // 设置主题
    setTheme(index) {
      localStorage.setItem("theme", index);
      this.themes.select(this.themeList[index].name);
      this.defaultTheme = index;
    },
    // 注册主题
    registerTheme() {
      this.themeList.forEach((theme) => {
        this.themes.register(theme.name, theme.style);
      });
    },
    // 设置字号大小
    setFontSize(fontSize) {
      this.defaultFontSize = fontSize;
      localStorage.setItem("fontSize", fontSize);
      if (this.themes) {
        this.themes.fontSize(fontSize + "px");
      }
    },
    // 切换标题和菜单的显示状态
    toggleTitleAndMenu() {
      this.ifTitleAndMenuShow = !this.ifTitleAndMenuShow;
      if (!this.ifTitleAndMenuShow) {
        this.$refs.menuBar.hideSetting();
      }
    },
    // 上一页
    prevPage() {
      if (this.rendition) {
        this.rendition.prev();
        let current = this.rendition.currentLocation();
        if (current.start) {
          this.progress = (this.locations.percentageFromCfi(current.start.cfi)*100).toFixed(2); 
          localStorage.setItem(bookName, current.start.cfi);
        }
      }
    },
    // 下一页
    async nextPage() {
      if (this.rendition) {
        await this.rendition.next();
        let current = this.rendition.currentLocation();
        if (current.start) {
          window.console.log()
          this.progress = (this.locations.percentageFromCfi(current.start.cfi)*100).toFixed(2); 
          localStorage.setItem(bookName, current.start.cfi);
        }
      }
    },
    // 电子书的解析和渲染
    async showEpub() {
      // 生成Book对象
      this.book = new Epub(DOWNLOAD_URL);
      // 通过Book.renderTo生成Rendition对象
      this.rendition = this.book.renderTo("read", {
        spreads: false,
        width: window.innerWidth,
        height: this.getUrlParam("height")
          ? this.getUrlParam("height")
          : window.innerHeight,
        // 兼容iOS
        manager: "default",
      });
      //通过Rendtion.display渲染电子书
      let location = localStorage.getItem(bookName);
      if (location) {
        this.rendition.display(location).then(() => {});
      } else {
        this.rendition.display();
      }
      // 获取Theme对象
      this.themes = this.rendition.themes;
      // 设置默认字体
      let fontSize = Number(localStorage.getItem("fontSize"));
      if (!fontSize) {
        this.setFontSize(this.defaultFontSize);
      } else {
        this.setFontSize(fontSize);
      }
      // 注册主题
      this.registerTheme();
      // 设置默认主题
      let theme = Number(localStorage.getItem("theme"));
      if (theme === 0) {
        this.setTheme(this.defaultTheme);
      } else {
        this.setTheme(theme);
      }

      // Book对象的钩子函数ready
      this.book.ready
        .then(() => {
          this.navigation = this.book.navigation;
          // 生成Locations对象
          return this.book.locations.generate();
        })
        .then(async () => {
          // 保存locations对象
          this.locations = this.book.locations;
          this.progress = (this.locations.percentageFromCfi(location)*100).toFixed(2);  
          // 标记电子书为解析完毕状态
          this.bookAvailable = true;
        });
    },
  },
  async created() {
    if (this.getUrlParam("url")) {
      DOWNLOAD_URL = decodeURIComponent(this.getUrlParam("url"));
    }
    if (this.getUrlParam("bookName")) {
      bookName = this.getUrlParam("bookName");
    }
    await this.showEpub();
  },
};
document.addEventListener("DOMContentLoaded", () => {
  const html = document.querySelector("html");
  let fontSize = window.innerWidth / 10;
  fontSize = fontSize > 50 ? 50 : fontSize;
  html.style.fontSize = fontSize + "px";
});
</script>
<style lang='scss' scoped>
@import "./assets/styles/global";
.empty {
  width: 100%;
  height: 100%;
  @include center;
  font-size: px2rem(16);
  color: #333;
}
.ebook {
  position: relative;
  .read-wrapper {
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      display: flex;
      width: 100%;
      height: 100%;
      .left {
        flex: 0 0 px2rem(100);
      }
      .center {
        flex: 1;
      }
      .right {
        flex: 0 0 px2rem(100);
      }
    }
  }
}
#loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  z-index: 9999;
}
/*加载圈*/
.spinner {
  margin: 0 auto;
  width: 60px;
  height: 60px;
  position: relative;
  top: 40%;
}
.container1 > div,
.container2 > div,
.container3 > div {
  width: 15px;
  height: 15px;
  background-color: rgb(255, 165, 0);
  border-radius: 100%;
  position: absolute;
  -webkit-animation: bouncedelay 1.2s infinite ease-in-out;
  animation: bouncedelay 1.2s infinite ease-in-out;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.spinner .spinner-container {
  position: absolute;
  width: 100%;
  height: 100%;
}
.container2 {
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}
.container3 {
  -webkit-transform: rotateZ(90deg);
  transform: rotateZ(90deg);
}
.circle1 {
  top: 0;
  left: 0;
}
.circle2 {
  top: 0;
  right: 0;
}
.circle3 {
  right: 0;
  bottom: 0;
}
.circle4 {
  left: 0;
  bottom: 0;
}
.container2 .circle1 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}
.container3 .circle1 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}
.container1 .circle2 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}
.container2 .circle2 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}
.container3 .circle2 {
  -webkit-animation-delay: -0.7s;
  animation-delay: -0.7s;
}
.container1 .circle3 {
  -webkit-animation-delay: -0.6s;
  animation-delay: -0.6s;
}
.container2 .circle3 {
  -webkit-animation-delay: -0.5s;
  animation-delay: -0.5s;
}
.container3 .circle3 {
  -webkit-animation-delay: -0.4s;
  animation-delay: -0.4s;
}
.container1 .circle4 {
  -webkit-animation-delay: -0.3s;
  animation-delay: -0.3s;
}
.container2 .circle4 {
  -webkit-animation-delay: -0.2s;
  animation-delay: -0.2s;
}
.container3 .circle4 {
  -webkit-animation-delay: -0.1s;
  animation-delay: -0.1s;
}
@-webkit-keyframes bouncedelay {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
  }
}
@keyframes bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  40% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}
</style>