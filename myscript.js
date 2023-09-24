$(function() {

    // データ取得するまでの時間　変更
    $(".period").on("click", function() {
        const period = $(this).attr("id");
        $("#period").text(period);
        $(".period").removeClass("select");     // periodクラスからselectのCSSを削除
        $("#" + period).addClass("select");     // 該当するidのみselectのCSSを追加
    })
    
    getTemp();
    getVolt();
    getLight();
    drawGraph();
});


$().ready(function(){
    setInterval(timer, 1000);
});


// 時計 兼 タイマー
function timer() {
    const today = dayjs();
    const month = today.month() + 1;
    const date = today.date();
    const week = weekdays[today.day()];
    const hour = today.format('HH');
    const minute = today.format('mm');
    const second = today.format('ss');
    $("#time").html(month + "月" + date + "日（" + week + "） " + hour + ":" +minute + ":" + second);
    const seconds = minute*60 + second;
    
    const period = $("#period").text();
    const amari = seconds % period;

    if (amari == 0) {
        getTemp();
        getVolt();
        getLight();
    }
};

// 現在時刻を取得する
function getTime() {
    const today = dayjs();
    const hour = today.format('HH');
    const minute = today.format('mm');
    const second = today.format('ss');
    return hour + ":" + minute + ":" + second;
};


// ephemを計算する
function getEphem() {
    $.ajax("/getEphem", {
        type: "POST",
    }).done(function(data) {
        var dict = JSON.parse(data);
        if (dict["temp"] != "N/A") {
            $("#humi_time").text(getTime());
            //console.log(dict["temp"]);
            $("#temp").text(dict["temp"]);
        }
        if (dict["humi"] != "N/A") {
            //console.log(dict["humi"]);
            $("#humi").text(dict["humi"]);
        }
    }).fail(function() {
        console.log("温度取得失敗");
    });
};


// DHT11から温湿度を取得する
function getTemp() {
    $.ajax("/getTemp", {
        type: "POST",
    }).done(function(data) {
        var dict = JSON.parse(data);
        if (dict["temp"] != "N/A") {
            $("#humi_time").text(getTime());
            //console.log(dict["temp"]);
            $("#temp").text(dict["temp"]);
        }
        if (dict["humi"] != "N/A") {
            //console.log(dict["humi"]);
            $("#humi").text(dict["humi"]);
        }
    }).fail(function() {
        console.log("温度取得失敗");
    });
};


// 電圧を取得する
function getVolt() {
    $.ajax("/getVolt", {
        type: "POST",
    }).done(function(data) {
        var dict = JSON.parse(data);
        const bat = dict["ana3"];

        $("#volt_time").text(getTime());
        $("#bat_now1").text(bat + "%");
        $("#bat_now2").text("（" + Math.floor(9600 * bat / 100) + "Wh）");
        $("#meter-bar").css("width", bat + "%");
    }).fail(function() {
        console.log("電圧取得失敗");
    });
};


// 光の状態を取得する
function getLight() {
    $.ajax("/getLight", {
        type: "POST",
    }).done(function(data) {
        var dict = JSON.parse(data);
        var cnt = 0;
        // var result = ""
        const pins = ["26", "19", "13", "6", "5"];
        pins.forEach((pin) => {
            if (dict[pin]==1) {
                img = "sun.png";
            } else {
                img = "cloud.png";
                cnt += 1;
            }
            $("#light" + pin).attr("src", "/static/images/" + img);
        if (cnt > 2) {
          var img = "led_on.png";
          var result = "LED ON";
        } else {
          var img = "led_off.png";
          var result = "LED OFF";
        }
        $("#led_status").text(result);
        $("#led_img").attr("src", "/static/images/" + img);
        });
    }).fail(function() {
        console.log("光センサー取得失敗");
    });
};

// グラフを描画する
function drawGraph() {
    const ctx = $("#myChart");
    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8月1日', '8月2日', '8月3日', '8月4日', '8月5日', '8月6日', '8月7日'],
        datasets: [
          {
            label: '最高気温(度）',
            data: [35, 34, 37, 35, 34, 35, 34, 25],
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(0,0,0,0)",
            lineTension: 0
          },
          {
            label: '最低気温(度）',
            data: [25, 27, 27, 25, 26, 27, 25, 21],
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,0,0)",
            lineTension: 0
          }
        ],
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: '気温（8月1日~8月7日）'
        },
        scales: {
          yAxes: [{
            ticks: {
              suggestedMax: 40,
              suggestedMin: 0,
              stepSize: 10,
              callback: function(value, index, values){
                return  value +  '度'
              }
            }
          }]
        },
      }
    });
}




const weekdays = ["日", "月", "火", "水", "木", "金", "土"];



function showtime() {
    const today = dayjs();
    const month = today.month() + 1;
    const date = today.date();
    const week = weekdays[today.day()];
    const hour = today.format('HH');
    const minute = today.format('mm');
    const second = today.format('ss');
    $("#time").html(month + "月" + date + "日（" + week + "） " + hour + ":" +minute + ":" + second);
    const seconds = minute + "" + second;
    
    const amari = seconds % period;
    
    console.log(amari);

  }


function send_to_python() {
    $.ajax("/call_from_ajax", {
        type: "POST",
    }).done(function(received_data) {                   // 戻ってきたのはJSON（文字列）
        var received_dict = JSON.parse(received_data);  // JSONを連想配列にする
        // 以下、Javascriptで料理する
        pins.forEach((pin) => {
            if (received_dict[pin]==1) {
                img = "sun.png";
            } else {
                img = "cloud.png";
            }
            $("#light" + pin).attr("src", "/static/images/" + img);
            //$("#light" + pin).text(received_dict[pin]);
        
        $("#temp").text(received_dict["temp"]);
        $("#humi").text(received_dict["humi"]);
        if (received_dict["cnt"] < 2) {
          img = "led_on.png";
        } else {
          img = "led_off.png";
        }
        $("#led_status").text(received_dict["result"]);
        $("#led_img").attr("src", "/static/images/" + img);
        });
        
        // meter
        const bat = received_dict["ana3"];
        $("#bat_now1").text(bat + "%");
        $("#bat_now2").text("（" + Math.floor(9600 * bat / 100) + "Wh）");
        $("#meter-bar").css("width", bat + "%");
    }).fail(function() {
        console.log("失敗");
    });
};

async function loop(){
    setInterval(timer, 1000);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    var isBusy = false;
    while (true) {
        if (! isBusy) {
            isBusy = true;
            send_to_python();
            isBusy = false;
            await sleep(5000);     // 単位はミリ秒
        }
    };
};


/*
async function loop(){
    setInterval(showtime, 1000);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    var isBusy = false;
    while (true) {
        if (! isBusy) {
            isBusy = true;
            send_to_python();
            isBusy = false;
            await sleep(5000);     // 単位はミリ秒
        }
    };
};


$().ready(function(){
    setInterval(showtime, 1000);
    const ctx = $("#myChart");
    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8月1日', '8月2日', '8月3日', '8月4日', '8月5日', '8月6日', '8月7日'],
        datasets: [
          {
            label: '最高気温(度）',
            data: [35, 34, 37, 35, 34, 35, 34, 25],
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(0,0,0,0)",
            lineTension: 0
          },
          {
            label: '最低気温(度）',
            data: [25, 27, 27, 25, 26, 27, 25, 21],
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,0,0)",
            lineTension: 0
          }
        ],
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: '気温（8月1日~8月7日）'
        },
        scales: {
          yAxes: [{
            ticks: {
              suggestedMax: 40,
              suggestedMin: 0,
              stepSize: 10,
              callback: function(value, index, values){
                return  value +  '度'
              }
            }
          }]
        },
      }
    });
});
*/
