/*
哔哩哔哩漫画签到
copy from https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js
脚本兼容: QuantumultX, Surge, Loon
电报频道：@NobyDa
问题反馈：@NobyDa_bot
如果转载，请注明出处

说明：
打开哔哩哔哩漫画后 (AppStore中国区)，单击"我的", 如果通知获取cookie成功, 则可以使用此脚本. 

脚本将在每天上午9点执行。 您可以修改执行时间。

~~~~~~~~~~~~~~~~
Surge 4.2.0+ :

[Script]
Bili漫画签到 = type=cron,cronexp=0 9 * * *,wake-system=1,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js

Bili漫画Cookie = type=http-request,pattern=^https:\/\/passport\.biligame\.com\/api\/login\/sso.+?version%22%3A%22(3|4|5),script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js

[MITM]
hostname = passport.biligame.com
~~~~~~~~~~~~~~~~
QX 1.0.10+ :

[task_local]
0 9 * * * https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js, tag=Bili漫画签到

[rewrite_local]
#获取Bili漫画Cookie
^https:\/\/passport\.biligame\.com\/api\/login\/sso.+?version%22%3A%22(3|4|5) url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js

[mitm]
hostname = passport.biligame.com
~~~~~~~~~~~~~~~~
*/


const $nobyda = nobyda();

const CookieKey = "CookieBM";

if ($nobyda.isRequest) {
  GetCookie()
} else {
  checkin()
}

function checkin() {
    const cookie = $nobyda.read(CookieKey);
    // console.log(cookie);
  const bilibili = {
    url: 'https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn?platform=ios',
    headers: {
      Cookie: cookie,
    },
  };
  $nobyda.post(bilibili, function(error, response, data) {
      console.log('data', error, data);
    if (!error) {
      if (parseInt(response.status) == 200) {
        console.log("bilibili success response : \n" + data)
        $nobyda.notify("哔哩哔哩漫画 - 签到成功！🎉", "", "")
      } else {
        console.log("bilibili failed response : \n" + data)
        if (data.match(/duplicate/)) {
          $nobyda.notify("哔哩哔哩漫画 - 今日已签过 ⚠️", "", "")
        } else if (data.match(/uid must/)) {
          $nobyda.notify("哔哩哔哩漫画 - Cookie无效 ‼️‼️", "", "")
        } else {
          $nobyda.notify("哔哩哔哩漫画 - 签到失败 ‼️", "", data)
        }
      }
    } else {
      $nobyda.notify("哔哩哔哩漫画 - 签到接口请求失败", "", error)
    }
    $nobyda.end()
  })
}

function GetCookie() {
  var CookieName = "B站漫画";

  var regex = /SESSDATA=.+?;/;
  if ($request.headers) {
    var header = $request.headers['Cookie'] ? $request.headers['Cookie'] : "";
    if (header.indexOf("SESSDATA=") != -1) {
      var CookieValue = regex.exec(header)[0];
      if ($nobyda.read(CookieKey)) {
        if ($nobyda.read(CookieKey) != CookieValue) {
          var cookie = $nobyda.write(CookieValue, CookieKey);
          if (!cookie) {
            $nobyda.notify("更新" + CookieName + "Cookie失败‼️", "", "");
          } else {
            $nobyda.notify("更新" + CookieName + "Cookie成功 🎉", "", "");
          }
        }
      } else {
        var cookie = $nobyda.write(CookieValue, CookieKey);
        if (!cookie) {
          $nobyda.notify("首次写入" + CookieName + "Cookie失败‼️", "", "");
        } else {
          $nobyda.notify("首次写入" + CookieName + "Cookie成功 🎉", "", "");
        }
      }
    } else {
      $nobyda.notify("写入" + CookieName + "Cookie失败‼️", "", "Cookie关键值缺失");
    }
  } else {
    $nobyda.notify("写入" + CookieName + "Cookie失败‼️", "", "配置错误, 无法读取请求头,");
  }
  $nobyda.end()
}

function nobyda() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const node = (() => {
        const request = require('request');
        return ({
            request
        })
    })()
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const write = (value, key) => {
        return process.env[key];
    }
    const read = (key) => {
        return process.env[key];
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    const post = (options, callback) => {
        node.request.post(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
    }
    const end = () => {
        if (isQuanX) return $done({})
        if (isSurge) isRequest ? $done({}) : $done()
    }
    return { isRequest, isQuanX, isSurge, notify, write, read, post, end }
};