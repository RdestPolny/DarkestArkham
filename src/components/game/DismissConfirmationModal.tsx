import React from 'react';
import { Hero } from '../../types';
import { Button } from '../common/Button';

export const DismissConfirmationModal: React.FC<{ hero: Hero; onConfirm: () => void; onCancel: () => void; }> = ({ hero, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-stone-900 border-4 border-red-800 p-8 text-center shadow-2xl shadow-black">
            <h2 className="text-3xl font-cinzel text-red-400">Dismiss Investigator?</h2>
            <p className="my-4 text-stone-300">
                Are you sure you want to permanently dismiss <span className="font-bold text-amber-300">{hero.name}</span>?
                <br/>
                This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-6">
                <Button onClick={onCancel} variant="secondary">Cancel</Button>
                <Button onClick={onConfirm} variant="danger">Confirm Dismissal</Button>
            </div>
        </div>
    </div>
);
