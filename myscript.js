const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const pins = ["26", "19", "13", "6", "5"];

function showtime() {
    const today = dayjs();
    const month = today.month() + 1;
    const date = today.date();
    const week = weekdays[today.day()];
    const hour = today.format('HH');
    const minute = today.format('mm');
    const second = today.format('ss');
    $("#time").html(month + "月" + date + "日（" + week + "） " + hour + ":" +minute + ":" + second);
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
        console.log(received_dict["temp"]);
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
        
        await sleep(5000);     // 単位はミリ秒
        
    }).fail(function() {
        console.log("失敗");
    });
};

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
