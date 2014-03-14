enchant();  //おまじない

getStyle = function(className) {

//    var dom  = document.createElement('a');
    var dom  = document.getElementById('tmp');    //domに追加しないとスタイル取得できないので仕方なく・・・
    dom.className = className;

    return dom.currentStyle || document.defaultView.getComputedStyle(dom,null); 
}
rgb2hex = function(rgb){    //RGP(255,255,225)から#ffffff形式に変換
    return "#" + rgb.match(/\d+/g).map(function(a){return ("0" + parseInt(a).toString(16)).slice(-2)}).join("");
}

Object.defineProperty(enchant.Label.prototype, "css", {
    get: function() { return ''; }, // ごめんなさいm(__)m
    set: function(className) {      // スタイル指定に対応している項目だけ・・

        var font = getStyle(className).fontSize + ' ' + getStyle(className).fontFamily;

        if("color"     in this ) { this.color     = getStyle(className).color;     };
        if("font"      in this ) { this.font      = font;                          };
        if("textAlign" in this ) { this.textAlign = getStyle(className).textAlign; };

//        console.log("className:"+className);
//        console.log("color:"+this.color     + " > " + getStyle(className).color);
//        console.log("font :"+this.font      + " > " + font);
//        console.log("align:"+this.textAlign + " > " + getStyle(className).textAlign);
    }
});

Object.defineProperty(enchant.Sprite.prototype, "css", {
    get: function() { return ''; }, // ごめんなさいm(__)m
    set: function(className) {      // スタイル指定に対応している項目だけ・・

        if("backgroundColor" in this ) { this.backgroundColor = getStyle(className).backgroundColor; };
    }
});

Object.defineProperty(enchant.Scene.prototype, "css", {
    get: function() {},         // ごめんなさいm(__)m
    set: function(className) {  // スタイル指定に対応している項目だけ・・

        if("backgroundColor" in this ) { this.backgroundColor = getStyle(className).backgroundColor; };
    }
});

var game;
var width;
var height;

window.onload = function() {

    var LABEL_START    = '->スタート<-';
    var LABEL_TITLE    = '糸通し';
    var LABEL_SBUTITLE = '(javascript var)';
    var LABEL_INFO     = 'スタートを押して開始';
    var LABEL_INFO2    = '触って上昇/離して下降';
    var LABEL_GAMEOVER = 'Gameover';
    var LABEL_RESET    = '->リセット<-';
    var LABEL_POINT    = '点';
    var LABEL_SEND     = '<<-スコア送信->>';

    var VALUE_MOVE_INTERVAL = 3;

    var WS_URL = "ws://young-gorge-3558.herokuapp.com/";  //WebSocket接続先
    var ws;

    try{
        // FireFox（かなり古い）との互換性を考慮してインスタンス化
             if ("WebSocket"    in window) { ws = new WebSocket(WS_URL);    }
        else if ("MozWebSocket" in window) { ws = new MozWebSocket(WS_URL); }
        else                               { return ; }
    }
    catch(e){
        console.log("WebSocket接続失敗："+ws);
    }

    // メッセージ受信時のコールバック関数
    ws.onmessage = function(event){
        console.log("受信メッセージ:" + event.data);
    }

    // メッセージ送信
    function onSend(json){
        console.log("送信メッセージ:" + json);
        ws.send(json);
    }

    // 終了時に明示的に接続を閉じる
    window.onunload = function(){

        var code = 4500;
        var reason = "クライアントが閉じられました。";
        ws.close(code,reason);
        console.log("クライアントが閉じられました。:" + code);
    }


    width  = window.innerWidth;
    height = window.innerHeight;
    
    game = new Core(width, height); // 表示領域の大きさを設定
    game.fps = 24;                      // ゲームの進行スピードを設定

    function cc(n,obj){  //computeCenter
        return (n - obj.height) / 2;
    }

    game.onload = function() { // ゲームの準備が整ったら実行する処理

        //タイトル画面
        var createStartScene = function() {

            var scene = new Scene(); // 新しいシーンを作る
            scene.css = 'startscene';
//            scene.backgroundColor = '#ffffff';

            // スタートラベル設定
            var start   = new Label(LABEL_START);
            start.x     = 0;
            start.y     = cc(height,start) * 1.0; // 縦位置設定:中央
            start.width = width;
            start.css   = 'start';
            scene.addChild(start);

            // タイトルラベル設定
            var title   = new Label(LABEL_TITLE);
            title.x     = 0;
            title.y     = cc(height,title) * 0.2; // 縦位置設定:4割
            title.width = width;
            title.css   = 'title';
            scene.addChild(title);

            var sub   = new Label(LABEL_SBUTITLE);
            sub.x     = 0;
            sub.y     = cc(height,sub) * 0.4; // 縦位置設定:
            sub.width = width;
            sub.css   = 'title';
            scene.addChild(sub);

            // 説明ラベル設定
            var info   = new Label(LABEL_INFO);
            info.x     = 0;
            info.y     = cc(height,info) * 1.6; // 縦位置設定:
            info.width = width;
            info.css   = 'info';
            scene.addChild(info);

            var info2   = new Label(LABEL_INFO2);
            info2.x     = 0;
            info2.y     = cc(height,info2) * 1.8; // 縦位置設定:
            info2.width = width;
            info2.css   = 'info';
            scene.addChild(info2);

            // スタートにタッチイベントを設定
            start.addEventListener(Event.TOUCH_START, function(e) {
                // 現在表示しているシーンをゲームシーンに置き換える
                game.replaceScene(createGameScene());
            });

            return scene;
        };

        // ゲームのメイン画面
        var createGameScene = function() {

            var scroll = 0; // スクロール量を記録する変数

            var CENTER_LINE   = height / 2;   // 画面中央
            var SCROLL_SPEED  = 10;           // スクロールの速さ(固定)
            var HURDLE_HEIGHT_DEFOLT = height * 0.3; // ハードル基礎値

            var scene = new Scene();       // 新しいシーンをつくる
            scene.css = 'gamescene';
//            scene.backgroundColor = '#ffffff';

            // 主人公(糸)の設定
            var person = new Sprite(32, 32);
            person.x   = 80;                               // 横位置調整:画面左側に配置
            person.y   = CENTER_LINE - (person.height /2); // 縦位置設定:中央
            person.css = 'person';
            scene.addChild(person);

            // 当たり判定用
            var person_hit = new Sprite(28, 28);           
            person_hit.x   = person.x + (person.width  - person_hit.width) /2; // 横位置調整 左右中央に配置
            person_hit.y   = person.y + (person.height - person_hit.height)/2; // 縦位置調整 上下中央に配置
            person_hit.css = 'hit';
            scene.addChild(person_hit);

            // ハードルの設定(上)
            var hurdleTop = new Sprite(50, HURDLE_HEIGHT_DEFOLT);
            hurdleTop.x   = width + 1;  // 横位置調整:画面外に隠しておく
            hurdleTop.y   = 0;          // 縦位置調整:画面下と合わせる
            hurdleTop.css = 'hurdle'
            scene.addChild(hurdleTop);

            // ハードルの設定(下)
            var hurdleBtm = new Sprite(50, HURDLE_HEIGHT_DEFOLT);
            hurdleBtm.x   = width + 1;                 // 横位置調整:画面外に隠しておく
            hurdleBtm.y   = height - hurdleBtm.height; // 縦位置調整:画面下と合わせる
            hurdleBtm.css = 'hurdle'
            scene.addChild(hurdleBtm);

            // スコア表示用ラベルの設定
            var score = new Label("");
            score.x   = 0;
            score.y   = 0;
            score.css = 'score_mini';
            scene.addChild(score);

            // 衝突した場合
            var personHit = function() {

                // ゲームオーバーシーンをゲームシーンに重ねる(push)
                game.pushScene(createGameoverScene(scroll));
            }

            var touch = false;  //タッチ状態 {true:触れてる false:離してる}

            // 毎フレームイベントをシーンに追加
            scene.addEventListener(Event.ENTER_FRAME, function(){

                scroll += SCROLL_SPEED;                       // 走った距離を記録
                score.text = scroll.toString() + LABEL_POINT; // スコア表示を更新

                //画面から消えたら（左端から） 
                if (hurdleTop.x < 0 - hurdleTop.width) {
                    hurdleTop.x = width; // ハードル(上)を右端に移動(出現)
                    hurdleBtm.x = width; // ハードル（下）を右端に移動(出現)

                    //　ハードルの高さを調節
                    var heightTop = height / 2 * Math.random() + 0.5; 
                    var heightBtm = height - (person.height * (Math.random() + 5)) - heightTop;

                    // ハードル同士の間の高さ取得
                    var margin = height - heightTop + heightBtm;

                    if (person.height < margin)
                    {
                        // ハードルの高さ調節
                        hurdleTop.height = heightTop;
                        hurdleBtm.height = heightBtm;   
                        hurdleBtm.y      = height - hurdleBtm.height; // 縦位置調整:画面下と合わせる
                    }
                }

                hurdleTop.x -= SCROLL_SPEED; // ハードル(上)をスクロール
                hurdleBtm.x -= SCROLL_SPEED; // ハードル（下）をスクロール

                // ハードルとの衝突判定
                if (hurdleTop.intersect(person_hit) 
                ||  hurdleBtm.intersect(person_hit)) { 
                    personHit(); // 衝突した
                }

                // 上下との衝突判定
                if ( person.y < 0 || height < person.y ) {
                    personHit();    // 衝突した
                };

                // キャラの上下
                if(touch != false) { person.y -= VALUE_MOVE_INTERVAL; } // 上昇
                else               { person.y += VALUE_MOVE_INTERVAL; } // 下降

                // 当たり判定を主人公の上下中心に置く
                person_hit.x = person.x + (person.width  - person_hit.width) /2;
                person_hit.y = person.y + (person.height - person_hit.height)/2;
            });

            // シーン全体にタッチイベントを追加
            scene.addEventListener(Event.TOUCH_START, function(e) { touch = true;  });  //タッチ開始(触った)
            scene.addEventListener(Event.TOUCH_END  , function(e) { touch = false; });  //タッチ終了(離した)

            return scene;   //ゲームシーンを返します
        }

        //ゲームオーバー画面
        var createGameoverScene = function(scroll) {

            var scene = new Scene();    // 新しいシーンを作る
            scene.css = 'gameoverscene';
//            scene.backgroundColor = '#ffffff';

            // ゲームオーバーを設定
            var gameover   = new Label(LABEL_GAMEOVER); // スプライトを作る
            gameover.x     = 0;                         // 横位置調整
            gameover.y     = cc(height,gameover) * 1.0; // 縦位置調整
            gameover.width = width;
            gameover.css   = 'gameover';
            scene.addChild(gameover);

            // リセットボタンを設定
            var reset   = new Label(LABEL_RESET); // スプライトを作る
            reset.x     = 0;                      // 横位置調整
            reset.y     = cc(height,reset) * 1.6; // 縦位置調整
            reset.width = width;
            reset.css   = 'reset';
            scene.addChild(reset);

            // リトライボタンにタッチイベントを追加する
            reset.addEventListener(Event.TOUCH_END, function(){
                game.popScene();                       // このシーンを剥がす（pop）
                game.replaceScene(createStartScene()); // ゲームシーンをタイトルシーンと入れ替える(replace)
            });

            // スコア表示用ラベルの設定
            var score   = new Label(scroll.toString() + LABEL_POINT); // ラベルを作る
            score.x     = 0;                      // 横位置調整
            score.y     = cc(height,score) * 0.2; // 縦位置調整
            score.width = width;                  // 幅を設定
            score.css   = 'score';
            scene.addChild(score);                // シーンに追加

            // 送信ボタンを設定
            var send   = new Label(LABEL_SEND); // スプライトを作る
            send.x     = 0;                      // 横位置調整
            send.y     = cc(height,send) * 0.4; // 縦位置調整
            send.width = width;
            send.css   = 'score';
            scene.addChild(send);

            // リトライボタンにタッチイベントを追加する
            send.addEventListener(Event.TOUCH_END, function(){

                //保存されたユーザー名取得
                var username = window.localStorage.getItem("username");
                    username = prompt("ユーザー名を入力", username);
                if (username == null || username == ""){
                    return ;
                }

                //ユーザー名保存
                window.localStorage.setItem("username", username);

                // JSON をサポートしているか調べる
                if(!window.JSON){
                    console.log("json変換:未対応");
                }

                //JSONパース
                var message  = scroll + "点(755Apps:糸通し javascript var)";
                var senddata = {name: username, body: message.toString()};
                var json     = JSON.stringify(senddata); // jsonに変換
                console.log("json:" + json);

                //送信
//                ws.send(json);  
            });

            return scene;   //ゲームシーンを返します
        };

        // ゲームの_rootSceneをスタートシーンに置き換える
        game.replaceScene(createStartScene());
    }

    game.start(); // ゲームをスタートさせます
}

window.onresize = function() {

    // 画面サイズをリサイズ
    width  = window.innerWidth;
    height = window.innerHeight;
    game.width = width;
    game.height;
}

