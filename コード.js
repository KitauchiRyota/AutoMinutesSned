function checkDiff() {
  const doc = DocumentApp.openById("あなたのドキュメントID");
  const body = doc.getBody();
  const text = body.getText();

  // ユニーク識別子の設定
  const startMarker = "===DIFF_START===";
  const endMarker = "===DIFF_END===";

  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    Logger.log("識別子が見つからないか、順序が不正です。");
    return;
  }

  const currentContent = text.substring(
    startIndex + startMarker.length,
    endIndex
  ).trim();

  const userProps = PropertiesService.getUserProperties();
  const previousContent = userProps.getProperty("lastContent") || "";

  if (currentContent !== previousContent) {
    Logger.log("差分があります！");
    Logger.log("前回: " + previousContent);
    Logger.log("今回: " + currentContent);

    // 差分の保存
    userProps.setProperty("lastContent", currentContent);
  } else {
    Logger.log("差分はありません。");
  }
}
