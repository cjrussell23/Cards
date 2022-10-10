import React from 'react'
import RulesButton from './RulesButton'
import RulesModal from './RulesModal';

// Main navigation bar
export default function Nav(props) {
    const { user, signOutUser, leaveLobby, title, brand, togglelobbyInfo } = props;
    return (
        <nav className="navbar navbar-dark bg-primary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">{brand ? brand : "Cards"}</span>
                {title && <span className="navbar-text">{title}</span>}
                <span className='d-flex align-items-center'>
                    <RulesButton />
                    {togglelobbyInfo && <button className="btn btn-warning ms-2" onClick={togglelobbyInfo}>Lobby Code</button>}
                    {leaveLobby && <button className="btn btn-danger ms-2" onClick={ leaveLobby }>Leave Game</button>}
                    <button className="btn btn-secondary ms-2" onClick={ signOutUser }>Sign Out</button>
                    <img src={user.photoURL} alt='profile' className='rounded-circle mx-2 my-auto' width={40}></img>
                </span>
            </div>
            <RulesModal />
        </nav>
    )
}
