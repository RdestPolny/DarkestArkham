import React from 'react';
import { Item, Hero, ItemSlot } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface InventoryPanelProps {
    inventory: Item[];
    equippingState: { hero: Hero; slotType: ItemSlot; } | null;
    onEquipItem: (item: Item) => void;
    onCancelEquip: () => void;
}

const getEffectString = (item: Item) => {
    const keyMap: Record<string, string> = {
        damage: 'DMG',
        defense: 'DEF',
        dodge: 'DODGE',
        critChance: 'CRIT',
        perception: 'PER',
        wisdom: 'WIS'
    };

    return Object.entries(item.effects)
      .map(([key, value]) => {
          const abbr = keyMap[key] || key.substring(0,3).toUpperCase();
          return `${value > 0 ? '+' : ''}${value} ${abbr}`;
      })
      .join(', ');
};

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, equippingState, onEquipItem, onCancelEquip }) => {
    
    return (
        <Card className="sticky top-24">
            <h2 className="text-2xl font-cinzel border-b-2 border-stone-700 pb-2 mb-4">Inventory</h2>

            {equippingState && (
                <div className="bg-cyan-900/30 border border-cyan-700 p-3 mb-4 text-center">
                    <p className="font-bold">Equipping <span className="text-cyan-300 capitalize">{equippingState.slotType}</span> for</p>
                    <p className="text-amber-300 font-cinzel text-lg">{equippingState.hero.name}</p>
                    <Button onClick={onCancelEquip} variant="secondary" className="mt-2 text-xs px-2 py-1">Cancel</Button>
                </div>
            )}

            {inventory.length > 0 ? (
                <ul className="space-y-2 max-h-[65vh] overflow-y-auto pr-2">
                    {inventory.map(item => {
                        const isCompatible = equippingState && item.slot === equippingState.slotType;
                        const canEquip = equippingState && isCompatible;

                        return (
                            <li 
                                key={item.id}
                                onClick={() => canEquip && onEquipItem(item)}
                                className={`p-3 border border-stone-800 transition-all duration-200
                                    ${equippingState && !isCompatible ? 'opacity-30' : ''}
                                    ${canEquip ? 'bg-green-900/50 border-green-600 hover:border-green-400 cursor-pointer' : 'bg-stone-900/50'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-amber-300">{item.name}</h3>
                                    <span className="text-xs text-stone-500 capitalize">{item.slot}</span>
                                </div>
                                <p className="text-sm italic text-stone-400 my-1">"{item.description}"</p>
                                <p className="font-bold text-green-400 text-sm">{getEffectString(item)}</p>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-stone-500">Your inventory is empty.</p>
                </div>
            )}
        </Card>
    );
};