import React from 'react'
import './card.css'

export default function Card(props) {
    const { value, suit } = props;

    return (
        <section class={`playing-card playing-card--${suit}`} value={value}>
            <div class="playing-card__inner playing-card__inner--centered">
                <div class="playing-card__column">
                    
                </div>
            </div>
        </section>
    )
}
