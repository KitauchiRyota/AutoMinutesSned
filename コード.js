function checkDiff() {
  /**
   * 前回プログラム実行時の内容は、外部ファイルに出力することで差分を計算
   * プログラムはWebアプリとしてデプロイし、各ユーザーの認証をスキップ 
   * 
   * 冗長部分が多すぎるので，後でリファクタリングする
   */

  const preDocURL = "***REMOVED***";
  const preDoc = DocumentApp.openByUrl(preDocURL);
  const preBoby = preDoc.getBody();
  const preText = preBoby.getText();

  const docURL = "***REMOVED***";
  const doc = DocumentApp.openByUrl(docURL);
  const body = doc.getBody();
  const text = body.getText();

  // // textの中身を確認
  // Logger.log(text);

  // 各セクションのマーカー定義をオブジェクトの配列として管理
  // ユニーク識別子の設定(この識別子のユニーク性が，厳密に保証されているかは正直微妙)
  const presections = [
    {
      name: "トラブル報告欄",
      startMarker: "<!!=====2.trobulse_start=====!!>",
      endMarker: "<!!=====2.trobulse_end=====!!>",
      startIndex: -1, // 初期値
      endIndex: -1    // 初期値
    },
    {
      name: "Tips",
      startMarker: "<!!=====4.tips_start=====!!>",
      endMarker: "<!!=====4.tips_end=====!!>",
      startIndex: -1,
      endIndex: -1
    }
    // 他にもセクションがある場合はここに追加
  ];

  const sections = [
    {
      name: "トラブル報告欄",
      startMarker: "<!!=====2.trobulse_start=====!!>",
      endMarker: "<!!=====2.trobulse_end=====!!>",
      startIndex: -1, // 初期値
      endIndex: -1    // 初期値
    },
    {
      name: "Tips",
      startMarker: "<!!=====4.tips_start=====!!>",
      endMarker: "<!!=====4.tips_end=====!!>",
      startIndex: -1,
      endIndex: -1
    }
    // 他にもセクションがある場合はここに追加
  ];

  let allMarkersFound = true; // 
  // キャッシュドキュメントは，そもそもカレントドキュメントから生成しているので，チェックはキャッシュドキュメントには不要かも

  // 各セクションのインデックスを計算し、妥当性をチェック
  for (let i = 0; i < presections.length; i++) {
    const presection = presections[i];

    presection.startIndex = preText.indexOf(presection.startMarker);
    presection.endIndex = preText.indexOf(presection.endMarker);

  if (presection.startIndex === -1 || presection.endIndex === -1 || presection.endIndex <= presection.startIndex) {
    Logger.log(`${presection.name} の開始・終了マーカーが preDocURL で見つからないか、順序が不正です。`);
  }
}


  // 各セクションのインデックスを計算し、妥当性をチェック
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    section.startIndex = text.indexOf(section.startMarker);
    section.endIndex = text.indexOf(section.endMarker);

    if (section.startIndex === -1 || section.endIndex === -1 || section.endIndex <= section.startIndex) {
      Logger.log(`${section.name} の開始・終了マーカーが見つからないか、順序が不正です。`);
      allMarkersFound = false; // 不正なセクションがあればフラグをfalseにする
    }
  }

  // 全てのマーカーが正しく見つからなかった場合は処理を中断
  if (!allMarkersFound) {
    return;
  }

  // ここから、取得したインデックスを使って後続の処理を行う
  // 例: 各セセクションのインデックスをログに出力
  presections.forEach(section => {
    Logger.log(`pre${section.name} - 開始インデックス: ${section.startIndex}, pre終了インデックス: ${section.endIndex}`);
  });
  sections.forEach(section => {
    Logger.log(`${section.name} - 開始インデックス: ${section.startIndex}, 終了インデックス: ${section.endIndex}`);
  });

  const currentTrobles = text.substring(
    sections[0].startIndex + sections[0].startMarker.length,
    sections[0].endIndex
  )//.trim();
  const currentTips = text.substring(
    sections[1].startIndex + sections[1].startMarker.length,
    sections[1].endIndex
  )//.trim();

  const preTrobles = preText.substring(
    presections[0].startIndex + presections[0].startMarker.length,
    presections[0].endIndex
  )//.trim();
  const preTips = preText.substring(
    presections[1].startIndex + presections[1].startMarker.length,
    presections[1].endIndex
  )//.trim();

  Logger.log("current" + currentTrobles);
  Logger.log("pre" + preTrobles);

  Logger.log("current" + currentTips);
  Logger.log("pre" + preTips);

  Logger.log(presections)
  Logger.log(presections[0].endIndex)

  // // 各セクションのインデックスを計算し、妥当性をチェック
  // for (let i = 0; i < sectionss.length; i++) {
  //   const sections = sectionss[i];
  //   const currentContent = text.substring(
  //     sections.startIndex + sections.startMarker.length,
  //     sections.endIndex
  //   ).trim();
  //   Logger.log(currentContent)
  // }

  const dmp = new diff_match_patch();
  // var text1 = "こんにちは。これはテストの文字列です。";
  // var text2 = "こんばんは。これは新しいテストの文字列です。";

  var diffs = dmp.diff_main(currentTrobles, preTrobles);

  // 差分を「人間が読める形式」に整理（オプションだが推奨）
  // 例えば "abc" と "axc" の差分が "a", "-b", "x", "c" のようになるのを
  // "a", "-b+x", "c" のように整理してくれる
  dmp.diff_cleanupSemantic(diffs);

  // // Logger.log("--- 全ての差分 ---");
  // // Logger.log(diffs); // 例: [[0, "これは"], [-1, "テスト"], [1, "新しいテスト"], [0, "の文字列です。"]]


  var addedParts = [];
  // 差分リストをループして、挿入された部分だけを抽出する
  for (var i = 0; i < diffs.length; i++) {
    var operation = diffs[i][0]; // オペレーション (0: EQUAL, -1: DELETE, 1: INSERT)
    var difftext = diffs[i][1];     // テキスト

    if (operation === 1) { // 挿入 (DIFF_INSERT) の場合
      addedParts.push(difftext);
    }
  }

  // // Logger.log("元のtext1: " + text1);
  // // Logger.log("元のtext2: " + text2);
  // Logger.log("新たに追加された部分: " + JSON.stringify(addedParts)); // 配列として出力
  // // Logger.log(type(addedParts.type));
  // // Logger.log("新たに追加された部分（結合済み）: " + addedParts.join('')); // 全て結合して一つの文字列として出力

  username = "通知test";
  icon_emoji = ":watermelon:";

  // 送信したいWebHoolkのURL
  var webhookUrl = "***REMOVED***";

  // Slack専用のリンク挿入方法
  var message = "議事録差分抽出のテストです\n";

  // WebHookがSlackにメッセージを送信する
  // 投稿される内容は、message変数の中身です
  var payload = JSON.stringify({ "text": addedParts.join(""), "username": username, "icon_emoji": icon_emoji });

  var options = {
    method: "post",
    contentType: "application/json",
    payload: payload
  };

  UrlFetchApp.fetch(webhookUrl, options);


  // Browser.msgBox(JSON.stringify(addedParts));


  // const userProps = PropertiesService.getUserProperties();
  // const previousContent = userProps.getProperty("lastContent") || "";

  // if (currentContent !== previousContent) {
  //   Logger.log("差分があります！");
  //   Logger.log("前回: " + previousContent);
  //   Logger.log("今回: " + currentContent);

  //   // 差分の保存
  //   userProps.setProperty("lastContent", currentContent);
  // } else {
  //   Logger.log("差分はありません。");
  // }
}

// diff_match_patch.gs に diff_match_patch.js のコードが貼り付けられている前提

function demonstrateDiffMatchPatch() {
  var dmp = new diff_match_patch();

  var text1 = "The quick brown fox jumps over the lazy dog.";
  var text2 = "The fast black fox jumps over the lazy cat.";

  // 差分を計算する
  var diffs = dmp.diff_main(text1, text2);

  // 差分を見やすく整形する (オプション)
  dmp.diff_cleanupSemantic(diffs);

  Logger.log("Diffs: " + JSON.stringify(diffs));

  // パッチを作成し、適用する
  var patch = dmp.patch_make(text1, text2, diffs);
  Logger.log("Patch: " + JSON.stringify(patch));

  var patchResult = dmp.patch_apply(patch, text1);
  Logger.log("Patched text: " + patchResult[0]); // 適用後のテキスト
  Logger.log("Patch applied successfully: " + patchResult[1]); // 適用に成功したかどうかのブール値の配列
}

function extractAddedParts() {
  var dmp = new diff_match_patch();

  var text1 = "The quick brown fox jumps over the lazy dog.";
  var text2 = "The fast black fox jumps over the lazy cat.";

  // 差分を計算する
  var diffs = dmp.diff_main(text1, text2);

  // （オプション）セマンティックな整形を行うことで、より自然な差分になることがあります
  // dmp.diff_cleanupSemantic(diffs);

  var addedParts = [];

  // 差分リストをループして、挿入された部分だけを抽出する
  for (var i = 0; i < diffs.length; i++) {
    var operation = diffs[i][0]; // オペレーション (0: EQUAL, -1: DELETE, 1: INSERT)
    var text = diffs[i][1];     // テキスト

    if (operation === 1) { // 挿入 (DIFF_INSERT) の場合
      addedParts.push(text);
    }
  }

  Logger.log("元のtext1: " + text1);
  Logger.log("元のtext2: " + text2);
  Logger.log("新たに追加された部分: " + JSON.stringify(addedParts)); // 配列として出力
  Logger.log("新たに追加された部分（結合済み）: " + addedParts.join('')); // 全て結合して一つの文字列として出力
}

// 実行結果例:
// 元のtext1: The quick brown fox jumps over the lazy dog.
// 元のtext2: The fast black fox jumps over the lazy cat.
// 新たに追加された部分: ["fast black","cat"]
// 新たに追加された部分（結合済み）: fast blackcat


