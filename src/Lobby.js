import React, { useRef } from "react";
import Nav from "./Nav";
import RulesButton from "./RulesButton";

// This is the component for joining/creating a lobby
export default function Lobby(props) {
    const { handleJoinLobby, handleCreateLobby, user, signOutUser } = props;
    const lobbyIdRef = useRef();

    function createLobby() {
        handleCreateLobby();
    }

    function joinLobby() {
        handleJoinLobby(lobbyIdRef.current.value);
    }

    function pasteID(){
        navigator.clipboard
                    .readText()
                    .then(
                        cliptext =>
                        (document.getElementById('lobbyId').value = cliptext),
                            err => {
                                console.log("Something went wrong", err);
                                alert("Something went wrong");
                            }
                    );
    }

    return (
        <>
            <Nav user={user} signOutUser={signOutUser} />
            <main className="container text-center d-flex flex-column align-items-center justify-content-center">
                <h1 className="text-center pb-4">Welcome {user.displayName}</h1>
                <p>This is a website for playing Crazy Eights with your friends.</p>
                <p>At any time you can click the <RulesButton /> button in the nav bar to see the rules for the game.</p>
                <p>Click the button below to create a new lobby.</p>
                <div className="Create mt-2 mb-5">
                    <div className="card">
                        <h2>Create Game</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createLobby();
                        }}>
                            <button type="submit" className="btn btn-success">Create</button>
                        </form>
                    </div>
                </div>
                <p>Or Join your friends lobby with the Lobby ID they gave you.</p>
                <div className="Join mt-2">
                    <div className="card d-flex flex-column align-items-center justify-content-center">
                        <h2>Join Game</h2>
                        <button onClick={pasteID} className='btn btn-success mb-2'>Paste LobbyID</button>
                        <form className="input-group">
                            <span className="input-group-text">Lobby ID:</span>
                            <input className="ps-2" type="text" id="lobbyId" placeholder="Enter Lobby ID" ref={lobbyIdRef}/>
                            <button className="btn btn-primary" type="submit" onClick={(e) => {
                                e.preventDefault();
                                joinLobby();
                            }}>Join</button>
                        </form>
                    </div>
                </div>
                
            </main>
        </>
    );
}