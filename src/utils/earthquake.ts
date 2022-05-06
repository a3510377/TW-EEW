// 原: https://github.com/ExpTechTW/TW-EEW

import fs from "fs";

let time = 0;

const main = async (data, config, client, channel) => {
  if (time == data.Time) return;
  time = data.Time;
  let Cache = [];
  let location = JSON.parse(
    fs.readFileSync("../data/location.json").toString()
  );
  const count = async () => {
    let max = false;
    let msg = "";
    for (let Index = 0; Index < location.length; Index++) {
      for (
        let index = 0;
        index < location[Index]["districts"].length;
        index++
      ) {
        let point = Math.sqrt(
          Math.pow(
            Math.abs(
              location[Index]["districts"][index]["NorthLatitude"] +
                Number(data.NorthLatitude) * -1
            ) * 111,
            2
          ) +
            Math.pow(
              Math.abs(
                location[Index]["districts"][index]["EastLongitude"] +
                  Number(data.EastLongitude) * -1
              ) * 101,
              2
            )
        );
        let distance = Math.sqrt(
          Math.pow(Number(data.Depth), 2) + Math.pow(point, 2)
        );
        let time = Math.round(
          (distance - ((new Date().getTime() - data.Time) / 1000) * 3.5) / 3.5
        );

        let level = "0";
        let PGA = +(
          1.657 *
          Math.pow(Math.E, 1.533 * data.Scale) *
          Math.pow(distance, -1.607)
        ).toFixed(3);

        if (PGA >= 800) level = "7";
        else if (800 >= PGA && 440 < PGA) level = "6+";
        else if (440 >= PGA && 250 < PGA) level = "6-";
        else if (250 >= PGA && 140 < PGA) level = "5+";
        else if (140 >= PGA && 80 < PGA) level = "5-";
        else if (80 >= PGA && 25 < PGA) level = "4";
        else if (25 >= PGA && 8 < PGA) level = "3";
        else if (8 >= PGA && 2.5 < PGA) level = "2";
        else if (2.5 >= PGA && 0.8 < PGA) level = "1";

        Cache.push({
          name:
            location[Index]["name"].replace("縣", "").replace("市", "") +
            " " +
            location[Index]["districts"][index]["name"],
          time,
          level,
          PGA,
        });
      }
    }
    let NewCache = [];
    for (let Index = 0; Index < Cache.length; Index++) {
      let PGACache = 0;
      let INDEX = 0;
      for (let index = 0; index < Cache.length; index++) {
        if (+Cache[index]["PGA"] > PGACache) {
          PGACache = Cache[index]["PGA"];
          INDEX = index;
        }
      }
      NewCache.push(Cache[INDEX]);
      Cache.splice(INDEX, 1);
    }
    for (let index = 0; index < NewCache.length; index++) {
      if (msg.length >= 1000) break;
      if (NewCache[index]["time"] > 0) {
        max = true;
        msg = `${msg}${NewCache[index].name} [剩餘 ${NewCache[index]["time"]} 秒] [規模: ${NewCache[index].level}] [PGA: ${NewCache[index]["PGA"]}]\n`;
      } else
        msg = `${msg}${NewCache[index].name} [已抵達] [規模: ${NewCache[index].level}] [PGA: ${NewCache[index].PGA}]\n;`;

      if (max) count();
    }
    count();
  };
};
