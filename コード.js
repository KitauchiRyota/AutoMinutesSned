function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('議事録自動送信'); // ブラウザのタブに表示されるタイトル
}

function checkDiff(classday) {
  /**
   * 前回プログラム実行時の内容は、外部ファイルに出力することで差分を計算
   * プログラムはWebアプリとしてデプロイし、各ユーザーの認証をスキップ 
   * 
   * 冗長部分が多すぎるので，後でリファクタリングする
   */

/**
 * 運用方法
 * １．講座前に講座後mtg議事録作成
 * ２．キャッシュ用の議事録を手動でコピー
 * ３．キャッシュ用・議事録用のどちらもURLを手動でコピーしてこのコードに貼り付け
 * ４．Webアプリとしてデプロイし，WebアプリのURLを議事録に貼り付け
 */
  const preDocURL = previousDocUrl;
  const preDoc = DocumentApp.openByUrl(preDocURL);
  const preBoby = preDoc.getBody();
  const preText = preBoby.getText();

  const docURL = currentDocUrl;
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
      startMarker: "<!!=====2.troubles_start=====!!>",
      endMarker: "<!!=====2.troubles_end=====!!>",
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
      startMarker: "<!!=====2.troubles_start=====!!>",
      endMarker: "<!!=====2.troubles_end=====!!>",
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

  // if (presection.startIndex === -1 || presection.endIndex === -1 || presection.endIndex <= presection.startIndex) {
  //   Logger.log(`${presection.name} の開始・終了マーカーが preDocURL で見つからないか、順序が不正です。`);
  // }
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
  // presections.forEach(section => {
  //   Logger.log(`pre${section.name} - 開始インデックス: ${section.startIndex}, pre終了インデックス: ${section.endIndex}`);
  // });
  // sections.forEach(section => {
  //   Logger.log(`${section.name} - 開始インデックス: ${section.startIndex}, 終了インデックス: ${section.endIndex}`);
  // });

  const currentTroubles = text.substring(
    sections[0].startIndex + sections[0].startMarker.length,
    sections[0].endIndex
  )//.trim();
  const currentTips = text.substring(
    sections[1].startIndex + sections[1].startMarker.length,
    sections[1].endIndex
  )//.trim();

  const preTroubles = preText.substring(
    presections[0].startIndex + presections[0].startMarker.length,
    presections[0].endIndex
  )//.trim();
  const preTips = preText.substring(
    presections[1].startIndex + presections[1].startMarker.length,
    presections[1].endIndex
  )//.trim();

  // Logger.log("current" + currentTroubles);
  // Logger.log("pre" + preTroubles);

  // Logger.log("current" + currentTips);
  // Logger.log("pre" + preTips);

  // Logger.log(presections)troubles
  // Logger.log(presections[0].endIndex)

function normalizeTextForDiff(text) {
  // すべての空白文字（スペース、タブ、改行）を正規表現でマッチさせ、
  // 連続するそれらを単一のスペースに置換する。
  // これにより、空行や行末のスペース、連続するスペースなどが統一される。
  let normalized = text.replace(/\s+/g, ' ');

  // さらに、文字列全体の先頭と末尾のスペースを削除
  normalized = normalized.trim();

  return normalized;
}
const cleanedPreTroubles = normalizeTextForDiff(preTroubles);
const cleanedCurrentTroubles = normalizeTextForDiff(currentTroubles);

const cleanedPreTips = normalizeTextForDiff(preTips);
const cleanedCurrentTips = normalizeTextForDiff(currentTips);

  // 差分抽出クラスのインスタンスを作成
  const dmp = new diff_match_patch();
  let troublesDiffs = dmp.diff_main(cleanedPreTroubles,cleanedCurrentTroubles);
  let tipsDiffs = dmp.diff_main(cleanedPreTips,cleanedCurrentTips);

  // 差分を「人間が読める形式」に整理（オプションだが推奨）
  // dmp.diff_cleanupSemantic(troublesDiffs);
  // dmp.diff_cleanupSemantic(tipsDiffs);

  let troublesResults = [];
  // 差分リストをループして、挿入された部分だけを抽出する
  for (let i = 0; i < troublesDiffs.length; i++) {
    let operation = troublesDiffs[i][0]; // オペレーション (0: EQUAL, -1: DELETE, 1: INSERT)
    let difftext = troublesDiffs[i][1];     // テキスト

    if (operation === 1) { // 挿入 (DIFF_INSERT) の場合
      troublesResults.push(difftext);
    }
  }

  let tipsResults = [];
  // 差分リストをループして、挿入された部分だけを抽出する
  for (let i = 0; i < tipsDiffs.length; i++) {
    let operation = tipsDiffs[i][0]; // オペレーション (0: EQUAL, -1: DELETE, 1: INSERT)
    let difftext = tipsDiffs[i][1];     // テキスト

    if (operation === 1) { // 挿入 (DIFF_INSERT) の場合
      tipsResults.push(difftext);
    }
  }

  Logger.log("preTroubles: " + preTroubles);
  Logger.log("currentTroubles: " + currentTroubles);
  Logger.log("新たに追加された部分: " + JSON.stringify(troublesResults)); // 配列として出力
  // // Logger.log(type(troublesResults.type));
  // // Logger.log("新たに追加された部分（結合済み）: " + troublesResults.join('')); // 全て結合して一つの文字列として出力

  username = "講座後mtg議事録送信bot";
  icon_emoji = ":watermelon:";

  // 送信したいWebHoolkのURL
  let webhookUrl = webhookURL;

  // Slack専用のリンク挿入方法
  const troublesMessage =troublesResults.join("\n・").replaceAll("・ ・", "・");
  const tipsMessage =tipsResults.join("\n・").replaceAll("・ ・", "・");

  let message = classday +"の<"+docURL+"|講座後mtg議事録> です\n"+"\n*2.トラブル報告*\n・"+troublesMessage+"\n*4.Tips*\n・"+tipsMessage;

  // WebHookがSlackにメッセージを送信する
  // 投稿される内容は、message変数の中身です
  let payload = JSON.stringify({ "text": message, "username": username, "icon_emoji": icon_emoji });

  let options = {
    method: "post",
    contentType: "application/json",
    payload: payload
  };

  UrlFetchApp.fetch(webhookUrl, options);

  // // キャッシュ用ファイルを更新
//   const troublesRegex = /(<!!=====2.troubles_start=====!!>)(.*?)(<!!=====2.troubles_end=====!!>)/g; // gフラグで全てのマッチを対象

//   // 置換後の文字列（$1はSTART_ID、$3はEND_ID。その間に新しい文字列を挿入）
//   const troublesReplacement = currentTroubles;
// Logger.log("troublesReplacement:"+troublesReplacement);
  preBoby.clear();
  preBoby.appendParagraph("<!!=====2.troubles_start=====!!>"+currentTroubles+"<!!=====2.troubles_end=====!!>")
  preBoby.appendParagraph("<!!=====4.tips_start=====!!>"+currentTips+"<!!=====4.tips_end=====!!>")
// Logger.log("preBody:"+preBoby)

  // ドキュメント全体で置換を実行
  // preBoby.replaceText(troublesRegex, currentTroubles);

  // Browser.msgBox(JSON.stringify(troublesResults));


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