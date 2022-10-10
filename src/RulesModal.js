import React from 'react'

export default function RulesModal() {
    return (
        <div className="modal fade" id="rulesModal" tabIndex="-1" aria-labelledby="rulesModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="rulesModalLabel">Modal title</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div>
                            <h3>The Pack</h3>
                            <p>The standard 52-card pack is used.</p>
                            <h3>Object of the Game</h3>
                            <p>The goal is to be the first player to get rid of all the cards in your hand.</p>
                            <h3>Card Values/scoring</h3>
                            <p>The player who is the first to have no cards left wins the game. The winning player collects from each other player the value of the cards remaining in that player’s hand as follows:</p>
                            <p>Each eight = 50 points</p>
                            <p>Each K, Q, J or 10 = 10 points</p>
                            <p>Each ace = 1 point</p>
                            <p>Each other card is the pip value</p>
                            <h3>The Deal</h3>
                            <p>Deal 5 cards one at a time, face down, beginning with the player to the left. The balance of the pack is placed face down in the center of the table and forms the stock. The dealer turns up the top card and places it in a separate pile; this card is the “starter.” If an eight is turned, it is buried in the middle of the pack and the next card is turned.</p>
                            <h3>The Play</h3>
                            <p>Starting to the dealer’s left, each player must place one card face up on the starter pile. Each card played (other than an eight) must match the card showing on the starter pile, either in suit or in denomination.</p>
                            <p>Example: If the Q of Clubs is the starter, any club may be played on it or any Queen.</p>
                            <p>If unable to play, cards are drawn from the top of the stock until a play is possible, or until the stock is exhausted. If unable to play when the stock is exhausted, the player must pass. A player may draw from the stock, even though there may be a playable card in the player’s hand.</p>
                            <p>All eights are wild! That is, an eight may be played at any time in turn, and the player need only specify a suit for it (but never a number). The next player must play either a card of the specified suit or an eight.</p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
