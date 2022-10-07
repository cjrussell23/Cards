import Lobby from "./Lobby";
import Game from "./Game";
import { useState, useEffect } from "react";
import { collection, doc, deleteDoc, addDoc, query, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
	apiKey: "AIzaSyBfxsiNreGLVgURLMvxTzsOr24NZXR9z7w",
	authDomain: "cards-37a00.firebaseapp.com",
	projectId: "cards-37a00",
	storageBucket: "cards-37a00.appspot.com",
	messagingSenderId: "590252833076",
	appId: "1:590252833076:web:99ec3d034e2483fac60d61",
	measurementId: "G-32Z5ZT7RNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
// const analytics = getAnalytics(app);



function App() {
	const firestorePlayers = [];
	const [lobbyId, setLobbyId] = useState("");
	const [players, setPlayers] = useState([]);
	const [playerName, setPlayerName] = useState("");
	const [playerId, setPlayerId] = useState("");
	const [host, setHost] = useState(false);

	useEffect(() => {
		if (lobbyId) {
			addPlayer();
		}
		else {
			// Player has left the lobby
			setPlayerName("");
			setPlayers([]);
			setPlayerId("");
		}
	}, [lobbyId]);

	async function addPlayer() {
		console.log("Adding Player to Lobby: " + lobbyId);
		const name = prompt("Enter your name:");
		setPlayerName(name);
		console.log("Player Name: " + name);
		const docRef = await addDoc(collection(firestore, "lobbies", lobbyId, "players"), {
			name: name,
			ready: false
		});
		setPlayerId(docRef.id);
		console.log(`Player ID: ${docRef.id}`);
		subscribeToPlayers();
	}

	function subscribeToPlayers() {
		const q = query(collection(firestore, "lobbies", lobbyId, "players"));
		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const firestorePlayers = [];
			querySnapshot.forEach((doc) => {
				firestorePlayers.push(doc.data());
			});
			setPlayers(firestorePlayers);
			console.log(firestorePlayers);
		});
	}

	function handleJoinLobby(lobbyId) {
		setLobbyId(lobbyId);
	}

	async function leaveLobby() {
		// Delete player from lobby then clear the lobbyId
		console.log("Removing Player from Lobby: " + lobbyId);
		await deleteDoc(doc(firestore, "lobbies", lobbyId, "players", playerId));
		console.log(players.length);
		if (players.length <= 1) {
			// Delete the lobby if there are no more players
			console.log("Deleting Lobby: " + lobbyId);
			await deleteDoc(doc(firestore, "lobbies", lobbyId));
		}
		console.log("Player Removed from Lobby: " + lobbyId);
		setLobbyId("");
	}

	async function handleCreateLobby() {
		console.log("Creating Lobby");
		setHost(true);
		const lobbyRef = await addDoc(collection(firestore, "lobbies"), {
		})
		handleJoinLobby(lobbyRef.id);
	}

	return (
		<div className="App">
			{playerName ? <Game firestore={firestore} lobbyId={lobbyId} leaveLobby={leaveLobby} players={players} playerName={playerName} /> : <Lobby handleJoinLobby={handleJoinLobby} handleCreateLobby={handleCreateLobby} />}
		</div>
	);
}

export default App;
