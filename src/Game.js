import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from "firebase/firestore";
import Nav from './Nav';
import Card from "react-free-playing-cards/lib/TcN.js"
// import Card from './Card';
import './lobbyInfo.css';

// This is the main component for the game
// Rendered when the user is in a lobby
export default function Game(props) {
    const { lobbyId, leaveLobby, players, user, readyPlayer, firestore, signOutUser, gameState } = props;

    // const [gameLeader, setGameLeader] = useState("");
    const [player, setPlayer] = useState("");
    const [opponents, setOpponents] = useState([]);
    const [gameLeader, setGameLeader] = useState("");

    useEffect(() => {
        // Game leader is set in the lobby/App component
        getGameLeader(); // This gets the leader from the database
        const lobbyIdButton = document.getElementById("lobbyIdButton");
        if (gameLeader.email === user.email) {
            lobbyIdButton.click();
        }
    }, []);

    useEffect(() => {
    }, [gameState]);

    useEffect(() => {
        setDBGamePhase(); // This sets the game phase in the database
        setOpponents(players.filter((player) => player.email !== user.email));
        setPlayer(players.filter((player) => player.email === user.email)[0]);
    }, [players]);


    // ONLY FOR GAME LEADER
    function setDBGamePhase() {
        if (user.email === gameLeader.email) {
            let allReady = true;
            if ((players.length > 1)) {
                players.forEach((player) => {
                    if (!player.ready) {
                        allReady = false;
                    }
                })
                // If all players are ready, start the game
                const lobbyRef = doc(firestore, "lobbies", lobbyId, "gameState", "gamePhase");
                if (allReady && gameState[2]?.phase === "lobby") {
                    // Write to db that the game is ready
                    setDoc(lobbyRef, {
                        phase: "game"
                    });
                    // Start the game by dealing the cards
                    dealCards();
                }
            }
        }
    }

    async function getGameLeader() {
        await getDoc(doc(firestore, "lobbies", lobbyId, "gameState", "gameLeader")).then((doc) => {
            if (doc.exists()) {
                setGameLeader(doc.data());
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    // Only the game leader can start the game
    function dealCards() {
        const deck = createDeck();
        const shuffledDeck = shuffle(deck);
        players.forEach((player) => {
            const hand = shuffledDeck.splice(0, 8);
            setDoc(doc(firestore, "lobbies", lobbyId, "players", player.email), {
                hand: hand
            }, { merge: true }); 
        }
        )
        // deal one card to the table
        const table = shuffledDeck.splice(0, 34);
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: shuffledDeck,
            discard: table,
        }, { merge: true }
        );
    }

    function createDeck() {
        const SUITS = ["s", "h", "d", "c"];
        const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
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

    function playCard(card) {
        const playerHand = player.hand;
        const discard = gameState[0]?.discard;
        const newHand = playerHand.filter((c) => c !== card);
        const newDiscard = [...discard, card];
        setDoc(doc(firestore, "lobbies", lobbyId, "players", user.email), {
            hand: newHand
        }, { merge: true });
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            discard: newDiscard
        }, { merge: true });
    }

    async function drawCard(){
        const deck = gameState[0]?.deck;
        const playerHand = player.hand;
        const newHand = [...playerHand, deck[0]];
        const newDeck = deck.splice(1);
        await setDoc(doc(firestore, "lobbies", lobbyId, "players", user.email), {
            hand: newHand
        }, { merge: true });
        await setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: newDeck
        }, { merge: true });
    }

    async function shuffleDeck(){
        // Get the discard pile
        const discard = gameState[0]?.discard;
        // Take the top card off the discard pile
        const topCard = discard.pop();
        const newDiscard = new Array();
        newDiscard.push(topCard);
        // Shuffle the discard pile
        const newDeck = shuffle(discard);
        // Set the new deck and discard pile
        await setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: newDeck,
            discard: newDiscard
        });
    }

    return (
        <>
            <Nav user={user} signOutUser={signOutUser} leaveLobby={leaveLobby} brand={`${gameLeader.name}'s Game`} lobbyId={lobbyId}/>
            <main id='main'>
                {gameState[2]?.phase === "lobby" &&
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
                                                </div>
                                                :
                                                <div>
                                                    <p className='card-text'>{player.ready ? "Ready" : "Not Ready"}</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </li>
                            })}
                        </ul>
                    </div>
                }
                {gameState[2]?.phase === "game" &&
                    <div >
                        {/* Opponents Hands */}
                        <div className='d-flex px-5 py-5 text-bg-primary'>
                            {opponents.map((opponent) => {
                                return <div key={opponent.email}>
                                    <div className='d-flex px-5 py-5 text-bg-secondary flex-shrink'>
                                        {opponent?.hand?.map((card) => {
                                            return <Card card={card} key={card} height="50px" back />
                                        })}
                                    </div>
                                </div>
                            })}
                        </div>
                        {/* Table */}
                        <div className='d-flex px-5 py-5 text-bg-light align-items-center justify-content-center'>
                            {gameState[0]?.deck.length > 0 && <button onClick={drawCard}><Card card={gameState[0]?.deck[0]} height="100px" back /></button>}
                            <button onClick={shuffleDeck}><Card card={gameState[0]?.discard[gameState[0]?.discard.length-1]} height="100px" /></button>
                        </div>
                        {/* Players Hand */}
                        <div className='d-flex px-5 py-5 text-bg-success'>
                            {player?.hand?.map((card) => {
                                return <button key={card} onClick={() => playCard(card)}><Card card={card} height="100px"/></button>
                            })}
                        </div>
                    </div>
                }
            </main>
        </>
    )
}
