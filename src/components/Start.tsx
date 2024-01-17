import { useState } from "react"
import { db } from "../firebase"
import { doc, updateDoc, getDoc, collection, addDoc} from "firebase/firestore"

type GameInfo = {
  cards: Record<number, number>,
  gameScene: string,
  population: number,
  roomIndex:number,
  status: string,
  theme: string,
}

function Start({ userName, setUserName, roomPopulationList, roomStatusList, setIsHost, setRoomIndex, setScene, setPlayerID} : { userName:string, setUserName:any, roomPopulationList: number[], roomStatusList: string[], setIsHost:any, setRoomIndex: any, setScene: any, setPlayerID: any}) {
  const roomArray: number[] = [0, 1, 2, 3, 4, 5]
  const [isClick, setIsClick] = useState<boolean>(false)

  // 入室
  const EnterRoom = async(index:number ) => {
    // GameInfoCol/room${index}Docの変更
    const roomDocumentRef = doc(db, "GameInfoCol", `room${index}Doc`)
    const roomSnapshot =  await getDoc(roomDocumentRef)
    const roomData = roomSnapshot.data() as GameInfo
    await updateDoc(roomDocumentRef, {
      population: Math.min(roomData.population + 1, 10),
      status:  roomData.population>=9 ? "full" : "recruit",
    })
    
    // Room${index}Colにプレイヤーを追加
    const RoomCol = collection(db, `Room${index}Col`)
    const playerDoc = await addDoc(RoomCol, {
      isHost: roomData.population == 0,
      isReady: false,
      playerName: userName,
      time: Date.now(),
      playerIndex: -1,
    })

    // Stateの変更
    if(roomData.population == 0) { 
      setIsHost(true)
    } else {
      setIsHost(false)
    }
    setPlayerID(playerDoc.id)
    setScene("ready")
    setRoomIndex(index)
  }

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleButtonClick = (index: number) => {
    setIsClick(true)
    if (
      roomPopulationList[index] <= 9 &&
      userName !== "" &&
      (roomStatusList[index] === "free" || roomStatusList[index] === "recruit") &&
      !isButtonDisabled
      ) {
        setIsButtonDisabled(true);
        setIsClick(false)

      EnterRoom(index);

      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 1000);
    }
  };

  return (
    <div className="w-[350px] mx-auto translate-y-[30px]">
      <ul className="border-black  h-[300px] border-[1px] flex flex-wrap justify-around p-4 gap-4 overflow-y-scroll mb-8">
        {roomArray.map((index: number) => (
          <li key={index} 
            className={`w-[140px] shadow-lg p-2 rounded-lg cursor-pointer transition-all ${
              roomStatusList[index] === "free" ? "bg-blue-200 hover:bg-blue-400"
            : roomStatusList[index] === "recruit" ? "bg-green-200 hover:bg-green-400"
            : roomStatusList[index] === "full" ? "bg-red-200"
            : "bg-yellow-200"
          }`}
            // 入室の処理(10人に達するまで/ゲーム中以外は入室できる)
            // 名前を書くことが必須
            onClick={() => handleButtonClick(index)}
          >
            <p className="font-bold border-black border-b-[1px] mb-2">ルーム {index + 1}</p>
            <p>ステータス: 
              <span>
                {
                roomStatusList[index] === "free" ? "空室"
                : roomStatusList[index] === "recruit" ? "募集中"
                : roomStatusList[index] === "full" ? "満室"
                : "ゲーム中"
                }
              </span>
            </p>
            <p>人数: {roomPopulationList[index]} / 10</p>
          </li>
        ))}
      </ul>
      <div className="w-max mx-auto">
        <p className="mb-2">名前を入力してください(10文字以内)  <span className="text-red-700 text-xs font-bold">必須</span></p>
        <input type="text" placeholder="名前" maxLength={10}  className="border-black border-b-[1px] focus:border-purple-700 focus:outline-0 focus:border-b-2" 
        value={userName}
        onChange={(e) => setUserName(e.target.value)}/>
        { isClick && <p className="text-xs text-red-700 mt-2">名前を入力してください</p>}
      </div>
    </div>
  )
}

export default Start