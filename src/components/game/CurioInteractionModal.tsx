import React from 'react';
import { Hero, Curio } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface CurioInteractionModalProps {
    curio: Curio;
    party: Hero[];
    onSelectHero: (hero: Hero) => void;
    onCancel: () => void;
}

export const CurioInteractionModal: React.FC<CurioInteractionModalProps> = ({ curio, party, onSelectHero, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="border-4 border-amber-700 max-w-lg w-full text-center">
                <h2 className="text-3xl font-cinzel text-amber-300">Interact with {curio.name}</h2>
                <p className="my-4 text-stone-400 italic">"{curio.description}"</p>
                <p className="font-bold mb-6">Who should investigate?</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {party.map(hero => (
                        <Button key={hero.id} onClick={() => onSelectHero(hero)} variant="primary">
                           {hero.name}
                        </Button>
                    ))}
                </div>

                <Button onClick={onCancel} variant="secondary">Leave it</Button>
            </Card>
        </div>
    );
};
