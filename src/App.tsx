import "./App.css"

// コンポーネントのimport
import Header from "./components/Header"
import Start from "./components/Start"
import Ready from "./components/Ready"
import Setting from "./components/game/Setting"
import Ito from "./components/game/Ito"
import Footer from "./components/Footer"

// 変数・関数のimport 
import { useEffect, useState } from "react"
import { db } from "./firebase"
import { collection, onSnapshot, query, orderBy, doc} from "firebase/firestore";

type GameInfo = {
  cards: Record<number, number>,
  gameScene: string,
  population: number,
  roomIndex:number,
  status: string,
  theme: string,
}

type Player = {
  isHost: boolean,
  isReady: boolean,
  playerName: string,
  time: number,
  playerIndex: number,
}

function App() {
  // シーン
  const [scene, setScene] = useState<string>("start")
  // ユーザーネーム
  const [userName, setUserName] = useState<string>("")
  // 各ルームに入っている人数
  const [roomPopulationList, setRoomPopulationList] = useState<number[]>([0, 0, 0, 0, 0, 0])
  // 各ルームのステータス
  const [roomStatusList, setRoomStatusList] = useState<string[]>(["free", "free", "free", "free", "free", "free"])
  // 入るルーム
  const [roomIndex, setRoomIndex] = useState<number>(-1)
  // ホストであるか
  const [isHost, setIsHost] = useState<boolean>(false)
  // プレイヤー番号
  const [playerID, setPlayerID] = useState<string>("")
  // 同じ部屋のプレイヤー
  const [players, setPlayers] = useState<Player[]>([])
  // 全員準備ができて開始できるか(逆になっているため注意)
  const [isStartalbe, setIsStartalbe] = useState<boolean>(true)
  // 全員のカード
  const [cards, setCards] = useState<Record<number, number>>({})
  // 自分のカード
  const [myCards, setMyCards] = useState<number>(-1)
  // お題
  const [theme, setTheme] = useState<string>("")

  // リアルタイムでデータベースをチェックする
  useEffect(() => {
    // GameInfoColの監視
    const gameInfoColRef = collection(db, "GameInfoCol")
    onSnapshot(gameInfoColRef, (snapshot) =>{
      const gameInfos: GameInfo[] = snapshot.docs.map((doc) => doc.data() as GameInfo)
      const newRoomPopulationList: number[] = [0, 0, 0, 0, 0, 0]
      const newRoomStatusList: string[] = ["free", "free", "free", "free", "free", "free"]

      gameInfos.forEach((gameInfo) => {
        newRoomPopulationList[gameInfo.roomIndex] = gameInfo.population
        newRoomStatusList[gameInfo.roomIndex] = gameInfo.status
      })

      setRoomPopulationList(newRoomPopulationList)
      setRoomStatusList(newRoomStatusList)

    })

    // GameInfoCol/room${index}Docの監視
    const GameInfoDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`);
    onSnapshot(GameInfoDocumentRef, (snapshot) => {
      const gameInfo = snapshot.data() as GameInfo;
      if (gameInfo && gameInfo.theme) {
        setTheme(gameInfo.theme)
      }
      if (gameInfo && gameInfo.gameScene) {
        if (gameInfo.gameScene === "setting") {
          setScene("setting");
        } else if (gameInfo.gameScene === "ito") {
          setScene("ito");
        }
        setCards(gameInfo.cards)
      }
    });

    if(roomIndex >= 0) {
      // Room${roomIndex}Colの監視
      const roomCol = collection(db, `Room${roomIndex}Col`)
      const q = query(roomCol, orderBy('time', 'asc'));
      onSnapshot(q, (snapshot) => {
        let count = 0;
        setIsStartalbe(true)
        const playerData =  snapshot.docs.map((doc) => doc.data()) as Player[]
        setPlayers(playerData)
        playerData.forEach((player) =>{
          if(player.isReady == true){
            count += 1
          }
        })

        if(playerData.length >= 2 && playerData.length == count){
          setIsStartalbe(false)
        } else {
          setIsStartalbe(true)
        }

        if(playerData.length == 0){
          setIsHost(false)
          setRoomIndex(-1)
          setScene("start")
          setTheme("")
        }
      })

      // Room${roomIndex}Col/playerIDの監視
      const playerDoc = doc(db, `Room${roomIndex}Col`, playerID)

      onSnapshot(playerDoc, (snapshot) => {
        const playerData = snapshot.data() as Player
        if(playerData){
          const playerIndex = playerData.playerIndex;
          if (playerData.playerIndex) {
            setMyCards(cards[playerIndex])
          }
        }
      })
    }
  }, [scene])

  return (
    <>
      <Header />
      <div className="h-[600px]">
      <main className="w-[500px] h-[500px] my-[40px] outline outline-2 bg-white absolute left-[50%] translate-x-[-50%]">
        {scene === "start" && <Start userName={userName} setUserName={setUserName} roomPopulationList={roomPopulationList} roomStatusList={roomStatusList} setIsHost={setIsHost} setRoomIndex={setRoomIndex} setScene={setScene} setPlayerID={setPlayerID} />}
        {scene === "ready" && <Ready roomIndex={roomIndex} setRoomIndex={setRoomIndex} setScene={setScene} userName={userName} playerID={playerID} players={players} isHost={isHost} setIsHost={setIsHost} isStartalbe={isStartalbe}/>}
        {scene === "setting" && <Setting isHost={isHost} roomIndex={roomIndex} setScene={setScene} theme={theme} setTheme={setTheme}/>}
        {scene === "ito" && <Ito myCards={myCards} theme={theme} roomIndex={roomIndex} userName={userName} players={players}/>}
      </main>

      </div>
      <Footer />
    </>
  )
}

export default App
