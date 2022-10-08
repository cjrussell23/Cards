import React, { useEffect, useState } from 'react'
import { doc, setDoc } from "firebase/firestore";
// import { doc, onSnapshot } from "firebase/firestore";

export default function Game(props) {
    const { lobbyId, leaveLobby, players, user, readyPlayer, firestore } = props;
    // Check if all players are ready
    const [gameState, setGameState] = useState([]);
	
    useEffect(() => {
		let allReady = true;
		if (players.length > 1) {
			players.forEach((player) => {
				if (!player.ready) {
					allReady = false;
				}
			})
			// If all players are ready, start the game
			if (allReady) {
				setGameState("GAME");
			}
			else {
				setGameState("LOBBY");
			}
		}
	}, [players]);

    return (
        <div>
            <h2>Your lobby ID is: {lobbyId}</h2>
            <p>Give this to your friends so they can join!</p>
            <form>
                <button type="submit" onClick={(e) => {
                    e.preventDefault();
                    leaveLobby();
                }}>Leave</button>
            </form>
            <div>
                <h2>Players</h2>
                <ul className='list-group list-group-horizontal'>
                    {players.map((player) => {
                        return <li key={player.email}>
                            <div className='card'>
                                <img src={player.image} alt={`${player.name} profile`} className="rounded-circle" height="50px" width="50px" referrerPolicy="no-referrer"></img>
                                <div className='card-body'>
                                    <h5 className='card-title'>{player.name}</h5>
                                    {user.email === player.email ? <button onClick={ () => {readyPlayer(player.ready)} }>{player.ready ? "Ready" : "Not Ready"}</button> : <p className='card-text'>{player.ready ? "Ready" : "Not Ready"}</p>}
                                </div>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
        </div>
    )
}
