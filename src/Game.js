import React, { useEffect, useState, useRef } from 'react'
import { doc, getDoc, setDoc } from "firebase/firestore";
import Nav from './Nav';
import Card from "react-free-playing-cards/lib/TcN.js";

// This is the main component for the game
// Rendered when the user is in a lobby
export default function Game(props) {
    const { lobbyId, leaveLobby, players, user, readyPlayer, firestore, signOutUser, gameState } = props;

    // const [gameLeader, setGameLeader] = useState("");
    const [player, setPlayer] = useState("");
    const [opponents, setOpponents] = useState([]);
    const [gameLeader, setGameLeader] = useState("");
    var playersRef = useRef();
    var canPlayCard = useRef();
    var pickedUpCardThisTurn = useRef(false);

    useEffect(() => {
        canPlayCard.current = checkCanPlayCard();
    }, [gameState]);

    useEffect(() => {
        removeCardClassFromImgs();
    }, [gameState, players, opponents, gameLeader]);

    useEffect(() => {
        // Game leader is set in the lobby/App component
        getGameLeader(); // This gets the leader from the database
    }, []);

    useEffect(() => {
        if (gameLeader.uuid === user.uuid) {
            const lobbyIdButton = document.getElementById("lobbyIdButton");
            lobbyIdButton.click();
        }
    }, [gameLeader]);

    useEffect(() => {
        setDBGamePhase(); // This sets the game phase in the database
        setOpponents(players.filter((player) => player.uuid !== user.uuid));
        setPlayer(players.filter((player) => player.uuid === user.uuid)[0]);
        if (playersRef?.current?.length > players?.length) {
                leaveLobby();
        }
        playersRef.current = players;
    }, [players]);

    function removeCardClassFromImgs() {
        // This is needed to remove the card class from the images
        // Because the images are created by the Card component
        // And the Card component adds the card class to the images
        // But we dont want the bootstrap card class on the images
        // This is a hacky way to do it, but it works ¯\_(ツ)_/¯
        const imgs = document.getElementsByTagName("img");
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].classList.remove("card");
        }
    }

    async function setWildSuit(suit) {
        await setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "wild"), {
            suit: suit
        });
    }

    // ONLY FOR GAME LEADER
    function setDBGamePhase() {
        if (user.uuid === gameLeader.uuid) {
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
        // Deal 8 cards to each player
        players.forEach((player) => {
            const hand = shuffledDeck.splice(0, 8);
            setDoc(doc(firestore, "lobbies", lobbyId, "players", player.uuid), {
                hand: hand
            }, { merge: true });
        }
        )
        // deal one card to the table
        const table = shuffledDeck.splice(0, 1);
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: shuffledDeck,
            discard: table,
        }, { merge: true }
        );
        // Set the turn to the first player (the game leader)
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "gamePhase"), {
            turnPlayer: players[0],
            turnIndex: 0,
        }, { merge: true });
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

    function playCardDB(card) {
        const discard = gameState[0]?.discard;
        const playerHand = player.hand;
        const newHand = playerHand.filter((c) => c !== card);
        const newDiscard = [...discard, card];
        setDoc(doc(firestore, "lobbies", lobbyId, "players", user.uuid), {
            hand: newHand
        }, { merge: true });
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            discard: newDiscard,
        }, { merge: true });
    }

    function myTurn() {
        return gameState[2]?.turnPlayer.uuid === user.uuid;
    }

    function setNextPlayerTurn() {
        if(!myTurn()) return;
        const turnIndex = gameState[2]?.turnIndex;
        const nextTurnIndex = (turnIndex + 1) % players.length;
        const nextTurnPlayer = players[nextTurnIndex];
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "gamePhase"), {
            turnPlayer: nextTurnPlayer,
            turnIndex: nextTurnIndex,
        }, { merge: true });
        pickedUpCardThisTurn.current = false;
    }

    function nextPlayerPickUpTwo() {
        const turnIndex = gameState[2]?.turnIndex;
        const nextTurnIndex = (turnIndex + 1) % players.length;
        const nextTurnPlayer = players[nextTurnIndex];
        const deck = gameState[0]?.deck;
        if (deck.length < 2) {
            shuffleDeck();
        }
        const newHand = [...nextTurnPlayer.hand, deck[deck.length - 1], deck[deck.length - 2]];
        setDoc(doc(firestore, "lobbies", lobbyId, "players", nextTurnPlayer.uuid), {
            hand: newHand
        }, { merge: true });
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: deck.splice(0, deck.length - 2),
        }, { merge: true });
    }

    function checkCanPlayCard(){
        // Checks if any of the players cards can be played
        const discard = gameState[0]?.discard;
        const playerHand = player?.hand;
        if (!playerHand) {
            // console.log("No player hand");
            return false;
        }
        // console.log(playerHand);
        for (let i=0; i<playerHand.length; i++){
            if (playerHand[i][0] === "8") {
                // console.log("8");
                return true;
            }
            if(!discard[discard.length -1]){
                // console.log("No discard");
                return true;
            }
            if (discard[discard.length - 1][0] === playerHand[i][0] || discard[discard.length - 1][1] === playerHand[i][1]) {
                // console.log("Match");
                return true; // If card suits or ranks match, return true
            }
            if (discard[discard.length - 1][0] === "8") {
                if (gameState[3]?.suit === playerHand[i][1]) {
                    // console.log("Suit match wildcard");
                    return true;
                }
            }
        }
        return false;
    }

    function playCard(card, event) {
        // Check if it is the players turn
        if (!myTurn()) {
            return;
        }
        // Check if the card is playable
        const discard = gameState[0]?.discard;
        // Check if the card is an 8
        if (card[0] === "8") {
            // If the card is an 8, the player can choose the suit
            const pickSuitButton = document.getElementById("pickSuitButton");
            pickSuitButton.click();
            playCardDB(card);
        }
        else if (discard[discard.length-1][0] !== "8" && (discard[discard.length - 1][0] === card[0] || discard[discard.length - 1][1] === card[1])) {
            // If the card is playable, play it
            playCardDB(card);
            if(card[0] === "2") nextPlayerPickUpTwo();
        }
        else if (discard[discard.length - 1][0] === "8") {
            // Check if the db wild suit is the same as the card suit
            if (gameState[3]?.suit === card[1]) {
                playCardDB(card);
                setWildSuit(null);
                if(card[0] === "2") nextPlayerPickUpTwo();
            }
            else {
                // console.log(card, gameState[3]);
                event.target.classList.add("shake");
                setTimeout(() => {
                    event.target.classList.remove("shake");
                }, 200);
            }
        }
        else {
            // console.log(card, discard[discard.length - 1]);
            event.target.classList.add("shake");
            setTimeout(() => {
                event.target.classList.remove("shake");
            }, 200);
            return;
        }
        // Set the next players turn
        setNextPlayerTurn();
    }

    async function drawCard() {
        // Check if it is the players turn
        if (!myTurn()) {
            return;
        }
        if (canPlayCard.current) {
            return;
        }
        if (pickedUpCardThisTurn.current) {
            return;
        }
        const deck = gameState[0]?.deck;
        const playerHand = player.hand;
        const newHand = [...playerHand, deck[0]];
        const newDeck = deck.splice(1);
        await setDoc(doc(firestore, "lobbies", lobbyId, "players", user.uuid), {
            hand: newHand
        }, { merge: true });
        await setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: newDeck
        }, { merge: true });
        pickedUpCardThisTurn.current = true;
    }

    async function shuffleDeck() {
        // Get the discard pile
        const discard = gameState[0]?.discard;
        // Take the top card off the discard pile
        const topCard = discard.pop();
        const newDiscard = [];
        newDiscard.push(topCard);
        // Shuffle the discard pile
        const newDeck = shuffle(discard);
        // Set the new deck and discard pile
        await setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: newDeck,
            discard: newDiscard
        });
    }

    function getSuitImage(suit) {
        switch (suit) {
            case "s":
                return './images/SuitSpades.svg';
            case "h":
                return './images/SuitHearts.svg';
            case "d":
                return './images/SuitDiamonds.svg';
            case "c":
                return './images/SuitClubs.svg';
            default:
                return null;
        }
    }

    function restartGame() {
        if (player.uuid !== gameLeader.uuid){
            return;
        }
        // Reset the deck
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "deck"), {
            deck: createDeck(),
            discard: [],
        });
        // Reset the game phase
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "gamePhase"), {
            phase: "game",
            turnIndex: 0,
            turnPlayer: players[0].uuid,
        });
        // Reset the wild suit
        setDoc(doc(firestore, "lobbies", lobbyId, "gameState", "wild"), {
            suit: null,
        });
        // Reset the players hands
        players.forEach((player) => {
            setDoc(doc(firestore, "lobbies", lobbyId, "players", player.uuid), {
                hand: []
            }, { merge: true });
        });
        dealCards();
    }

    return (
        <>
            <Nav user={user} signOutUser={signOutUser} leaveLobby={leaveLobby} brand={`${gameLeader.name}'s Game`} lobbyId={lobbyId} />
            <main id='main'>
                {gameState[2]?.phase === "lobby" &&
                    <div className='container mt-5'>
                        <h1>Waiting for players to join...</h1>
                        <p>When all players are ready, the game will start</p>
                        <h2>Players:</h2>
                        <ul className='list-group'>
                            {players.map((player) => {
                                return <li key={player.uuid} className='list-group-item'>
                                    <div className='d-flex align-items-center gap-3'>
                                        <img src={player.image} alt={`${player.name} profile`} className="rounded-circle" height="50px" width="50px" referrerPolicy="no-referrer"></img>
                                        <h5 className=''>{player.name}</h5>
                                        <div className=''>
                                            {user.uuid === player.uuid ?
                                                <div>
                                                    {player.ready ?
                                                        <button className='btn btn-success shadow' onClick={() => { readyPlayer(player.ready) }} data-bs-container="body" data-bs-toggle="popover" data-bs-placement="right" data-bs-content="Right popover">Ready</button>
                                                        :
                                                        <div className='d-flex'>
                                                            <button className='btn btn-danger shadow' onClick={() => { readyPlayer(player.ready) }}>Not Ready</button>
                                                            <span className="left-arrow shadow">Press to ready up</span>
                                                        </div>
                                                    }
                                                </div>
                                                :
                                                <div>
                                                    {player.ready ?
                                                        <span className='btn btn-success'>Ready</span>
                                                        :
                                                        <span className='btn btn-danger'>Not Ready</span>
                                                    }
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
                    <div id='game-board'>
                        {/* Turn indicator */}
                        <div className='d-flex justify-content-center' id='turn-indicator'>
                            {gameState[2]?.turnPlayer?.uuid === user.uuid ?
                                <div className='d-flex align-items-center gap-3'>
                                    <img src={gameState[2]?.turnPlayer?.image} alt={`${gameState[2]?.turnPlayer?.name} profile`} className="rounded-circle" height="50px" width="50px" referrerPolicy="no-referrer"></img>
                                    <h5 className=''>Your Turn!</h5>
                                </div>
                                :
                                <div className='d-flex align-items-center gap-3'>
                                    <img src={gameState[2]?.turnPlayer?.image} alt={`${gameState[2]?.turnPlayer?.name} profile`} className="rounded-circle" height="50px" width="50px" referrerPolicy="no-referrer"></img>
                                    <h5 className=''>{gameState[2]?.turnPlayer?.name}'s Turn</h5>
                                </div>
                            }
                        </div>
                        {/* Opponents Hands */}
                        <div className='bg-primary d-flex justify-content-evenly p-2 mt-2' id='opponents-hands'>
                            {opponents.map((opponent) => {
                                return <div key={opponent.uuid}>
                                    <div className='d-flex fit-content bg-secondary p-2 gap-2'>
                                        {opponent?.hand?.map((card) => {
                                            return <div key={card} className='card-container'><Card card={card} height="50px" back /></div>
                                        })}
                                    </div>
                                </div>
                            })}
                        </div>
                        {/* Table */}
                        <div className='d-flex px-5 py-5 text-bg-light align-items-center justify-content-center'>
                            {gameState[0]?.deck.length > 0 && <button className={canPlayCard.current ? '' : 'border border-success'} onClick={drawCard}><Card card={gameState[0]?.deck[0]} height="100px" back /></button>}
                            <button onClick={shuffleDeck}><Card card={gameState[0]?.discard[gameState[0]?.discard.length - 1]} height="100px" /></button>
                            {gameState[3]?.suit && <h5 className='text-bg-light text-center ms-2'>Wild Suit:<br></br><img alt={gameState[3]?.suit} width="50px" src={getSuitImage(gameState[3]?.suit)}></img></h5>}
                        </div>
                        {/* Players Hand */}
                        <div id='players-hand'>
                            {player?.hand?.map((card) => {
                                return <button key={card} onClick={(e) => playCard(card, e)}><Card card={card} height="100px" /></button>
                            })}
                        </div>
                        {/* Skip turn */}
                        <div className='d-flex justify-content-center'>
                            <button className={!canPlayCard.current && pickedUpCardThisTurn.current ? 'd-flex btn btn-danger' : 'd-none btn btn-danger'} onClick={setNextPlayerTurn}>Skip Turn</button>
                        </div>
                        <div>
                            <button className='btn btn-danger' onClick={restartGame}>Restart Game</button>
                        </div>
                    </div>
                }
                <button type="button" className="d-none" data-bs-toggle="modal" data-bs-target="#pickSuitModal" id='pickSuitButton'></button>
                <div className="modal fade" id="pickSuitModal" tabIndex="-1" aria-labelledby="pickSuitModalLabel" aria-hidden="true" data-bs-backdrop="static">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="pickSuitModalLabel">Pick a Suit</h1>
                                {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                            </div>
                            <div className="modal-body d-flex justify-content-evenly">
                                <button onClick={() => setWildSuit('h')} type="button" className="btn btn-secondary" data-bs-dismiss="modal"><img alt='Hearts' width="50px" src={getSuitImage('h')}></img></button>
                                <button onClick={() => setWildSuit('s')} type="button" className="btn btn-secondary" data-bs-dismiss="modal"><img alt='Spades' width="50px" src={getSuitImage('s')}></img></button>
                                <button onClick={() => setWildSuit('c')} type="button" className="btn btn-secondary" data-bs-dismiss="modal"><img alt='Clubs' width="50px" src={getSuitImage('c')}></img></button>
                                <button onClick={() => setWildSuit('d')} type="button" className="btn btn-secondary" data-bs-dismiss="modal"><img alt='Diamonds' width="50px" src={getSuitImage('d')}></img></button>
                            </div>
                            <div className="modal-footer">
                                {/* <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
