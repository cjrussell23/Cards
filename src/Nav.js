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
    const { user, signOutUser, leaveLobby, title, brand, lobbyId } = props;
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
        <nav className="navbar navbar-dark bg-primary">
            <div className="container-fluid">
                <span className="navbar-brand mb-0 h1">{brand ? brand : "Cards"}</span>
                {title && <span className="navbar-text">{title}</span>}
                <span className='d-flex align-items-center gap-2'>
                    <RulesButton />
                    {lobbyId && <LobbyIDButton />}
                    {leaveLobby && <button className="btn btn-danger shadow" onClick={ leaveLobby }>Leave Game</button>}
                    <button className="btn btn-secondary shadow" onClick={ signOutUser }>Sign Out</button>
                    <img src={user.photoURL} className='rounded-circle my-auto shadow' width={40} alt=''></img>
                </span>
            </div>
            <RulesModal />
            {lobbyId && <LobbyIDModal lobbyId={lobbyId} />}
        </nav>
    )
}
