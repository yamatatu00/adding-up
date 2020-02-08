// 'use strict';
// // ①ファイルからデータを読み取る
// // fs は、FileSystem（ファイルシステム）の略で、ファイルを扱うためのモジュール
// const fs = require('fs');
// // readline は、ファイルを一行ずつ読み込むためのモジュール
// const readline = require('readline');
// // popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成
// const rs = fs.createReadStream('./popu-pref.csv');
// // さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成
// const rl = readline.createInterface({ 'input': rs, 'output': {} });
// // rl オブジェクトで line というイベントが発生したら この無名関数を呼んでください
// rl.on('line', (lineString) => {
//   // console.log(lineString);

//   // ②ファイルからデータを読み取る（2010 年と 2015 年のデータから 「集計年」「都道府県」「15〜19歳の人口」を抜き出す）
//   const columns = lineString.split(',');
//   // parseInt()(パースイント）という関数は文字列を整数値に変換する関数
//   const year = parseInt(columns[0]);
//   const prefecture = columns[1];
//   const popu = parseInt(columns[3]);
//   if (year === 2010 || year === 2015) {
//     console.log(year);
//     console.log(prefecture);
//     console.log(popu);
//   }
// });

// ③データの計算をしてみよう（都道府県ごとに変化率を計算）
// 集計データは、2010年の人口の合計と2015年の人口の合計と計算された2015年の2010年に対する変化率
'use strict';
const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
rl.on('line', (lineString) => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    //連想配列 prefectureDataMap からデータを取得
    let value = prefectureDataMap.get(prefecture);
    if (!value) {//value の値が Falsy の場合に、value に初期値となるオブジェクトを代入
      value = {
        popu10: 0,//popu10 が 2010 年の人口
        popu15: 0,//popu15が 2015 年の人口
        change: null //change が人口の変化率 初期値では null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    // 人口のデータを連想配列に保存
    prefectureDataMap.set(prefecture, value);
  }
});
//'close' イベントは、全ての行を読み込み終わった際に呼び出されます
rl.on('close', () => {
  // console.log(prefectureDataMap);

  // ③-1:都道府県ごとの変化率を計算
  // for-of 構文。Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができます。
  // 分割代入という方法も使用して、 let [変数名1, 変数名2] のように変数と一緒に配列を宣言することで、第一要素の key という変数にキーを、第二要素の value という変数に値を代入することができます
  for (let [key, value] of prefectureDataMap) { 
    // 集計データのオブジェクト value の change プロパティに、変化率を代入するコード
    value.change = value.popu15 / value.popu10;
  }
  // console.log(prefectureDataMap);

  // ④データの並び替え
    //Array.from(prefectureDataMap) の部分で、連想配列を普通の配列に変換する処理
    //更に、Array の sort 関数を呼んで無名関数を渡しています。sort に対して渡すこの関数は比較関数。
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    //前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
    // pair2 を pair1 より前にしたいときは、正の整数、
    // pair1 と pair2 の並びをそのままにしたいときは、 0 を返す必要があります
    // return pair2[1].change - pair1[1].change;
    return pair1[1].change - pair2[1].change;
  });
  console.log(rankingArray);
  const rankingStrings = rankingArray.map(([key, value], i) => {
    return i+1 + '位' + key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
  });
  console.log(rankingStrings);
});

