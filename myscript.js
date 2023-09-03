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
