// ==UserScript==
// @name        Music2Lastfm
// @namespace   myon<myon.cn@gmail.com>
// @author      Myon<myon.cn@gmail.com>
// @description 同步音乐记录到lastfm
// @include     http://www.last.fm/api/*
// @include     http://www.xiami.com/*
// @include     http://music.163.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @icon        http://www.last.fm/static/images/whatsnew/trackmymusic/1-desktop-icon.png
// @downloadURL https://github.com/iMyon/Music2Lastfm/raw/master/Music2Lastfm.user.js
// @updateURL   https://github.com/iMyon/Music2Lastfm/raw/master/Music2Lastfm.meta.js
// @version     0.1.2
// ==/UserScript==


console.log = function(){};console.warn = function(){};    //取消调试，需要看调试信息可以注释掉

//站点配置，添加网站后需要在头部加上@include
var sites = {
  xiamiRadio:{
    name: "虾米电台",
    url: "www.xiami.com/radio/play",    //匹配网址
    getData: function(){                //获取歌曲信息的方法
      var data = {};
      data.track = unsafeWindow.nowSoundObj.songName;
      data.artist = unsafeWindow.nowSoundObj.artist;
      data.timestamp = ~~(new Date().getTime()/1000);
      return data;
    },
    starElement: "#dialog_clt"          //css选择器，收藏歌曲按钮元素（触发点击事件）
  },
  xiamiPlayer:{
    name: "虾米播放器",
    monitorElement: "#J_trackInfo",      //当元素发生改变时添加记录，不设置的话默认是监听网页的title
    url: "www.xiami.com/play",
    getData: function(){
      var data = {};
      data.track = document.querySelector("#J_trackName").title;
      data.artist = document.querySelector("#J_trackName+a").title;
      var t = document.querySelector(".ui-row-item.ui-track-item.ui-track-current .ui-row-item-column.c3 a");
      if(t) data.album = t.textContent;
      data.duration = time2second(document.querySelector("#J_durationTime").textContent);
      data.timestamp = ~~(new Date().getTime()/1000);
      return data;
    },
    starElement: "#J_trackFav",
    triggerMethod: "click"              //收藏触发方法，点击触发
  },
  163:{
    name: "网易云音乐",
    url: "music.163.com",
    isPlaying: function(){    //播放状态检查，只有播放状态才i、记录。不填默认是true
      return !!document.title.match("▶ ");
    },
    getData: function(){
      var data = {};
      data.track = document.querySelector(".play .name").title;
      data.artist = document.querySelector(".play .by span").title;
      data.duration = time2second(document.querySelector(".play  .time").textContent.split("/")[1].trim());
      data.timestamp = ~~(new Date().getTime()/1000);
      return data;
    },
    starElement: ".icn-add",
    triggerMethod: "click"
  }
};



//引入md5库 https://github.com/blueimp/JavaScript-MD5
!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);

var lastfmUtils = {
  api_key: "99b302feea0fe14df4721382f9c73c4a",
  secret: "ae575d5aad6c9f2a3eaf18d729511d7f",
  sk: "",
  setApiSig: function(method){
    this.api_sig = md5("api_key"+this.api_key+"method"+method+"token"+this.token+this.secret);
  },
  //跳转到验证页面
  doAuth: function(){
    var flag = confirm("需要跳转到lastfm进行权限验证！");
    if(flag){
      GM_setValue("referer", location.href);
      location.href = "http://www.last.fm/api/auth?api_key="+this.api_key;
    }
  },
  //data 请求数据
  //callback 回调函数
  //sync 是否同步
  baseRequest: function(data, callback, sync){
    sync = !!sync;
    data.api_key = this.api_key;
    // data.secret = this.secret;
    if(this.sk) data.sk = this.sk;
    //参数按字母表排序
    var keys = [];
    for(var key in data) keys.push(key);
    keys = keys.sort();
    var formdata = {};
    for(var item in keys) formdata[keys[item]] = data[keys[item]];


    //生成md5和请求数据
    var sigStr = "";
    var formArray = [];
    for(var key in formdata){
      sigStr = sigStr + key + formdata[key];
      formArray.push(key + "=" + encodeURIComponent(formdata[key]));
    }
    var api_sig = md5(sigStr+this.secret);
    formArray.push("api_sig="+api_sig);
    formArray.push("format=json");
    (function(context){
      GM_xmlhttpRequest({
        method: "POST",
        url: "http://ws.audioscrobbler.com/2.0/?"+formArray.join("&"),
        synchronous: sync,
        onload: function(response) {
          callback(response, context); //回调函数
        }
      });
    })(this);
  },
  fetchSk: function(data){
    //获取sk
    data.method = 'auth.getSession';
    data.token = data.token;
    this.baseRequest(data,function(response, context){
      var res = JSON.parse(response.responseText);
      console.log("获取sk返回文本：", response.responseText);
      if(!res.error){
        GM_setValue("sk", res.session.key);
        context.sk = res.session.key;
        console.log("sk：", res.session.key);
        console.log("获取sk成功");
        location.href = GM_getValue("referer");
      }
      else console.warn("获取sk发生错误！");
    }, true);
  },
  love: function(data){
    //收藏歌曲
    data.method = 'track.love';

    this.baseRequest(data,function(response){
      var res = JSON.parse(response.responseText);
      console.log("收藏歌曲返回文本：", response.responseText);
      if(!res.error){
        console.log("添加喜爱成功！");
      }
      else  console.warn("添加歌曲收藏发生错误！");
    }, false);
  },
  scrobble: function(data){
    //歌曲记录
    data.method = 'track.scrobble';
    this.baseRequest(data,function(response){
      var res = JSON.parse(response.responseText);
      console.log("记录歌曲返回文本：", response.responseText);
      if(!res.error){
        console.log("添加记录成功！");
      }
      else{
        console.warn("添加歌曲记录发生错误！");
      }
    }, false);
  },
  updateNowPlaying:function(data){
    //正在播放
    data.method = 'track.updateNowPlaying';
    this.baseRequest(data,function(response){
      var res = JSON.parse(response.responseText);
      console.log("更新正在播放返回文本：", response.responseText);
      if(!res.error){
        console.log("添加正在播放成功！");
      }
      else if(res.error == 9){
        console.warn("添加正在播放发生错误！");
        lastfmUtils.doAuth();
      }
    }, false);
  },
  init: function(){
    this.sk = GM_getValue("sk");
    if(!this.sk){
      this.doAuth();
    }
  }
};

//不同网站进行不同的处理
for(var item in sites){
  if(location.href.match(sites[item].url)){
    lastfmUtils.init();
    //监听记录
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var target = document.querySelector(sites[item].monitorElement?sites[item].monitorElement:"title");
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var flag = sites[item].isPlaying ? sites[item].isPlaying() : true;
        if(flag){//当前处于播放状态才记录
          //切换歌曲时记录
          if(window.history_data) lastfmUtils.scrobble(window.history_data);
          var data = sites[item].getData();
          lastfmUtils.updateNowPlaying(data);
          window.history_data = data;
        }
      });
    });
    var config = {childList: true}
    observer.observe(target, config);

    //监听收藏
    var target = document.querySelector(sites[item].starElement);
    if(sites[item].triggerMethod == 'click'){    //点击触发
      function cc(target){
        if(target){
          target.addEventListener('click', function(){
            var data = sites[item].getData();
            lastfmUtils.love(data);
          });
        }
        else{
          target = document.querySelector(sites[item].starElement);
          setTimeout(function(){cc(target);}, 4000);
        }
      }
      cc(target);
    }
    else{    //监听元素变化触发
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var data = sites[item].getData();
          lastfmUtils.love(data);
        });    
      });
      var config = {attributes:true}
      observer.observe(target, config);
    }
    break;
  }
}

//获取token页面构建
if(location.href.match(/www.last.fm\/api\/auth\?token=.*/)){
  GM_addStyle('\
    #Music2Lastfm-confirmToken{\
      position: fixed;\
      padding-top:15%;\
      width: 100%;\
      height:100%;\
      text-align: center;\
      z-index:999;\
      background: white;\
    }\
    .top-bar,#content{\
      display: none  !important;;\
    }\
    #confirmTitle{\
      font-size: 30px;\
      margin-bottom: 20px;\
    }\
    #confirmButton, #cancleButton{\
      display:inline-block; \
      border:1px solid #AAAAAA;\
      width: 80px  !important;\
      height: 30px  !important;\
      line-height: 20px;\
      padding: 5px;\
      background: #F0F1F2;\
    }\
    #confirmButton:hover, #cancleButton:hover{\
      cursor: pointer;\
    }\
    #confirmButton a, #cancleButton a{\
      font-color: white;\
      text-decoration: none;\
    }\
    #cancleButton{\
      margin-left: 20px;\
    }');
  //添加选择弹框
  var confirmDiv = document.createElement("div");
  confirmDiv.id = "Music2Lastfm-confirmToken";

  var confirmTitle = document.createElement("div");
  confirmTitle.id = "confirmTitle";
  confirmTitle.innerHTML = "授权给Music2Lastfm？";
  var confirmContent = document.createElement("div");
  confirmContent.id = "confirmContent";

  var confirmButton = document.createElement("span");
  confirmButton.id = "confirmButton";
  var cancleButton = document.createElement("span");
  cancleButton.id = "cancleButton";

  var confirmArchor = document.createElement("a");
  confirmArchor.innerHTML = "确  定";
  confirmArchor.id = "confirmArchor";
  var cancleArchor = document.createElement("a");
  cancleArchor.innerHTML = "取  消";
  cancleArchor.id = "cancleArchor";

  confirmButton.appendChild(confirmArchor);
  cancleButton.appendChild(cancleArchor);
  confirmContent.appendChild(confirmButton);
  confirmContent.appendChild(cancleButton);
  confirmDiv.appendChild(confirmTitle);
  confirmDiv.appendChild(confirmContent);

  document.body.insertBefore(confirmDiv, document.body.childNodes[0]);

  confirmButton.addEventListener("click", function(e){
    var token = location.href.match(/token=(.*)$/)[1];
    var data = {};
    data.token = token;
    console.log("获取token成功！");
    //获取sk
    lastfmUtils.fetchSk(data);
  });
  cancleButton.addEventListener("click", function(e){
    location.href = GM_getValue("referer");
  });
}

//时间转成秒，如4:30 => 270
function time2second(str){
  return (~~str.split(":")[0])*60 + (~~str.split(":")[1]);
}
