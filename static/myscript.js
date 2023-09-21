const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

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


  function showmeter() {
    const bat_now = Math.floor(Math.random() * 100);
    const b_volume = Math.floor(Number($("#b_volume").text()));
    const ah = Math.floor(Number($("#ah").val()));
    const led_pow = Math.floor(Number($("#led_pow").val()));
    const led_cnt = Math.floor(Number($("#led_cnt").val()));
    const bat_voltage = Math.floor(Number($("#bat_voltage").val()));
    const bat_cnt = Math.floor(Number($("#bat_cnt").val()));
    const param = Math.floor(Number($("#param").val()));
    const light_hour = Number($("#light_hour").val());
    const hours = Number($("#hours").val());
    const light_pow = Math.floor(Number($("#light_pow").text()));
    const control_pow = led_pow * led_cnt;
    $("#bat_now1").text(bat_now + "%");
    $("#bat_now2").text("（" + Math.floor(b_volume * bat_now / 100) + "Wh）");
    $("#meter-bar").css("width", bat_now + "%");
  
    let elm = $("#bat_result1");
    if (b_volume * bat_now / 100 > light_pow) {
      elm.text("OK");
    } else {
      elm.text("NG");
    }
  
    const chg = Math.floor(param * 0.3); // 充電能力　0.3は薄曇りの係数
  
    elm = $("#bat_result2");
    if (b_volume * bat_now / 100 + chg > control_pow * hours) {
      elm.text("OK");
    } else {
      elm.text("NG");
    }
  
  }

$().ready(function(){
    calc_power();
    showmeter();

    setInterval(showtime, 1000);
    setInterval(showmeter, 1000*10);
    const ctx = $("#myChart");
    const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['9月1日', '9月2日', '9月3日', '9月4日', '9月5日', '9月6日', '9月7日'],
        datasets: [
          {
            label: '最高気温(度）',
            data: [35, 34, 37, 35, 34, 35, 34, 25],
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(0,0,0,0)"
          },
          {
            label: '最低気温(度）',
            data: [25, 27, 27, 25, 26, 27, 25, 21],
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,0,0)"
          }
        ],
      },
      options: {
        animation: false,
        title: {
          display: true,
          text: '気温'
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


function calc_power() {
  const ah = Math.floor(Number($("#ah").val()));
  const led_pow = Math.floor(Number($("#led_pow").val()));
  const led_cnt = Math.floor(Number($("#led_cnt").val()));
  const bat_voltage = Math.floor(Number($("#bat_voltage").val()));
  const bat_cnt = Math.floor(Number($("#bat_cnt").val()));
  const param = Math.floor(Number($("#param").val()));
  const light_hour = Number($("#light_hour").val());
  const hours = Number($("#hours").val());
  const light_pow = led_pow * led_cnt * light_hour;
  const control_pow = led_pow * led_cnt;
  const b_volume = Math.floor(ah * bat_voltage * bat_cnt / 2);

  $("#b_volume").text(b_volume);
  $("#light_pow").text(light_pow);

  const bat_values = [100, 80, 60, 40, 20, 10];
  const chg_values = [100, 75, 50, 30, 10]
  bat_values.forEach(b => {
    let bat_left = Math.floor(b_volume * b / 100);
    $("#bat_" + b).text(bat_left);

    let elm = $("#light_" + b);
    elm.removeClass("ok");
    elm.removeClass("ng");
    if (bat_left > light_pow) {
      elm.text("OK");
      elm.addClass("ok");
    } else {
      elm.text("NG");
      elm.addClass("ng");
    }
    chg_values.forEach(c => {
      let chg = Math.floor(param * c / 100);
      $("#chg_" + b + "_" + c).text(chg);
      $("#sum_" + b + "_" + c).text(chg+ bat_left);

      let elm = $("#light_" + b + "_" + c);
      elm.removeClass("ok");
      elm.removeClass("ng");
      if (chg + bat_left >= hours * control_pow) {
        elm.text("OK");
        elm.addClass("ok");
      } else {
        elm.text("NG");
        elm.addClass("ng");
      }
      });
  });
}

