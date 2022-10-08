import Lobby from "./Lobby";
import Game from "./Game";
import { useState, useEffect } from "react";
import { collection, doc, deleteDoc, setDoc, query, onSnapshot, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import 'bootstrap/dist/css/bootstrap.min.css';

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
		<div className="App">
			{user ? <Home user={user} /> : <SignIn />}
		</div >
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	}
	return (
		<div id="sign-in">
			<nav className="navbar navbar-dark bg-primary">
				<div className="container-fluid">
					<span className="navbar-brand mb-0 h1">Habits</span>
				</div>
			</nav>
			<div className="d-flex justify-content-center flex-column align-items-center flex-grow-1">
				<div className="card col-6">
					<div className="card-header">
						<h1 className="text-center">Start Tracking Your Habits</h1>
					</div>
					<div className="card-body text-center">
						<p className="card-text">Sign in to continue.</p>
						<button className="btn btn-primary" onClick={signInWithGoogle}><img src='https://unifysolutions.net/supportedproduct/google-signin/Google__G__Logo.svg' width="30" height="30" alt='Google G Logo'></img> Sign In With Google</button>
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

	useEffect(() => {
		// When there is a lobbyId
		if (lobbyId !== "") {
			// add the player to the lobby
			addPlayer();
			// And subscribe to the lobby's players
			const q = query(collection(firestore, "lobbies", lobbyId, "players"));
			onSnapshot(q, (querySnapshot) => {
				const firestorePlayers = [];
				querySnapshot.forEach((doc) => {
					firestorePlayers.push(doc.data());
				});
				setPlayers(firestorePlayers);
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
		// Clear the state related to the lobby
		setLobbyId(""); // This will trigger the useEffect to remove the player from the lobby
		setPlayers([]);
		// Delete the player from the lobby in the database
		await deleteDoc(doc(firestore, "lobbies", prevLobbyId, "players", user.email));
		// Delete the lobby if there are no more players
		if (players.length < 1) {
			await deleteDoc(doc(firestore, "lobbies", prevLobbyId));
		}
	}

	async function readyPlayer(ready) {
		const docRef = doc(firestore, "lobbies", lobbyId, "players", user.email);

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
		await setDoc(doc(firestore, "lobbies", lobbyId, "players", user.email), {
			name: user.displayName,
			ready: false,
			image: user.photoURL,
			email: user.email,
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

	function leaveLobby() {
		removePlayerFromLobby();
	}

	async function handleCreateLobby() {
		// Create a new lobby then join it
		console.log("Creating Lobby");
		const lobbyRef = await addDoc(collection(firestore, "lobbies"), {
		})
		// Set the lobby gameLeader email to the current user's email
		handleJoinLobby(lobbyRef.id);
		setGameLeader(lobbyRef.id);
	}

	async function setGameLeader(lobbyId) {
		const lobbyRef = doc(firestore, "lobbies", lobbyId);
		await updateDoc(lobbyRef, {
			gameLeader: {
				email: user.email,
				name: user.displayName,
				image: user.photoURL
			}
		});
	}

	function signOutUser() {
		signOut(auth);
	}

	return (
		<>
			{lobbyId ?
				<Game firestore={firestore} lobbyId={lobbyId} leaveLobby={leaveLobby} players={players} user={user} readyPlayer={readyPlayer} signOutUser={signOutUser}/>
				:
				<Lobby handleJoinLobby={handleJoinLobby} handleCreateLobby={handleCreateLobby} user={user} signOutUser={signOutUser}/>
			}
		</>
	)
}


export default App;
