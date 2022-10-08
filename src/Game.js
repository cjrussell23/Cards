import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from "firebase/firestore";
import Nav from './Nav';
import './modal.css';

// This is the main component for the game
// Rendered when the user is in a lobby
export default function Game(props) {
    const { lobbyId, leaveLobby, players, user, readyPlayer, firestore, signOutUser } = props;

    const [gameLeader, setGameLeader] = useState("");
    const [gameState, setGameState] = useState([]);

    useEffect(() => {
        getGameLeader();
    }, []);

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

    useEffect(() => {
        if (gameLeader.email === user.email) {
            // User is the game leader
            if (gameState === "GAME") {
                // Start the game
                console.log("Starting the game");
                dealCards();
            }
        }
    }, [gameState]);

    async function getGameLeader() {
        await getDoc(doc(firestore, "lobbies", lobbyId)).then((doc) => {
            if (doc.exists()) {
                setGameLeader(doc.data().gameLeader);
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    function dealCards() {
        const deck = createDeck();
        const shuffledDeck = shuffle(deck);
        players.forEach((player) => {
            const hand = shuffledDeck.splice(0, 5);
            console.log(deck);
            setDoc(doc(firestore, "lobbies", lobbyId, "players", player.email), {
                hand: hand
            }, { merge: true });
        }
        )
    }

    function createDeck() {
        const SUITS = ["♠", "♥", "♦", "♣"];
        const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const DECK = [];
        for (let i = 0; i < SUITS.length; i++) {
            for (let j = 0; j < RANKS.length; j++) {
                DECK.push(RANKS[j] + SUITS[i]);
            }
        }
        return DECK;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function toggleModal() {
        const display = document.getElementById("modal").style.display;
        document.getElementById("modal").style.display = display === "none" ? "block" : "none";
    }

    return (
        <>
            <Nav user={user} signOutUser={signOutUser} leaveLobby={leaveLobby} brand={`${gameLeader.name}'s Game`} toggleModal={toggleModal} />
            <div id='modal'>
                <div id='modal-content'>
                    <div id='modal-header'>
                        <h3>{gameLeader.name}'s Game</h3>
                        <button className='btn btn-close' onClick={toggleModal}></button>
                    </div>
                    <div>
                        <p>Your Lobby ID is: {lobbyId}</p>
                        <p>Give this to your friends so they can join your lobby!</p>
                    </div>
                </div>
            </div>
            <main>
                {gameState === "LOBBY" ?
                    <div>
                        <ul className='list-group list-group-horizontal'>
                            {players.map((player) => {
                                return <li key={player.email}>
                                    <div className='card'>
                                        <img src={player.image} alt={`${player.name} profile`} className="rounded-circle" height="50px" width="50px" referrerPolicy="no-referrer"></img>
                                        <div className='card-body'>
                                            <h5 className='card-title'>{player.name}</h5>
                                            {user.email === player.email ?
                                                <div>
                                                    <button onClick={() => { readyPlayer(player.ready) }}>{player.ready ? "Ready" : "Not Ready"}</button>
                                                    <p>{player?.hand}</p>
                                                </div>
                                                :
                                                <div>
                                                    <p className='card-text'>{player.ready ? "Ready" : "Not Ready"}</p>
                                                    <p>{player?.hand?.length}</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </li>
                            })}
                        </ul>
                    </div>
                    :
                    <div>
                        game started
                    </div>
                }
            </main>
        </>
    )
}
