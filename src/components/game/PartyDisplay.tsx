import React from 'react';
import { Hero } from '../../types';

export const PartyDisplay: React.FC<{ party: Hero[] }> = ({ party }) => (
    <div className="flex gap-4 justify-center bg-black/50 p-2 border-t-2 border-b-2 border-stone-800">
        {party.map(hero => (
            <div key={hero.id} className="w-1/4 bg-stone-900/80 border-2 border-stone-700 p-2 text-center shadow-lg">
                <p className="font-cinzel text-amber-300 truncate text-lg">{hero.name}</p>
                <div className="text-sm flex justify-between mt-1 px-1">
                    <span className="text-green-400 font-bold">HP: {hero.hp}/{hero.maxHp}</span>
                    <span className="text-yellow-400 font-bold">S: {hero.stress}</span>
                </div>
                <div className="mt-2 space-y-1">
                    {/* HP Bar */}
                    <div className="w-full bg-red-900/70 border border-red-900 h-2">
                        <div className="bg-green-500 h-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}></div>
                    </div>
                     {/* Stress Bar */}
                    <div className="w-full bg-stone-700/80 border border-stone-600 h-2">
                        <div className="bg-amber-400 h-full" style={{ width: `${(hero.stress / hero.maxStress) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);
