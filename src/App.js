import Lobby from "./Lobby";
import Game from "./Game";
import { useState, useEffect, useRef } from "react";
import { collection, doc, deleteDoc, setDoc, query, onSnapshot, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import './App.css';

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
const auth = getAuth(app);
// const analytics = getAnalytics(app);

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="App bg-light">
			{user ? <Home user={user} /> : <SignIn />}
		</div >
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	}
	const signInWithAnonymously = () => {
		signInAnonymously(auth).then(() => {
			// console.log("Signed in anonymously");
		}).catch((error) => {
			console.log(error);
		});
	}
	return (
		<div id="sign-in">
			<nav className="navbar navbar-dark bg-primary">
				<div className="container-fluid">
					<span className="navbar-brand mb-0 h1">Crazy Eights</span>
				</div>
			</nav>
			<div className="d-flex justify-content-center flex-column align-items-center flex-grow-1 mt-3">
				<div className="card p-0">
					<div className="card-header">
						<h1 className="text-center">Crazy Eights</h1>
					</div>
					<div className="card-body text-center">
						<p>Play Crazy Eights with your friends!</p>
						<p className="card-text">Sign in to continue.</p>
						<div className="d-flex flex-column gap-2">
							<button className="btn btn-primary d-flex justify-content-evenly" onClick={signInWithGoogle}><img src='https://unifysolutions.net/supportedproduct/google-signin/Google__G__Logo.svg' width="30" height="30" alt='Google G Logo'></img><span>Sign In With Google</span></button>
							<button className="btn btn-primary d-flex justify-content-evenly" onClick={signInWithAnonymously}><svg width="30" height="30" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><path d="M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z"></path></svg><span>Sign In Anonymously</span></button>
						</div>

					</div>
				</div>
			</div>
		</div>
	)
}

function Home(props) {
	const { user } = props; // The authenticated user
	const [lobbyId, setLobbyId] = useState("");
	const [players, setPlayers] = useState([]);
	const [gameState, setGameState] = useState([]);
	var playerLeftLobby = useRef();

	useEffect(() => {
		// When there is a lobbyId
		if (lobbyId !== "") {
			// add the player to the lobby
			addPlayer();
			// And subscribe to the lobby's players
			const pq = query(collection(firestore, "lobbies", lobbyId, "players"));
			onSnapshot(pq, (querySnapshot) => {
				const firestorePlayers = [];
				querySnapshot.forEach((doc) => {
					firestorePlayers.push(doc.data());
				});
				setPlayers(firestorePlayers);
			});
			// Subscribe to the lobby's game state
			const gq = query(collection(firestore, "lobbies", lobbyId, "gameState"));
			onSnapshot(gq, (querySnapshot) => {
				const firestoreGameState = [];
				querySnapshot.forEach((doc) => {
					firestoreGameState.push(doc.data());
				});
				setGameState(firestoreGameState);
			});
			// If the user closes the tab, remove them from the lobby
			window.addEventListener('beforeunload', (e) => {
				e.preventDefault();
				e.returnValue = '';
				removePlayerFromLobby();
			});
		}
	}, [lobbyId]);

	async function removePlayerFromLobby() {
		// Save the lobby id so we can delete the player and lobby
		const prevLobbyId = lobbyId;
		await deleteDoc(doc(firestore, "lobbies", prevLobbyId, "players", user.uuid));
		await deleteDoc(doc(firestore, "lobbies", prevLobbyId));
		setLobbyId(""); // This will trigger the useEffect to remove the player from the lobby
		setPlayers([]);
		setGameState([]);
	}

	async function readyPlayer(ready) {
		const docRef = doc(firestore, "lobbies", lobbyId, "players", user.uuid);

		await updateDoc(docRef, {
			ready: !ready
		});
	}

	async function addPlayer() {
		if (!lobbyId) { // This should never happen
			console.log("No lobby ID - cannot add player");
			return;
		}
		// Create new user in the firestore database using auth properties
		await setDoc(doc(firestore, "lobbies", lobbyId, "players", user.uuid), {
			name: user.displayName,
			ready: false,
			image: user.photoURL,
			email: user.email,
			uuid: user.uuid
		});
		// There is a listener on the players collection that will update the players state
	}

	function handleJoinLobby(lobbyId) {
		// Check if lobby exists
		const lobbyRef = doc(firestore, "lobbies", lobbyId);
		getDoc(lobbyRef).then((doc) => {
			if (doc.exists()) {
				// Set the lobby ID, which will trigger the useEffect
				// to add the player to the lobby
				setLobbyId(lobbyId);
			} else {
				alert("Lobby does not exist");
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	}

	async function leaveLobby() {
		playerLeftLobby.current = true;
		removePlayerFromLobby();
	}

	async function handleCreateLobby(lobbyID) {
		// Create a new lobby then join it

		// Create a new lobby in the firestore database
		var lobbyRef;
		if (lobbyID) {
			// console.log("Creating Lobby: " + lobbyID)
			await setDoc(doc(firestore, "lobbies", lobbyID), {});
			lobbyRef = doc(firestore, "lobbies", lobbyID);
		}
		else lobbyRef = await addDoc(collection(firestore, "lobbies"), {
		})
		// console.log(lobbyRef);
		// Set the initial game phase
		await setDoc(doc(firestore, "lobbies", lobbyRef.id, "gameState", "gamePhase"), {
			phase: "lobby"
		});
		// Set the deck to blank
		await setDoc(doc(firestore, "lobbies", lobbyRef.id, "gameState", "deck"), {
			deck: [],
			discard: []
		});
		// console.log("Creating Lobby: " + lobbyRef.id);
		// Set the lobby gameLeader email to the current user's email
		handleJoinLobby(lobbyRef.id);
		setGameLeader(lobbyRef.id);
	}

	async function setGameLeader(lobbyId) {
		const lobbyRef = doc(firestore, "lobbies", lobbyId, "gameState", "gameLeader");
		await setDoc(lobbyRef, {
			email: user.email,
			name: user.displayName,
			image: user.photoURL,
			uuid: user.uuid
		});
	}

	function signOutUser() {
		signOut(auth);
	}

	return (
		<>
			{lobbyId ?
				<Game firestore={firestore} lobbyId={lobbyId} leaveLobby={leaveLobby} players={players} user={user} readyPlayer={readyPlayer} signOutUser={signOutUser} gameState={gameState}/>
				:
				<Lobby handleJoinLobby={handleJoinLobby} handleCreateLobby={handleCreateLobby} user={user} signOutUser={signOutUser} playerLeftLobby={playerLeftLobby}/>
			}
		</>
	)
}


export default App;
