import React from 'react'
// import { doc, onSnapshot } from "firebase/firestore";

export default function Game(props) {
    const { lobbyId, leaveLobby, players, playerName } = props;

    return (
        <div>
            <h1>Game: {playerName}</h1>
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
                <ul>
                    {players.map((player) => {
                        return <li key={player.name}>{player.name}</li>
                    })}
                </ul>
            </div>
        </div>
    )
}
