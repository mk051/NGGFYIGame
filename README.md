NGGFYIGame
==========

This simple game made for the team "755Apps". The linsens is MIT.

Version
----
0.1


License
----
MIT 

info
---
JavaScript学習用のサンプルゲームを作ってみました。実機で動かす場合、実機験証していないので人柱覚悟でお願いします。


開発環境
--------
phonegap v3.4.0-0.19.7  
enchant.js v0.8.0

phonegapってなに
----------------
ハイブリッドモバイルアプリの開発フレームワークです。  
[phonegap][phonegap]はCordovaという名前のオープンソースをアドビが配布するときの名前です。  
ChromeとChromiumの関係の様な感じ。


enchant.jsってなに
------------------
[enchart.js][enchantjs]はHTML5＋JavaScriptのフレームワークです。


phonegapのインストール
----
[phonegap][phonegap]のインストールには、npmが必要なため、npmが内蔵されている[node.js][node.js]をダウンロードしインストールして下さい。インストール後下記コマンドでphonegapのインストール。

    npm install phonegap -g


実行（android）
----
AndroidSDK等のAndroidの開発環境を整備してから下記コマンド実行

    cd NGGFYIGame
    phonegap run android


実行（ios）
----
Xcode等のiosの開発環境を整備してから下記コマンド実行

    cd NGGFYIGame
    phonegap run ios

その他
----
 ビルドだけしたいとき

    phonegap build [プラットフォーム]



[node.js]: http://nodejs.org/
[phonegap]: http://phonegap.com/
[enchantjs]: http://enchantjs.com/ja/
