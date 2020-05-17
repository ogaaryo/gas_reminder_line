function main() {
  const prop = PropertiesService.getScriptProperties().getProperties();
  const post_data = getPostData(prop);
  if (post_data){
    sendPostContent(prop, post_data);
  }
}

function getPostData(prop){
  const spsheet = SpreadsheetApp.openById(prop.spid);
  const sheet = spsheet.getSheetByName(prop.sheet_name);
  const header = getHeader(sheet);
  const body_data = getBodyData(sheet, header.length);
  if (body_data.length == 0){
    return;
  }
  return toPostStr(header, body_data);
}

function getHeader(sheet){
  let header_data = [];
  const header_row = 1;
  for (let header_column = 2; ; header_column++){
    let data = sheet.getRange(header_row, header_column).getValue();
    if (!data){
      break;
    }
    header_data.push(data);
  }
  return header_data;
}

function getBodyData(sheet, data_num){
  let post_data = [];
  let today = new Date();
  for (let i =2; ;i++){
    let date_data = sheet.getRange(i, 1).getValue();
    // 日付データが取得できなかったら終了
    if (!date_data){
      break;
    }
    // 準備期間を取得
    let diff_date = sheet.getRange(i, 3).getValue();
    date_data.setDate(date_data.getDate() - diff_date);
    // 今日と実行日が一致しているか判定
    if (today.getMonth() == date_data.getMonth() && today.getDate() == date_data.getDate()){
      for (let j =2; j < data_num + 2; j++){
        post_data.push(sheet.getRange(i, j).getValue());
      }
      return post_data;
    }
  }
  return post_data;
}

function toPostStr(header, body_data){
  let res = '\n';
  for (let i = 0; i < header.length; i++){
    res += header[i] + ' ： ' + body_data[i] + '\n';
  }
  return res;
}

function sendPostContent(prop, post_data){
    var options = {
    "method": "post",
    "payload" : {"message": post_data },
    "headers": {"Authorization": "Bearer " + prop.line_token}
  }
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
