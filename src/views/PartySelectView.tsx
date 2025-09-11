import React, { useState } from 'react';
import { GameState, GameView, Hero, Mission } from '../types';
import { Button } from '../components/common/Button';
import { CharacterCard } from '../components/game/CharacterCard';
import { PARTY_LIMIT } from '../config/constants';

interface PartySelectViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  mission: Mission;
  startDungeon: (party: Hero[]) => void;
}

export const PartySelectView: React.FC<PartySelectViewProps> = ({ setView, gameState, mission, startDungeon }) => {
  const [selectedHeroes, setSelectedHeroes] = useState<Hero[]>([]);

  const toggleHeroSelection = (hero: Hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        return prev.filter(h => h.id !== hero.id);
      }
      if (prev.length < PARTY_LIMIT) {
        return [...prev, hero];
      }
      return prev;
    });
  };

  const isSelected = (hero: Hero) => !!selectedHeroes.find(h => h.id === hero.id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-cinzel">Assemble Your Team</h1>
        <p className="text-stone-400 mt-2">Select up to {PARTY_LIMIT} investigators for the case: <span className="text-cyan-300 font-bold">{mission.name}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {gameState.roster.map(hero => (
          <div key={hero.id} onClick={() => toggleHeroSelection(hero)} className="cursor-pointer">
            <CharacterCard hero={hero} isSelected={isSelected(hero)} />
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-stone-950/90 border-t-4 border-cyan-800 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-cinzel">Team ({selectedHeroes.length}/{PARTY_LIMIT})</h2>
                  <div className="flex gap-4 mt-1">
                      {selectedHeroes.map(h => <span key={h.id} className="text-cyan-400">{h.name}</span>)}
                  </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => setView(GameView.MissionBoard)} variant="secondary">Cancel</Button>
                <Button 
                    onClick={() => startDungeon(selectedHeroes)} 
                    disabled={selectedHeroes.length === 0}
                >
                    Begin Investigation
                </Button>
              </div>
          </div>
      </div>
    </div>
  );
};
