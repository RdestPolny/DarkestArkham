import React, { useMemo } from 'react';
import { Hero, HeroAttributes, ItemSlot } from '../../types';
import { Card } from '../common/Card';
import { ICONS } from '../../config/constants';

interface CharacterCardProps {
  hero: Hero;
  children?: React.ReactNode;
  isSelected?: boolean;
  onStartEquip?: (hero: Hero, slot: ItemSlot, slotIndex: number) => void;
  onUnequipItem?: (hero: Hero, slotIndex: number) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ hero, children, isSelected = false, onStartEquip, onUnequipItem }) => {
    const stressPercentage = (hero.stress / hero.maxStress) * 100;
    const xpPercentage = (hero.xp / hero.xpToNextLevel) * 100;

    const calculatedStats = useMemo(() => {
        const finalStats: HeroAttributes = {
          damage: hero.damage,
          defense: hero.defense,
          dodge: hero.dodge,
          critChance: hero.critChance,
          perception: hero.perception,
          wisdom: hero.wisdom,
        };
    
        hero.items.forEach(item => {
          if (item?.effects) {
            for (const [effect, value] of Object.entries(item.effects)) {
              const key = effect as keyof HeroAttributes;
              // FIX: Added a check to ensure the value is a number before performing addition.
              if (key in finalStats && typeof value === 'number') {
                finalStats[key] += value;
              }
            }
          }
        });
    
        return finalStats;
    }, [hero]);

    return (
        <Card className={`flex flex-col justify-between border-4 transition-all duration-200 ${isSelected ? 'border-amber-500 scale-105' : 'border-stone-800 hover:border-stone-600'}`}>
            <div>
                <div className="flex justify-between items-center border-b-2 border-stone-700 pb-2 mb-2">
                    <h3 className="text-xl font-cinzel text-amber-300">{hero.name}</h3>
                    <span className="text-sm text-stone-400">Lvl {hero.level} {hero.heroClass}</span>
                </div>

                <div className="space-y-1 text-sm mb-4">
                    <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center">{ICONS.HEART} <span className="ml-2">HP:</span></span>
                        <span>{hero.hp} / {hero.maxHp}</span>
                    </div>
                    <div className="w-full bg-red-900/50 border border-red-800 h-2">
                        <div className="bg-green-500 h-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                        <span className="font-bold flex items-center">{ICONS.SKULL} <span className="ml-2">Stress:</span></span>
                        <span>{hero.stress} / {hero.maxStress}</span>
                    </div>
                    <div className="w-full bg-stone-700 border border-stone-600 h-2">
                        <div className="bg-amber-400 h-full" style={{ width: `${stressPercentage}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <span className="font-bold flex items-center">{ICONS.XP} <span className="ml-2">XP:</span></span>
                        <span>{hero.xp} / {hero.xpToNextLevel}</span>
                    </div>
                    <div className="w-full bg-purple-900/50 border border-purple-800 h-2">
                        <div className="bg-purple-400 h-full" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>
                
                <p className="text-stone-400 italic text-sm mb-4">"{hero.backstory}"</p>

                <div className="pt-2 border-t border-stone-700 text-xs space-y-3">
                    <div>
                        <h4 className="font-cinzel text-sm text-stone-300 mb-1">Attributes</h4>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-stone-400">
                            <span>DMG: <span className="font-bold text-stone-200">{calculatedStats.damage}</span></span>
                            <span>DEF: <span className="font-bold text-stone-200">{calculatedStats.defense}</span></span>
                            <span>DODGE: <span className="font-bold text-stone-200">{calculatedStats.dodge}%</span></span>
                            <span>CRIT: <span className="font-bold text-stone-200">{calculatedStats.critChance}%</span></span>
                            <span>PER: <span className="font-bold text-stone-200">{calculatedStats.perception}</span></span>
                            <span>WIS: <span className="font-bold text-stone-200">{calculatedStats.wisdom}</span></span>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-cinzel text-sm text-stone-300 mb-1">Skills</h4>
                        <ul className="text-stone-400 space-y-1">
                            {hero.skills.map(skill => (
                                <li key={skill.name} title={skill.description} className="truncate cursor-help bg-stone-950/50 px-2 py-1 border border-stone-800">
                                    {skill.name} <span className="text-stone-500">(Lvl {skill.level})</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-cinzel text-sm text-stone-300 mb-1">Equipment</h4>
                        <div className="space-y-1 text-xs">
                             {[0, 1, 2].map((index) => {
                                const item = hero.items[index];
                                return (
                                    <div key={index} className="flex justify-between items-center bg-stone-950/50 px-2 py-1 border border-stone-800">
                                        <span className="capitalize text-stone-500">Trinket {index + 1}:</span>
                                        {item ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-300 truncate" title={item.description}>{item.name}</span>
                                                {onUnequipItem && (
                                                    <button onClick={() => onUnequipItem(hero, index)} className="text-red-500 hover:text-red-300 font-bold" aria-label={`Unequip ${item.name}`}>×</button>
                                                )}
                                            </div>
                                        ) : (
                                            <button onClick={() => onStartEquip?.(hero, 'trinket', index)} disabled={!onStartEquip} className="text-stone-400 hover:text-white disabled:text-stone-600 disabled:cursor-not-allowed">
                                                [ Equip ]
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {children && <div className="mt-4 pt-4 border-t-2 border-stone-700">{children}</div>}
        </Card>
    );
};
