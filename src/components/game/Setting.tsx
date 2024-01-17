import { useEffect } from "react"
import { doc, updateDoc} from "firebase/firestore"
import { db } from "../../firebase"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Button } from "@mui/material";

function Setting({ isHost, roomIndex, setScene, theme, setTheme} : { isHost: boolean, roomIndex:number, setScene: any, theme: string, setTheme: any }) {

  const themeList: string[] = [
    "コンビニの商品の人気",
    "100円ショップの商品の人気",
    "飲食店の人気",
    "駅の人気",
    "中華料理の人気",
    "学校給食の人気",
    "有名人の人気",
    "子供に人気なもの",
    "アニメ・漫画のキャラの人気",
    "ゲームキャラの人気（モンスター含む）",
    "キャラクターの人気（ゆるキャラ含む）",
    "プレゼント・お土産の人気",
    "建物の人気",
    "住みたい国や場所の人気",
    "アプリ・ウェブサービスの人気",
    "乗り物の人気",
    "俳優の人気",
    "悪役の人気",
    "食べ物の人気",
    "飲み物の人気",
    "生き物の人気",
    "おもちゃの人気",
    "電化製品の人気",
    "映画の人気",
    "ミュージシャンの人気",
    "お菓子・スイーツ・アイスの人気",
    "ペットの人気",
    "職業の人気",
    "おにぎりの具の人気",
    "パンの種類の人気",
    "趣味の人気",
    "メーカー（ブランド）の人気",
    "アニメ・漫画の人気",
    "ゲームの人気",
    "和食料理の人気",
    "洋食料理の人気",
    "歴史上の人物の人気",
    "声優の人気",
    "童話の人気",
    "歌・曲の人気",
    "映画の登場人物の人気",
    "アスリートの人気",
    "スポーツの人気",
    "テレビ番組の人気",
    "恋人にしたい職業の人気",
    "デートスポットの人気",
    "ハネムーンで行きたい場所の人気",
    "酒のつまみ・居酒屋メニューの人気",
    "化粧品の人気",
    "ボードゲームの人気",
    "資格・免許の人気",
    "旅行したい国や場所の人気",
    "旅行先に持っていきたいもの",
    "ゾンビと戦うときに持っていきたいもの",
    "無人島に持っていきたいもの",
    "一人暮らしに必要なもの",
    "美しいもの",
    "こわいもの",
    "楽しいこと",
    "嬉しいこと",
    "カバンに入っていたら嬉しいもの",
    "言われて嬉しい言葉",
    "なりたい生き物",
    "なりたい歴史上の人物",
    "なりたい有名人",
    "なりたいキャラ（アニメ・漫画・ゲーム）",
    "生き物の大きさ",
    "学校にあるものの大きさ",
    "歴史上の人物の強さ",
    "映画の登場人物の強さ",
    "生き物の強さ",
    "アニメ・漫画のキャラの強さ",
    "ゲームキャラの強さ（モンスター含む）",
    "強そうな言葉",
    "強そうな効果音",
    "有名人の年収・資産",
    "重そうなもの",
    "ボードゲームの（物理的な）重さ",
    "食べ物のカロリー",
    "モテる条件・特技",
    "やわらかそうなもの",
    "カッコいいもの",
    "カッコいいセリフ",
    "カッコいい苗字・名前",
    "かわいいもの",
    "小学生が好きな言葉",
    "中高生が好きな言葉",
    "人生で大切なもの・こと",
    "雪山で遭難したときにもっていたいもの",
    "地球観光に来た宇宙人にあげたいお土産",
    "テンションが上がるもの・こと",
    "時代遅れの言葉",
    "オタクが喜ぶセリフ・設定",
    "グッとくる仕草・行動",
    "結婚したい有名人",
    "結婚したいキャラ（アニメ・漫画・ゲーム）",
    "親になってほしいキャラ（アニメ・漫画・ゲーム）",
    "ほしい特殊能力・武器（必殺技・道具）",
    "便利なもの",
    "されたいプロポーズ（セリフ・シチュエーション）"
  ];
  
  // お題のランダム生成
  const randomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themeList.length);
    setTheme(themeList[randomIndex]);
  }

  const addCards = async(cards: Record<number, number>) =>{
      // GameInfoCol/room${index}Docの変更
      const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
      await updateDoc(roomDocumentRef, {
        cards: cards
      })
  }

  // カードの生成
  useEffect(()=>{
    if(isHost){
      let array:number[] = Array.from({ length: 100 }, (_, index) => index + 1);

      for (let i = array.length; 1 < i; i--) {
        const k = Math.floor(Math.random() * i);
        [array[k], array[i - 1]] = [array[i - 1], array[k]];
      }

      let cards: Record<number, number> = {}
      for (let i = 0; i < 15; i++) {
        cards[i] = array[i]
      }

      addCards(cards)

    }
  },[])

  // スタート
  const itoStart = async() => {
    // 遷移命令をdbに送る
    const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
    await updateDoc(roomDocumentRef, {
      gameScene: "ito",
      theme: theme
    })
    setScene("ito")
  }
  return (

    <div>
      {isHost ?
        <div className="w-[300px] mx-auto">
          <div>
            <p className="text-xs pt-[100px] mb-2">※この画面はホストだけに表示されています</p>
            <p className="mb-4">お題を入力してください</p>
            <input type="text" placeholder="お題" className="border-black border-b-[1px] focus:border-purple-700 focus:outline-0 focus:border-b-2 w-[300px] mb-2" 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}/>
            <p className="text-sm mb-4">(例) コンビニの人気商品・言われて嬉しい言葉</p>
            <div className="bg-gray-200 border-black border-[1px] rounded-sm shadow-md p-1 w-max ml-[170px] cursor-pointer hover:bg-gray300 active:bg-gray-400 transition-all"
            onClick={() => randomTheme()}>ランダム生成</div>
          </div>
          <div className="w-[300px] ml-[150px] mt-[100px]">
            <Button variant="contained" color="primary" size="large" onClick={() => itoStart() }>ゲームスタート</Button>
          </div>
        </div>
        :
        <div>
          <p className="text-center text-xl leading-[36px] pt-[140px]">ホストが設定をしています。<br/>開始までお待ちください...</p>
          <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
          >
          <CircularProgress />
          </Box>
        </div>
      }
    </div>
  )
}

export default Setting