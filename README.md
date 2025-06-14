# 概要
- Googleドキュメントの新規追加分を検出して，Slackに通知するプログラムです．
- PCSUの講座後mtg議事録送信業務を自動化したものです．
- 初回実行前に，手動で複製をしておく必要があります．
- 
# ファイルの説明
- `コード.js`
  - バックエンド
- `diff_match_patch.js`
  - JavaScriptの差分計算ライブラリの中身をコピペしたもの（ソース：https://github.com/google/diff-match-patch/blob/master/javascript/diff_match_patch.js）
  - GASでは標準で差分計算ができず，ライブラリも提供されていなかったため，このような形で使用している．
- `index.html`
  - フロントエンド

# 使用方法
- あああ