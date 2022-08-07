# hostconv

DNS設定変換ツール <br>
スプレッドシート・Excelで管理している情報を各種設定情報に変換する。

https://caribouhy.github.io/hostconv/

## 対応形式

入力

- スプレッドシート・Excel

出力

- スプレッドシート・Excel
- hostsファイル
- unbound (local-data)
- JSON (デバッグ用)

## スプレッドシートのフォーマット

| FQDN | IPv4 | IPv6 |
| ---- | ---- | ---- |
| hoge.example.local | 192.168.1.1 | fe80::ab:cd |
| foo.example.local | 192.168.1.2 | |
| bar.example.local |  | fe80::123:45 |

## 今後開発予定の機能

- 入出力対応形式の拡充 (ルーターのコンフィグ等)
- 入力フォーマットのエラー表示
- デザイン改善