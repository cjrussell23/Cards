import React from 'react'

export default function LobbyIDModal(props) {
    const { lobbyId } = props;
    return (
        <div className="modal fade" id="lobbyIDModal" tabIndex="-1" aria-labelledby="lobbyIDModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="lobbyIDModalLabel">Lobby ID</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Your Lobby ID is: </span>
                            <span className='input-group-text bg-white'>{lobbyId} </span>
                            <button className='btn btn-primary form-control' onClick={() => navigator.clipboard.writeText(lobbyId)}>Copy</button>
                        </div>
                        <p className='text-center'>Give this to your friends so they can join your lobby!</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
