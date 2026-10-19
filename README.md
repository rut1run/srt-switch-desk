# GitHub.io版の使い方

ZIPには2つのフォルダが入っています。

- `github-pages/`：GitHub Pagesで公開する操作画面。
- `srt-switch-desk/`：配信PCで起動する受信セット。既存のdataフォルダは残して上書き更新。

## 1. GitHub Pagesを公開

1. 公開先のリポジトリを用意します。専用リポジトリを推奨します。
2. `github-pages`の**中身**をリポジトリ直下へアップロードします。github-pagesフォルダ自体をそのまま入れないでください。
3. Settings → Pages → Build and deployment → Source「Deploy from a branch」→ main / (root) → Save。
4. GitHubが表示する公開URLを開きます。リポジトリ名に.github.ioを付ける必要はありません。

個人用の管理キー・受信設定・OBSパスワード・dataフォルダをアップロードする必要はありません。配布した公開用フォルダには含めていません。

## 2. 配信PCの受信セットを起動

1. 配信PCと送信PCをTailscaleへ接続。
2. 配信PCで旧版の受信セットを停止してから、更新版の `START_GITHUB.bat` を起動。
3. 初回はPython 3.11以降が必要です。MediaMTX・FFmpeg・Pythonパッケージを自動セットアップします。
4. Tailscale ServeでHTTPSを有効化します。Tailscaleがブラウザでの設定を案内したら、その案内に従ってHTTPSを有効にし、再度実行してください。
5. 接続用URL `https://受信PC名.あなたのtailnet.ts.net:8443` と管理キーが表示されます。

初期設定ではTailscaleのHTTPSポート8443を使用します。既存サービスと競合する場合は停止し、配信PCの展開先で `powershell -ExecutionPolicy Bypass -File .\CONNECT_GITHUB.ps1 -HttpsPort 8444` のように別ポートを指定してから通常のSTART.batを起動してください。既存のServe全設定をリセットする操作はしません。

## 3. GitHub.ioから接続

1. GitHub.ioの操作画面を開き、「設定」に配信PCのHTTPS接続先URLと管理キーを入力。
2. ブラウザにネットワークへのアクセス許可が表示された場合は許可します。
3. 「接続する」を押します。映像・ミキサー・分割レイアウトをサイトから操作できます。
4. 接続先URLはブラウザに保持し、管理キーはセッション内だけで保持します。

初回は受信PC内のサイトが開きます。そこの「設定 → GitHub.ioから操作する」で**公開したGitHub PagesのURL**を保存すると、次回からSTART_GITHUB.batがGitHub.ioを接続情報付きで開きます。管理キーはURLのフラグメントに一時的に渡してすぐ削除し、GitHubへHTTPリクエストとして送信しません。

## 4. 各PCからの送信とOBS

送信担当者には、管理画面の入力ごとの「送信URL」だけを渡します。受信PCのTailscale IPv4はスクリプトが設定します。
送信OBSはH.264 / Bフレーム0 / AAC / キーフレーム間隔1秒。
取り込み方法は「WebRTC出力ページ」。OBSには設定画面に出る**配信PCの出力URL**を設定します。GitHub.io自体のURLをOBSへ貼る必要はありません。
OBSと受信セットが同じPCなら、出力URLは `http://127.0.0.1:8765/player.html?...` のままで使えます。

## 接続の範囲

- GitHub.ioから操作する人のPCもTailscaleへの接続が必要です。
- ServeはTailscale内だけの公開です。Funnelやルーターのポート開放は使用しません。
- HTTPSの操作用通信と別に、SRT（UDP 8890）、WebRTC（UDP/TCP 8189）がTailscale越しに届く必要があります。
- Windowsファイアウォールで止まる場合は、管理者PowerShellでALLOW_TAILSCALE.ps1を実行します。
- Tailscaleのアクセスルールで、必要なPC同士の通信を許可してください。
- Serveはバックグラウンド設定を保持しますが、受信セットを停止すれば映像処理と操作APIも停止します。

## 検証

公開用の相対パス、API認証、クロスオリジンのプリフライト、GitHub URLの検証を確認済みです。
WindowsのTailscale Serve、ブラウザのローカルネットワーク許可、実WebRTC映像とOBS音声は利用PCで確認が必要です。
公開先リポジトリが指定されるまではGitHub.ioへの公開作業は未完了です。
