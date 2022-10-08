import React from 'react'

// Main navigation bar
export default function Nav(props) {
    const { user, signOutUser, leaveLobby, title, brand, toggleModal } = props;
    return (
        <nav className="navbar navbar-dark bg-primary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">{brand ? brand : "Cards"}</span>
                {title && <span className="navbar-text">{title}</span>}
                <span className='d-flex align-items-center'>
                    {toggleModal && <button className="btn btn-warning" onClick={toggleModal}>Lobby Code</button>}
                    {leaveLobby && <button className="btn btn-danger mx-2" onClick={ leaveLobby }>Leave Game</button>}
                    <button className="btn btn-secondary" onClick={ signOutUser }>Sign Out</button>
                    <img src={user.photoURL} alt='profile' className='rounded-circle mx-2 my-auto' width={40}></img>
                </span>
            </div>
        </nav>
    )
}
