import React from 'react'
import RulesButton from './RulesButton'
import RulesModal from './RulesModal';
import LobbyIDButton from './LobbyIDButton';
import LobbyIDModal from './LobbyIDModal';

// Main navigation bar
export default function Nav(props) {
    const { user, signOutUser, leaveLobby, title, brand, lobbyId } = props;
    return (
        <nav className="navbar navbar-dark bg-primary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">{brand ? brand : "Cards"}</span>
                {title && <span className="navbar-text">{title}</span>}
                <span className='d-flex align-items-center gap-2'>
                    <RulesButton />
                    {lobbyId && <LobbyIDButton />}
                    {leaveLobby && <button className="btn btn-danger shadow" onClick={ leaveLobby }>Leave Game</button>}
                    <button className="btn btn-secondary shadow" onClick={ signOutUser }>Sign Out</button>
                    <img src={user.photoURL} alt='profile' className='rounded-circle my-auto shadow' width={40}></img>
                </span>
            </div>
            <RulesModal />
            {lobbyId && <LobbyIDModal lobbyId={lobbyId} />}
        </nav>
    )
}
