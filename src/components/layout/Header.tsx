import React from 'react';
import { GameState } from '../../types';
import { ICONS, ROSTER_LIMIT } from '../../config/constants';

export const Header: React.FC<{ gameState: GameState }> = ({ gameState }) => (
    <header className="fixed top-0 left-0 right-0 bg-stone-950/80 backdrop-blur-sm border-b-4 border-cyan-900/50 p-3 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-lg">
            <h1 className="font-cinzel text-2xl text-cyan-400">Darkest Path</h1>
            <div className="flex items-center gap-6 font-cinzel">
                <span className="flex items-center gap-2">{ICONS.WEEK} Week: {gameState.week}</span>
                <span className="flex items-center gap-2">{ICONS.GOLD} Gold: {gameState.gold}</span>
                <span className="flex items-center gap-2">{ICONS.ROSTER} Roster: {gameState.roster.length}/{ROSTER_LIMIT}</span>
            </div>
        </div>
    </header>
);
