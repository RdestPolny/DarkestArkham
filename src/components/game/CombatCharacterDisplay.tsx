import React from 'react';
import { Character, StatusEffect, Hero } from '../../types';

interface CombatCharacterDisplayProps {
    character: Character;
    isTurn: boolean;
    isSelected: boolean;
    isTargetable?: boolean;
    onClick?: () => void;
}

const getStatusIcon = (status: StatusEffect) => {
    switch (status.type) {
        case 'bleed': return <span title="Bleed" className="text-red-500">🩸</span>;
        case 'poison': return <span title="Poison" className="text-green-500">🧪</span>;
        case 'stun': return <span title="Stun" className="text-yellow-400">✨</span>;
        case 'buff': return <span title="Buff" className="text-blue-400">⬆️</span>;
        case 'debuff': return <span title="Debuff" className="text-purple-400">⬇️</span>;
        default: return null;
    }
}

export const CombatCharacterDisplay: React.FC<CombatCharacterDisplayProps> = ({ character, isTurn, isSelected, isTargetable, onClick }) => {
    const isHero = 'heroClass' in character;
    const hpPercentage = (character.hp / character.maxHp) * 100;

    if (character.hp <= 0) {
        return (
            <div className="w-48 text-center opacity-40">
                <p className="font-cinzel text-xl text-stone-500 line-through">{character.name}</p>
                <p className="text-red-500 font-bold">DEFEATED</p>
            </div>
        )
    }

    return (
        <div 
            onClick={onClick}
            className={`w-48 p-3 border-4 relative transition-all duration-200
                ${isTurn ? 'border-amber-400 scale-110' : 'border-stone-800'}
                ${isSelected ? 'border-cyan-400' : ''}
                ${isTargetable ? 'cursor-pointer hover:border-green-400' : 'cursor-default'}
                ${isHero ? 'bg-blue-900/30' : 'bg-red-900/30'}
            `}
        >
            <h3 className={`font-cinzel text-xl text-center mb-2 ${isTurn ? 'text-amber-300' : 'text-stone-200'}`}>{character.name}</h3>
            
            {/* HP Bar */}
            <div className="text-sm text-center mb-1">{character.hp} / {character.maxHp}</div>
            <div className="w-full bg-red-900/50 border border-red-800 h-4">
                <div className="bg-green-500 h-full" style={{ width: `${hpPercentage}%` }}></div>
            </div>

            {/* Stress Bar (for heroes) */}
            {isHero && (
                <>
                    <div className="text-sm text-center mt-2 mb-1">Stress: {(character as Hero).stress}</div>
                    <div className="w-full bg-stone-700 border border-stone-600 h-2">
                        <div className="bg-amber-400 h-full" style={{ width: `${((character as Hero).stress / (character as Hero).maxStress) * 100}%` }}></div>
                    </div>
                </>
            )}

            {/* Status Effects */}
            <div className="flex justify-center items-center gap-2 mt-3 h-6">
                {character.statusEffects.map((status, index) => (
                    <div key={index} className="text-lg relative">
                        {getStatusIcon(status)}
                        <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-black/80 rounded-full px-1">{status.duration}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
