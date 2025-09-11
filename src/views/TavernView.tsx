import React, { useState, useEffect } from 'react';
import { GameState, GameView, Hero } from '../types';
import { Button } from '../components/common/Button';
import { CharacterCard } from '../components/game/CharacterCard';
import { generateHeroes } from '../services/gameContentService';
import { RECRUIT_COST, ROSTER_LIMIT } from '../config/constants';

interface TavernViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  updateGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const TavernView: React.FC<TavernViewProps> = ({ setView, gameState, updateGameState }) => {
  const [recruits, setRecruits] = useState<Hero[]>([]);

  useEffect(() => {
    const newRecruits = generateHeroes(3);
    setRecruits(newRecruits);
  }, []);
  
  const handleRecruit = (hero: Hero) => {
    if (gameState.gold >= RECRUIT_COST && gameState.roster.length < ROSTER_LIMIT) {
        updateGameState(prev => ({
            ...prev,
            gold: prev.gold - RECRUIT_COST,
            roster: [...prev.roster, hero]
        }));
        setRecruits(recruits.filter(r => r.id !== hero.id));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-cinzel">Recruitment Office</h1>
        <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
      </div>
      <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">New faces in Arkham, drawn by whispers of the unknown. Each has their reasons.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recruits.map(hero => (
              <CharacterCard key={hero.id} hero={hero}>
                  <Button 
                      onClick={() => handleRecruit(hero)} 
                      disabled={gameState.gold < RECRUIT_COST || gameState.roster.length >= ROSTER_LIMIT}
                  >
                     Hire ({RECRUIT_COST}G)
                  </Button>
                  {gameState.roster.length >= ROSTER_LIMIT && <p className="text-red-500 text-xs mt-2">Roster is full.</p>}
              </CharacterCard>
          ))}
          {recruits.length === 0 && <p className="col-span-full text-center text-stone-500 text-xl">No more investigators available this week.</p>}
      </div>
    </div>
  );
};
