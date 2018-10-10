/** プロパティ情報取得 **/
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("slackAccessToken");
var CHANNEL_ID = PropertiesService.getScriptProperties().getProperty("channelName");
var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("sheetId");

/** 範囲区切り文字 */
var RANGE_DELIMITER = ":";

/** script_infoシート */
var SHEET_NAME_SCRIPT_INFO = "script_info";
/** 開始行 */
var ROW_START = "3";
/** 役割列 */
var COL_ROLE = "C";
/** ユーザID列 */
var COL_USER_ID = "D";

/** 情報取得 **/
var scriptInfoSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME_SCRIPT_INFO);
var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);

/** BOT情報 **/
var BOT_NAME = "ぼっと";

/** 定数 **/
var ROLE = "role";
var USER_ID = "userId";

function notification(){
  var infoList = roleReplacement(getInfo());
  var message = "今週のアラート対応者\n";
  for(var i=0;i<infoList.length;i++){
    message += "<@" + infoList[i][USER_ID] + "> " + infoList[i][ROLE] + "\n";
  }
  reply(message);
  Logger.log(infoList);
}

/*
* slack投稿関数
*/
function reply(message){
  var options = {
    username: BOT_NAME
  }
  slackApp.postMessage(CHANNEL_ID, message, options);
}

/*
* シートから情報取得
*/
function getInfo(){
  var role = scriptInfoSheet.getRange(COL_ROLE + ROW_START + RANGE_DELIMITER + COL_ROLE).getValues();
  var userId = scriptInfoSheet.getRange(COL_USER_ID + ROW_START + RANGE_DELIMITER + COL_USER_ID).getValues();
  
  var infoList = new Array();
  for(var i=0;i<role.length;i++){
    var info = {};
    if(role[i] != "" && userId[i] != ""){
      info[ROLE] = role[i];
      info[USER_ID] = userId[i];
      infoList.push(info);
    }
  }
  
  return infoList;
}

/*
* 当番入れ替え
*/
function roleReplacement(infoList){
  infoList.push(infoList[0]);
  var replacementInfoList = new Array();
  for(var i=0;i<infoList.length-1;i++){
    var replacementInfo = {};
    replacementInfo[ROLE] = infoList[i][ROLE];
    replacementInfo[USER_ID] = infoList[i + 1][USER_ID];
    replacementInfoList.push(replacementInfo);
    scriptInfoSheet.getRange(COL_USER_ID + (parseInt(ROW_START, 10) + i)).setValue(replacementInfo[USER_ID]);
  }
  return replacementInfoList;
}