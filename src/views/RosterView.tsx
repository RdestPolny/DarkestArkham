import React, { useState } from 'react';
import { GameState, GameView, Hero, Item, ItemSlot } from '../types';
import { Button } from '../components/common/Button';
import { CharacterCard } from '../components/game/CharacterCard';
import { DismissConfirmationModal } from '../components/game/DismissConfirmationModal';
import { InventoryPanel } from '../components/game/InventoryPanel';

interface RosterViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  updateGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const RosterView: React.FC<RosterViewProps> = ({ setView, gameState, updateGameState }) => {
  const [heroToDismiss, setHeroToDismiss] = useState<Hero | null>(null);
  const [equippingState, setEquippingState] = useState<{ hero: Hero; slotIndex: number; slotType: ItemSlot; } | null>(null);

  const handleDismiss = (hero: Hero) => {
    setHeroToDismiss(hero);
  };

  const confirmDismiss = () => {
    if (!heroToDismiss) return;
    updateGameState(prev => ({
      ...prev,
      roster: prev.roster.filter(h => h.id !== heroToDismiss.id)
    }));
    setHeroToDismiss(null);
  };

  const cancelDismiss = () => {
    setHeroToDismiss(null);
  };
  
  const handleStartEquip = (hero: Hero, slotType: ItemSlot, slotIndex: number) => {
    setEquippingState({ hero, slotType, slotIndex });
  };

  const handleCancelEquip = () => {
    setEquippingState(null);
  };

  const handleEquipItem = (itemToEquip: Item) => {
    if (!equippingState) return;

    const { hero, slotIndex } = equippingState;
    const oldItem = hero.items[slotIndex]; // Should be null, but good practice

    updateGameState(prev => {
        const newRoster = prev.roster.map(h => {
            if (h.id === hero.id) {
                const newItems = [...h.items] as (Item | null)[];
                newItems[slotIndex] = itemToEquip;
                return { ...h, items: newItems };
            }
            return h;
        });

        let newInventory = prev.inventory.filter(i => i.id !== itemToEquip.id);
        if (oldItem) {
            newInventory.push(oldItem);
        }

        return { ...prev, roster: newRoster, inventory: newInventory };
    });

    setEquippingState(null);
  };

  const handleUnequipItem = (hero: Hero, slotIndex: number) => {
    const itemToUnequip = hero.items[slotIndex];
    if (!itemToUnequip) return;

    updateGameState(prev => {
        const newRoster = prev.roster.map(h => {
            if (h.id === hero.id) {
                const newItems = [...h.items] as (Item | null)[];
                newItems[slotIndex] = null;
                return { ...h, items: newItems };
            }
            return h;
        });
        const newInventory = [...prev.inventory, itemToUnequip];
        return { ...prev, roster: newRoster, inventory: newInventory };
    });
  };

  return (
    <div className="p-8 max-w-[100rem] mx-auto">
      {heroToDismiss && <DismissConfirmationModal hero={heroToDismiss} onConfirm={confirmDismiss} onCancel={cancelDismiss} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-cinzel">Investigator Roster & Inventory</h1>
        <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
      </div>
      <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">Here lie the brave, foolish, or desperate souls who have answered the call. Manage their gear and send them into the fray.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            {gameState.roster.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {gameState.roster.map(hero => (
                        <CharacterCard 
                            key={hero.id} 
                            hero={hero}
                            onStartEquip={handleStartEquip}
                            onUnequipItem={handleUnequipItem}
                            isSelected={equippingState?.hero.id === hero.id}
                        >
                            <div className="flex justify-end">
                                <Button onClick={() => handleDismiss(hero)} variant="danger">
                                    Dismiss
                                </Button>
                            </div>
                        </CharacterCard>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 col-span-full">
                    <p className="text-2xl text-stone-500 font-cinzel">Your roster is empty.</p>
                    <p className="text-stone-400 mt-2">Visit the Recruitment Office to hire new investigators.</p>
                </div>
            )}
        </div>
        
        <div className="lg:col-span-1">
            <InventoryPanel
                inventory={gameState.inventory}
                equippingState={equippingState}
                onEquipItem={handleEquipItem}
                onCancelEquip={handleCancelEquip}
            />
        </div>
      </div>
    </div>
  );
};