function send_to_python() {
    console.log("called from loop");
    $.ajax("/call_from_ajax", {
        type: "POST",
    }).done(function(received_data) {                   // 戻ってきたのはJSON（文字列）
        var received_dict = JSON.parse(received_data);  // JSONを連想配列にする
        // 以下、Javascriptで料理する
        for (let key in received_dict) {
            $("#light" + key).text(received_dict[key]);
        }
    }).fail(function() {
        console.log("失敗");
    });
};

async function loop(){
    console.log("start");
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    var isBusy = false;
    while (true) {
        if (! isBusy) {
            isBusy = true;
            send_to_python();
            isBusy = false;
            await sleep(10);     // 単位はミリ秒
        }
    };
};
