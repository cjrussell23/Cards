import React, { useRef } from "react";
import Nav from "./Nav";

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

    return (
        <>
            <Nav user={user} signOutUser={signOutUser} />
            <main>
                <h1>Lobby</h1>
                <div className="Join">
                    <div className="card">
                        <h1>Join Game</h1>
                        <form>
                            <label htmlFor="lobbyId">Lobby ID: </label>
                            <input type="text" id="lobbyId" placeholder="Enter Lobby ID" ref={lobbyIdRef} />
                            <button type="submit" onClick={(e) => {
                                e.preventDefault();
                                joinLobby();
                            }}>Join</button>
                        </form>
                    </div>
                </div>
                <div className="Create">
                    <div className="card">
                        <h1>Create Game</h1>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createLobby();
                        }}>
                            <button type="submit">Create</button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}