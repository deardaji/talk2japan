import { Card, Scene } from "@/lib/types";

const now = new Date().toISOString();

export const scenes: Scene[] = [
  { id: "restaurant", name: "餐厅点餐", icon: "食", description: "点餐、推荐、结账时最常用的表达。" },
  { id: "cafe", name: "咖啡店", icon: "咖", description: "适合快速下单和堂食外带。" },
  { id: "convenience", name: "便利店", icon: "便", description: "微波、结账、袋子等高频需求。" },
  { id: "directions", name: "问路", icon: "路", description: "找地点、确认方向和距离。" },
  { id: "train", name: "电车/地铁", icon: "车", description: "确认站点、路线和换乘。" },
  { id: "hotel", name: "酒店入住", icon: "宿", description: "入住、寄存、延迟退房等实用句。" },
  { id: "shopping", name: "购物", icon: "购", description: "试穿、库存、免税时会说的话。" },
  { id: "drugstore", name: "药妆店", icon: "药", description: "找商品、询问功效和结账。" },
  { id: "airport", name: "机场", icon: "空", description: "值机、行李和出入境常用语。" },
  { id: "onsen", name: "温泉/旅馆", icon: "汤", description: "确认时间、设施与馆内规则。" }
];

function card(
  id: string,
  scene: string,
  japanese: string,
  kana: string,
  romaji: string,
  chinese: string
): Card {
  return {
    id,
    japanese,
    kana,
    romaji,
    chinese,
    scene,
    difficulty: 2,
    sourceType: "system",
    isFavorite: false,
    masteryLevel: 0,
    reviewCount: 0,
    nextReviewAt: now,
    createdAt: now,
    inReview: true
  };
}

export const systemCards: Card[] = [
  card("restaurant-1", "restaurant", "すみません、注文いいですか。", "すみません、ちゅうもんいいですか。", "Sumimasen, chumon ii desu ka.", "不好意思，现在可以点餐吗？"),
  card("restaurant-2", "restaurant", "これをお願いします。", "これをおねがいします。", "Kore o onegaishimasu.", "请给我这个。"),
  card("restaurant-3", "restaurant", "おすすめは何ですか。", "おすすめはなんですか。", "Osusume wa nan desu ka.", "有什么推荐吗？"),
  card("restaurant-4", "restaurant", "お会計お願いします。", "おかいけいおねがいします。", "Okaikei onegaishimasu.", "请结账。"),
  card("restaurant-5", "restaurant", "水をもう一杯ください。", "みずをもういっぱいください。", "Mizu o mo ippai kudasai.", "请再给我一杯水。"),
  card("restaurant-6", "restaurant", "辛くしないでください。", "からくしないでください。", "Karaku shinai de kudasai.", "请不要做太辣。"),

  card("cafe-1", "cafe", "ここで食べます。", "ここでたべます。", "Koko de tabemasu.", "我在这里吃。"),
  card("cafe-2", "cafe", "持ち帰りでお願いします。", "もちかえりでおねがいします。", "Mochikaeri de onegaishimasu.", "打包带走。"),
  card("cafe-3", "cafe", "アイスラテを一つください。", "あいすらてをひとつください。", "Aisu rate o hitotsu kudasai.", "请给我一杯冰拿铁。"),
  card("cafe-4", "cafe", "甘さは控えめでお願いします。", "あまさはひかえめでおねがいします。", "Amasa wa hikaeme de onegaishimasu.", "请少糖一点。"),
  card("cafe-5", "cafe", "電源のある席はありますか。", "でんげんのあるせきはありますか。", "Dengen no aru seki wa arimasu ka.", "有带插座的座位吗？"),
  card("cafe-6", "cafe", "あとで受け取ればいいですか。", "あとでうけとればいいですか。", "Ato de uketoreba ii desu ka.", "我等会儿来取可以吗？"),

  card("convenience-1", "convenience", "袋はいりません。", "ふくろはいりません。", "Fukuro wa irimasen.", "不用袋子。"),
  card("convenience-2", "convenience", "温めてもらえますか。", "あたためてもらえますか。", "Atatamete moraemasu ka.", "可以帮我加热吗？"),
  card("convenience-3", "convenience", "このまま食べられますか。", "このままたべられますか。", "Kono mama taberaremasu ka.", "这个可以直接吃吗？"),
  card("convenience-4", "convenience", "スプーンをください。", "すぷーんをください。", "Supun o kudasai.", "请给我一个勺子。"),
  card("convenience-5", "convenience", "チャージできますか。", "ちゃーじできますか。", "Chaji dekimasu ka.", "可以充值吗？"),
  card("convenience-6", "convenience", "ATMはどこですか。", "えーてぃーえむはどこですか。", "Et emu wa doko desu ka.", "ATM 在哪里？"),

  card("directions-1", "directions", "〇〇駅はどこですか。", "〇〇えきはどこですか。", "Maru maru eki wa doko desu ka.", "请问〇〇站在哪里？"),
  card("directions-2", "directions", "この近くですか。", "このちかくですか。", "Kono chikaku desu ka.", "在这附近吗？"),
  card("directions-3", "directions", "歩いて何分ですか。", "あるいてなんぷんですか。", "Aruite nanpun desu ka.", "走路大概要几分钟？"),
  card("directions-4", "directions", "地図で見せてもらえますか。", "ちずでみせてもらえますか。", "Chizu de misete moraemasu ka.", "可以在地图上指给我看吗？"),
  card("directions-5", "directions", "反対側ですか。", "はんたいがわですか。", "Hantaigawa desu ka.", "是在对面那边吗？"),
  card("directions-6", "directions", "道に迷いました。", "みちにまよいました。", "Michi ni mayoimashita.", "我迷路了。"),

  card("train-1", "train", "この電車は渋谷に行きますか。", "このでんしゃはしぶやにいきますか。", "Kono densha wa Shibuya ni ikimasu ka.", "这班电车去涩谷吗？"),
  card("train-2", "train", "次は何駅ですか。", "つぎはなんえきですか。", "Tsugi wa nan-eki desu ka.", "下一站是哪一站？"),
  card("train-3", "train", "どこで乗り換えますか。", "どこでのりかえますか。", "Doko de norikaemasu ka.", "要在哪里换乘？"),
  card("train-4", "train", "急行は止まりますか。", "きゅうこうはとまりますか。", "Kyuko wa tomarimasu ka.", "急行会停吗？"),
  card("train-5", "train", "ICカードで入れますか。", "あいしーかーどではいれますか。", "Aishi kado de hairemasu ka.", "可以刷交通卡进站吗？"),
  card("train-6", "train", "出口はどちらですか。", "でぐちはどちらですか。", "Deguchi wa dochira desu ka.", "出口在哪边？"),

  card("hotel-1", "hotel", "チェックインお願いします。", "ちぇっくいんおねがいします。", "Chekkuin onegaishimasu.", "我要办理入住。"),
  card("hotel-2", "hotel", "予約しています。", "よやくしています。", "Yoyaku shiteimasu.", "我有预约。"),
  card("hotel-3", "hotel", "荷物を預けてもいいですか。", "にもつをあずけてもいいですか。", "Nimotsu o azukete mo ii desu ka.", "可以寄存行李吗？"),
  card("hotel-4", "hotel", "朝食は何時からですか。", "ちょうしょくはなんじからですか。", "Choshoku wa nanji kara desu ka.", "早餐几点开始？"),
  card("hotel-5", "hotel", "チェックアウトを少し遅らせられますか。", "ちぇっくあうとをすこしおくらせられますか。", "Chekkuauto o sukoshi okuraserarimasu ka.", "可以稍微晚一点退房吗？"),
  card("hotel-6", "hotel", "Wi-Fiのパスワードを教えてください。", "わいふぁいのぱすわーどをおしえてください。", "Waifai no pasuwado o oshiete kudasai.", "请告诉我 Wi-Fi 密码。"),

  card("shopping-1", "shopping", "免税できますか。", "めんぜいできますか。", "Menzei dekimasu ka.", "可以免税吗？"),
  card("shopping-2", "shopping", "試着してもいいですか。", "しちゃくしてもいいですか。", "Shichaku shite mo ii desu ka.", "可以试穿吗？"),
  card("shopping-3", "shopping", "別のサイズはありますか。", "べつのさいずはありますか。", "Betsu no saizu wa arimasu ka.", "有别的尺码吗？"),
  card("shopping-4", "shopping", "これの黒はありますか。", "これのくろはありますか。", "Kore no kuro wa arimasu ka.", "这款有黑色吗？"),
  card("shopping-5", "shopping", "カードは使えますか。", "かーどはつかえますか。", "Kado wa tsukaemasu ka.", "可以刷卡吗？"),
  card("shopping-6", "shopping", "包装してもらえますか。", "ほうそうしてもらえますか。", "Hoso shite moraemasu ka.", "可以帮我包装吗？"),

  card("drugstore-1", "drugstore", "のどに効く薬はありますか。", "のどにきくくすりはありますか。", "Nodo ni kiku kusuri wa arimasu ka.", "有治喉咙不舒服的药吗？"),
  card("drugstore-2", "drugstore", "肌にやさしいですか。", "はだにやさしいですか。", "Hada ni yasashii desu ka.", "这个对皮肤温和吗？"),
  card("drugstore-3", "drugstore", "人気の商品はどれですか。", "にんきのしょうひんはどれですか。", "Ninki no shohin wa dore desu ka.", "热门商品是哪一个？"),
  card("drugstore-4", "drugstore", "敏感肌でも使えますか。", "びんかんはだでもつかえますか。", "Binkan hada demo tsukaemasu ka.", "敏感肌也能用吗？"),
  card("drugstore-5", "drugstore", "テスターはありますか。", "てすたーはありますか。", "Tesuta wa arimasu ka.", "有试用装吗？"),
  card("drugstore-6", "drugstore", "一番小さいサイズをください。", "いちばんちいさいさいずをください。", "Ichiban chiisai saizu o kudasai.", "请给我最小规格。"),

  card("airport-1", "airport", "チェックインカウンターはどこですか。", "ちぇっくいんかうんたーはどこですか。", "Chekkuin kaunta wa doko desu ka.", "值机柜台在哪里？"),
  card("airport-2", "airport", "荷物を預けたいです。", "にもつをあずけたいです。", "Nimotsu o azuketai desu.", "我想托运行李。"),
  card("airport-3", "airport", "搭乗口は何番ですか。", "とうじょうぐちはなんばんですか。", "Tojoguchi wa nanban desu ka.", "登机口是几号？"),
  card("airport-4", "airport", "この荷物は機内に持ち込めますか。", "このにもつはきないにもちこめますか。", "Kono nimotsu wa kinai ni mochikomemasu ka.", "这个行李可以带上飞机吗？"),
  card("airport-5", "airport", "出国審査はどちらですか。", "しゅっこくしんさはどちらですか。", "Shukkoku shinsa wa dochira desu ka.", "出境审查在哪里？"),
  card("airport-6", "airport", "搭乗が始まりましたか。", "とうじょうがはじまりましたか。", "Tojo ga hajimarimashita ka.", "开始登机了吗？"),

  card("onsen-1", "onsen", "大浴場は何時までですか。", "だいよくじょうはなんじまでですか。", "Daiyokujou wa nanji made desu ka.", "大浴场开到几点？"),
  card("onsen-2", "onsen", "タオルは部屋にありますか。", "たおるはへやにありますか。", "Taoru wa heya ni arimasu ka.", "毛巾在房间里吗？"),
  card("onsen-3", "onsen", "貸切風呂を予約できますか。", "かしきりぶろをよやくできますか。", "Kashikiri buro o yoyaku dekimasu ka.", "可以预约包场浴池吗？"),
  card("onsen-4", "onsen", "夕食は何時からですか。", "ゆうしょくはなんじからですか。", "Yushoku wa nanji kara desu ka.", "晚餐几点开始？"),
  card("onsen-5", "onsen", "浴衣のサイズを変えられますか。", "ゆかたのさいずをかえられますか。", "Yukata no saizu o kaeraremasu ka.", "可以换浴衣尺寸吗？"),
  card("onsen-6", "onsen", "入れ墨があっても大丈夫ですか。", "いれずみがあってもだいじょうぶですか。", "Irezumi ga atte mo daijobu desu ka.", "有纹身也可以进去吗？")
];
