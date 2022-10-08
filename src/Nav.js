import React from 'react'

// Main navigation bar
export default function Nav(props) {
    const { user, signOutUser, leaveLobby } = props;
    return (
        <nav className="navbar navbar-dark bg-primary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">Cards</span>
                <span className='d-flex align-items-center'>
                    {leaveLobby && <button className="btn btn-danger mx-2" onClick={ leaveLobby }>Leave Game</button>}
                    <button className="btn btn-secondary" onClick={ signOutUser }>Sign Out</button>
                    <img src={user.photoURL} alt='profile' className='rounded-circle mx-2 my-auto' width={40}></img>
                </span>
            </div>
        </nav>
    )
}
