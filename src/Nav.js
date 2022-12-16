import React from 'react'
import RulesButton from './RulesButton'
import RulesModal from './RulesModal';
import LobbyIDButton from './LobbyIDButton';
import LobbyIDModal from './LobbyIDModal';
import { useEffect } from 'react';
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';

// Main navigation bar
export default function Nav(props) {
    const { user, signOutUser, leaveLobby, title, brand, lobbyId, restartGame, gameState } = props;
    useEffect(() => {
        if(!user.displayName){
            const randomName = uniqueNamesGenerator({ 
                dictionaries: [colors, animals],
                separator: ' ',
                style: 'capital',
                length: 2,
            });
            user.displayName = randomName;
            // console.log(randomName);
        }
        if(!user.photoURL){
            user.photoURL = 'https://source.boringavatars.com/beam/120/' + user.displayName.replace(' ', '%20') + '?colors=264653,2a9d8f,e9c46a,f4a261,e76f51'
            // console.log(user.photoURL);
        }
        if(!user.uuid){
            user.uuid = uuidv4();
        }
    }, [user]);
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <img src={user.photoURL} className='rounded-circle my-auto shadow' width={40} alt=''></img>
                <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">{brand ? brand : "Cards"}</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 gap-2">
                            <li className="nav-item">
                                <RulesButton />
                            </li>
                            {gameState && gameState[2]?.phase === 'game' && <li className="nav-item">
                                <button className='btn btn-danger' onClick={restartGame}>Restart Game</button>
                            </li>}
                            {lobbyId && <li className="nav-item">
                                <LobbyIDButton />
                            </li>}
                            {leaveLobby && <li className="nav-item">
                                <button className="btn btn-danger shadow" onClick={ leaveLobby }>Leave Game</button>
                            </li>}
                            <li className="nav-item">
                                <button className="btn btn-secondary shadow" onClick={ signOutUser }>Sign Out</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <RulesModal />
            {lobbyId && <LobbyIDModal lobbyId={lobbyId} />}
        </nav>
    )
}
