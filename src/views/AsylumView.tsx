import React from 'react';
import { GameState, GameView, Hero } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ASYLUM_SLOTS, ASYLUM_TREATMENT_COST, ICONS, ASYLUM_STRESS_HEAL } from '../config/constants';

interface AsylumViewProps {
  setView: (view: GameView) => void;
  gameState: GameState;
  onCommitHero: (hero: Hero) => void;
}

export const AsylumView: React.FC<AsylumViewProps> = ({ setView, gameState, onCommitHero }) => {
    const { roster, asylum, gold } = gameState;
    const asylumHeroIds = new Set(asylum);
    const heroesInAsylum = roster.filter(h => asylumHeroIds.has(h.id));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-cinzel text-cyan-200">Arkham Asylum</h1>
                <Button onClick={() => setView(GameView.Hub)} variant="secondary">Back to Arkham</Button>
            </div>
            <p className="text-stone-400 mb-8 border-t-2 border-b-2 border-stone-800 py-2">A week of 'rest' in the quiet rooms of the asylum can soothe a troubled mind. The treatment is effective, but costly.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Roster List */}
                <div className="md:col-span-2">
                    <Card>
                        <h2 className="text-2xl font-cinzel border-b-2 border-stone-700 pb-2 mb-4">Available Investigators</h2>
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            {roster.map(hero => {
                                const isCommitted = asylumHeroIds.has(hero.id);
                                const canAfford = gold >= ASYLUM_TREATMENT_COST;
                                const hasOpenSlot = asylum.length < ASYLUM_SLOTS;
                                const canCommit = !isCommitted && canAfford && hasOpenSlot;

                                return (
                                    <div key={hero.id} className="bg-stone-900/70 p-3 border border-stone-800 flex justify-between items-center">
                                        <div>
                                            <p className={`font-bold text-lg font-cinzel ${isCommitted ? 'text-stone-500' : 'text-amber-300'}`}>{hero.name}</p>
                                            <p className="text-sm text-stone-400">Lvl {hero.level} {hero.heroClass}</p>
                                            <p className="text-sm text-yellow-400">Stress: {hero.stress}/{hero.maxStress}</p>
                                        </div>
                                        <div>
                                            {isCommitted ? (
                                                <span className="font-bold text-cyan-300">In Treatment</span>
                                            ) : (
                                                <Button onClick={() => onCommitHero(hero)} disabled={!canCommit}>
                                                    Commit
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Asylum Wards */}
                <div className="md:col-span-1">
                     <Card>
                        <h2 className="text-2xl font-cinzel border-b-2 border-stone-700 pb-2 mb-4 flex items-center gap-2">{ICONS.ASYLUM} Asylum Wards</h2>
                        <div className="space-y-3">
                            {Array.from({ length: ASYLUM_SLOTS }).map((_, index) => {
                                const heroInSlot = heroesInAsylum[index];
                                return (
                                    <div key={index} className="bg-stone-950/80 p-3 border border-stone-700 text-center">
                                        <p className="text-stone-500 text-sm">Ward {index + 1}</p>
                                        <p className={`font-cinzel text-xl mt-1 ${heroInSlot ? 'text-cyan-300' : 'text-stone-600'}`}>
                                            {heroInSlot ? heroInSlot.name : '[ Empty ]'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-stone-700 text-sm space-y-2">
                             <p className="flex items-center gap-2"><strong>Treatment Cost:</strong> {ASYLUM_TREATMENT_COST}{ICONS.GOLD}</p>
                             <p className="flex items-center gap-2"><strong>Stress Healed:</strong> {ASYLUM_STRESS_HEAL}{ICONS.SKULL}</p>
                             <p className="flex items-center gap-2"><strong>Duration:</strong> 1 Week</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
