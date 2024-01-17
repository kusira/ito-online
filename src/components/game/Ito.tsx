import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Button } from "@mui/material";

type Player = {
  isHost: boolean,
  isReady: boolean,
  playerName: string,
  time: number,
  playerIndex: number,
}

function Ito({ myCards, theme, roomIndex, userName, players } : { myCards: number, theme: string, roomIndex: number, userName: string, players: Player[] }) {
  // ゲーム終了
  const gameEnd = async() => {
    // GameInfoCol/room${roomIndex}Docの変更
    const roomDocumentRef = doc(db, "GameInfoCol", `room${roomIndex}Doc`)
    const roomDoc = await getDoc(roomDocumentRef);

    if (roomDoc.exists()) {
      await updateDoc(roomDocumentRef, {
        population: 0,
        status: "free",
        gameScene: "",
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

  
  return (
    <div>
      <div className="w-[300px] mx-auto pt-12">
        <p>テーマ</p>
        <p className="border-black border-b-2 text-2xl mb-12">{theme}</p>
        <div className=" w-[80px] h-[120px] mx-auto">
          <p>{ userName }</p>
          <p className="border-black border-[2px] w-[80px] h-[120px] leading-[120px] text-4xl font-bold text-center">{myCards}</p>
        </div>
        <div className="mt-[100px] ml-[-10px]">
          <Button variant="contained" color="error" onClick={() => { gameEnd() }}>ゲームを終了する</Button>
        </div>
        <div className="absolute right-0 bottom-0">
          <p>ユーザー</p>
          <ul className="w-[200px] h-[160px] p-4 border-black border-[1px] overflow-y-scroll">
            {
              players.map((player, index) => (
                <li key={index} className="">{player.playerName}</li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Ito