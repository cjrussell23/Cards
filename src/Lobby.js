import React, { useRef, useEffect } from "react";
import Nav from "./Nav";
import RulesButton from "./RulesButton";

// This is the component for joining/creating a lobby
export default function Lobby(props) {
    const { handleJoinLobby, handleCreateLobby, user, signOutUser, playerLeftLobby } = props;
    const lobbyIdRef = useRef();
    const createlobbyIdRef = useRef();

    useEffect(() => {
        if (playerLeftLobby.current) {
            const playerLeftAlertButton = document.getElementById("playerLeftAlertButton");
            playerLeftAlertButton.click();
            playerLeftLobby.current = false;
        }
    }, [playerLeftLobby]);

    function createLobby() {
        handleCreateLobby(createlobbyIdRef.current.value);
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
                <div className="mt-2 mb-5">
                    <div className="card">
                        <h2>Create Game</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createLobby();
                        }}>
                            {/* Input for optional lobbyCode */}
                            <div className="input-group d-flex flex-nowrap mb-3">
                                <span className="input-group-text">Lobby ID:</span>
                                <input className="ps-2 text-box flex-grow-1" type="text" id="lobbyCode" placeholder="Optional" ref={createlobbyIdRef}/>
                                <button type="submit" className="btn btn-success flex-shrink-1">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
                <p>Or Join your friends lobby with the Lobby ID they gave you.</p>
                <div className="mt-2">
                    <div className="card d-flex flex-column align-items-center justify-content-center">
                        <h2>Join Game</h2>
                        <button onClick={pasteID} className='btn btn-primary mb-2'>Paste LobbyID</button>
                        <form className="input-group d-flex flex-nowrap">
                            <span className="input-group-text flex-shrink-1">Lobby ID:</span>
                            <input className="ps-2 text-box flex-grow-1" type="text" id="lobbyId" placeholder="Enter Lobby ID" ref={lobbyIdRef}/>
                            <button className="btn btn-success flex-shrink-1" type="submit" onClick={(e) => {
                                e.preventDefault();
                                joinLobby();
                            }}>Join</button>
                        </form>
                    </div>
                </div>
                <button type="button" className="d-none" data-bs-toggle="modal" data-bs-target="#playerLeftAlertModal" id='playerLeftAlertButton'></button>
                <div className='modal fade' id='playerLeftAlertModal' tabIndex="-2" aria-labelledby="playerLeftAlertModalLabel" aria-hidden="true" data-bs-backdrop="static">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="playerLeftAlertModalLabel">Game Over!</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <h5 className='text-center'>A player has left the game. You have been redirected to the lobby creation screen.</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}