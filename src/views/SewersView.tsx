import React, { useEffect } from 'react';
import { GameState, GameView, Item } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { generateItems } from '../services/gameContentService';
import { ICONS } from '../config/constants';

interface SewersViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  updateGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const SewersView: React.FC<SewersViewProps> = ({ setView, gameState, updateGameState }) => {

  useEffect(() => {
    if (gameState.sewersShopItems.length === 0) {
        const newItems = generateItems(4);
        updateGameState(prev => ({...prev, sewersShopItems: newItems}));
    }
  }, [gameState.week, gameState.sewersShopItems.length, updateGameState]);

  const handleBuy = (item: Item) => {
    if (gameState.gold >= item.cost) {
      updateGameState(prev => ({
        ...prev,
        gold: prev.gold - item.cost,
        inventory: [...prev.inventory, item],
        sewersShopItems: prev.sewersShopItems.filter(i => i.id !== item.id)
      }));
    }
  };
  
  const getEffectString = (item: Item) => {
    return Object.entries(item.effects)
      .map(([key, value]) => `${value > 0 ? '+' : ''}${value} ${key}`)
      .join(', ');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-cinzel text-green-400">The Old Sewers</h1>
        <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
      </div>
      <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">A shadowy figure offers wares recovered from the depths. Best not to ask where they came from.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gameState.sewersShopItems.map(item => (
              <Card key={item.id} className="flex flex-col justify-between">
                  <div>
                      <h3 className="text-xl font-cinzel text-cyan-300">{item.name}</h3>
                      <p className="text-sm text-stone-500 capitalize mb-2">{item.slot}</p>
                      <p className="text-stone-400 italic text-sm mb-4">"{item.description}"</p>
                      <p className="font-bold text-amber-300 mb-4">{getEffectString(item)}</p>
                  </div>
                  <Button
                      onClick={() => handleBuy(item)}
                      disabled={gameState.gold < item.cost}
                  >
                      Buy ({item.cost}{ICONS.GOLD})
                  </Button>
              </Card>
          ))}
          {gameState.sewersShopItems.length === 0 && <p className="col-span-full text-center text-stone-500 text-xl">The merchant has nothing left to sell this week.</p>}
      </div>
    </div>
  );
};
