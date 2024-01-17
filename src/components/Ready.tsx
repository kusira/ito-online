import { db } from "../firebase"
import { doc, updateDoc, getDoc, deleteDoc, collection, getDocs } from "firebase/firestore"
import Button from '@mui/material/Button';
import { useState } from "react";

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

function Ready( { roomIndex, setRoomIndex, setScene, userName, playerID, players, isHost, setIsHost, isStartalbe} : { roomIndex: number, setRoomIndex: any, setScene: any, userName: string, playerID: string, players: Player[], isHost: boolean, setIsHost: any, isStartalbe: boolean }) {
  const [isReady, setIsReady] = useState<boolean>(false)

  // 強制終了
  const gameEnd = async() => {
    // GameInfoCol/room${roomIndex}Docの変更
    const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
    const roomDoc = await getDoc(roomDocumentRef);
    if (roomDoc.exists()) {
      await updateDoc(roomDocumentRef, {
        population: 0,
        status: "free",
        gameScene: "still",
        theme: "",
      })
    }

    // プレイヤーの全削除
    const playerColRef = collection(db, `Room${roomIndex}Col`);
    const querySnapshot = await getDocs(playerColRef);
    
    querySnapshot.docs.map(async (docSnapshot) => {
      const playerDocRef = doc(playerColRef, docSnapshot.id);
      const playerDoc = await getDoc(playerDocRef);
    
      if (playerDoc.exists()) {
        await deleteDoc(playerDocRef);
      }
    });
  }

  // 退出
  const exitRoom = async() => {
     // GameInfoCol/room${index}Docの変更
    const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
    const roomSnapshot =  await getDoc(roomDocumentRef)
    const roomData = roomSnapshot.data() as GameInfo

    await updateDoc(roomDocumentRef, {
      population: Math.max(roomData.population - 1, 0),
      status:  roomData.population<=1 ? "free" : "recruit"
    })
    
    // Room${roomIndex}Colからプレイヤーを削除
    const PlayerDocRef = doc(db, `Room${roomIndex}Col`, playerID);
    await deleteDoc(PlayerDocRef);
    
    // Stateの変更
    setIsHost(false)
    setRoomIndex(-1)
    setScene("start")

    // ホストが抜けると強制終了
    // if(isHost) {
    //   gameEnd()
    // }
  }

  // 準備OK/取り消し
  const Ready = async() => {
    const playerDocRef = doc(db, `Room${roomIndex}Col`, playerID);
    const playerSnapshot =  await getDoc(playerDocRef)
    const playerData = playerSnapshot.data() as Player
    await updateDoc(playerDocRef, {
      isReady: !playerData.isReady,
    })
  }

  // ゲームスタート
  const gameStart = async() => {
    // プレイヤー全員に番号をつける
    if(isHost) {
      const playerColRef = collection(db, `Room${roomIndex}Col`);
      const querySnapshot = await getDocs(playerColRef);
      
      let i = 1;
      for (const docSnapshot of querySnapshot.docs) {
        const playerDocRef = doc(playerColRef, docSnapshot.id);
      
        await updateDoc(playerDocRef, {
          playerIndex: i,
        });
        i += 1;

      }
    }

    // 遷移命令をdbに送る
    const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
    await updateDoc(roomDocumentRef, {
      gameScene: "setting",
      status: "game",
    })
    setScene("setting")
  }

  return (
    <div>
      <div className="w-[300px] mx-auto py-12">
        <Button variant="contained" color="error" onClick={() => { exitRoom() }}>↩退出する</Button>
        <div className="flex justify-between mt-8">
          <p>ルーム{roomIndex + 1} </p>
          <p>{players.length} / 10</p>
        </div>
        <ul className="border-black  h-[200px] border-[1px] flex flex-wrap justify-around p-4 gap-4 overflow-y-scroll mb-8">
          {
            players.map((player, index) => (
              <li key={index} className="display-block w-full">
                <p className="font-bold border-black border-b-[1px] mb-2">プレイヤー {index + 1}</p>
                <div className="flex justify-between">
                <p>{player.playerName}{player.isHost && "👑"}</p>
                <p className="text-green-700 mr-10">{player.isReady && "✔"}</p>
                </div>
              </li>
            ))
          }
        </ul>
        <p>「{userName}」でプレイしています</p>
        <div className="flex w-[300px] mx-auto justify-around my-6">
          <Button variant="contained" color="secondary" size="large" onClick={() => {Ready(); setIsReady(!isReady)} }>{isReady ? "取り消す" : "準備OK"}</Button>
          {isHost && <Button variant="contained" color="primary" size="large" onClick={() => gameStart() } disabled={ isStartalbe }>開始</Button>}
        </div>
      </div>
    </div>
  )
}

export default Ready