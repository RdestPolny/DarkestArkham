import React, { useMemo } from 'react';
import { DungeonMap, DungeonNode } from '../../types';

interface MinimapProps {
  dungeonMap: DungeonMap;
  currentNodeId: string;
  visitedNodes: Set<string>;
}

type NodePosition = { x: number; y: number; id: string; node: DungeonNode };

// This logic correctly maps the graph structure to a 2D grid, so it will be kept.
const getNodePositions = (dungeonMap: DungeonMap): NodePosition[] => {
    const startNode = Object.values(dungeonMap).find(n => n.type === 'start' || n.id === 'start');
    if (!startNode) return [];

    const positions: { [id: string]: { x: number; y: number } } = {};
    const queue: { id: string; x: number; y: number }[] = [{ id: startNode.id, x: 0, y: 0 }];
    const visited = new Set<string>([startNode.id]);

    while (queue.length > 0) {
        const { id, x, y } = queue.shift()!;
        positions[id] = { x, y };
        const currentNode = dungeonMap[id];

        Object.entries(currentNode.exits).forEach(([dir, neighborId]) => {
            if (neighborId && !visited.has(neighborId) && dungeonMap[neighborId]) {
                visited.add(neighborId);
                let nx = x, ny = y;
                // Corridors and rooms are treated as alternating steps, so a room is 2 units away from the next room.
                const nextNode = dungeonMap[neighborId];
                if (currentNode.type === 'room' && nextNode.type === 'corridor') {
                    switch (dir) {
                        case 'right': nx++; break; case 'left': nx--; break; case 'down': ny++; break; case 'up': ny--; break;
                    }
                } else if (currentNode.type === 'corridor' && nextNode.type === 'room') {
                     switch (dir) {
                        case 'right': nx++; break; case 'left': nx--; break; case 'down': ny++; break; case 'up': ny--; break;
                    }
                }
                
                queue.push({ id: neighborId, x: nx, y: ny });
            }
        });
    }
    
    const allX = Object.values(positions).map(p => p.x);
    const allY = Object.values(positions).map(p => p.y);
    const minX = Math.min(...allX);
    const minY = Math.min(...allY);

    return Object.entries(positions).map(([id, pos]) => ({
        x: pos.x - minX,
        y: pos.y - minY,
        id,
        node: dungeonMap[id],
    }));
};


export const Minimap: React.FC<MinimapProps> = ({ dungeonMap, currentNodeId, visitedNodes }) => {
    const nodePositions = useMemo(() => getNodePositions(dungeonMap), [dungeonMap]);

    const { grid, gridWidth, gridHeight, posMap } = useMemo(() => {
        if (nodePositions.length === 0) return { grid: [], gridWidth: 0, gridHeight: 0, posMap: {} };

        const positionsMap = nodePositions.reduce((acc, pos) => {
            acc[pos.id] = pos;
            return acc;
        }, {} as { [id: string]: NodePosition });

        const allX = nodePositions.map(p => p.x);
        const allY = nodePositions.map(p => p.y);
        const width = Math.max(...allX) + 1;
        const height = Math.max(...allY) + 1;

        return { grid: nodePositions, gridWidth: width, gridHeight: height, posMap: positionsMap };
    }, [nodePositions]);
    
    const visibleNodes = useMemo(() => {
        const newVisible = new Set(visitedNodes);
        newVisible.add(currentNodeId); // Always show current node

        // From every visited node, show its direct neighbors to reveal possible paths.
        for (const nodeId of visitedNodes) {
            const node = dungeonMap[nodeId];
            if (node?.exits) {
                for (const neighborId of Object.values(node.exits)) {
                    if(neighborId && dungeonMap[neighborId]) { // Check if neighbor exists in map
                        newVisible.add(neighborId);
                    }
                }
            }
        }
        return newVisible;
    }, [visitedNodes, currentNodeId, dungeonMap]);
    
    if (grid.length === 0) {
        return <div className="w-full flex-grow bg-stone-900 border-2 border-stone-700 flex items-center justify-center"><p className="text-stone-500">No Map Data</p></div>;
    }

    return (
        <div className="w-full p-2 bg-stone-950/80 border-2 border-stone-700 shadow-lg flex items-center justify-center aspect-video">
            <div
                className="grid relative"
                style={{
                    gridTemplateColumns: `repeat(${gridWidth}, 0.8rem)`,
                    gridTemplateRows: `repeat(${gridHeight}, 0.8rem)`,
                    gap: '0.2rem'
                }}
            >
                {/* Render connections first (z-index) */}
                {grid.filter(p => p.node.type === 'room').map(({ id, x, y, node }) => {
                     if (!visibleNodes.has(id)) return null;

                     return Object.values(node.exits).map(corridorId => {
                         if (!corridorId || !posMap[corridorId] || !visibleNodes.has(corridorId)) return null;
                         
                         const corridorPos = posMap[corridorId];
                         const roomAfterCorridorId = Object.values(corridorPos.node.exits).find(nextId => nextId !== id);
                         
                         if (!roomAfterCorridorId || !posMap[roomAfterCorridorId]) return null;

                         const endRoomPos = posMap[roomAfterCorridorId];

                         const isVisitedConnection = visitedNodes.has(id) && visitedNodes.has(roomAfterCorridorId);
                         
                         return (
                            <div key={`${id}-${endRoomPos.id}`}
                                className="absolute bg-stone-600"
                                style={{
                                    left: `calc(${(Math.min(x, endRoomPos.x) * 1) + 0.4}rem)`,
                                    top: `calc(${(Math.min(y, endRoomPos.y) * 1) + 0.4}rem)`,
                                    width: x === endRoomPos.x ? '0.2rem' : '1.2rem',
                                    height: y === endRoomPos.y ? '0.2rem' : '1.2rem',
                                    backgroundColor: isVisitedConnection ? '#a3e635' : '#78716c', // lime-400 : stone-500
                                }}
                            />
                         );
                     });
                })}

                {/* Render nodes (rooms and corridors) */}
                {grid.map(({ id, x, y, node }) => {
                    if (!visibleNodes.has(id)) return null;
                    
                    const isCurrent = id === currentNodeId;
                    const isVisited = visitedNodes.has(id);

                    let tileClasses = 'w-full h-full transition-all duration-200 ring-offset-2 ring-offset-stone-950 z-10 ';

                    if (node.type === 'room') {
                        tileClasses += 'rounded-sm ';
                        if (isCurrent) {
                            tileClasses += 'bg-cyan-400 ring-2 ring-cyan-200 animate-pulse';
                        } else if (isVisited) {
                            tileClasses += 'bg-lime-600';
                        } else {
                            tileClasses += 'bg-stone-700 opacity-50'; // Unvisited but visible room
                        }
                    } else { // Corridor
                         tileClasses += 'rounded-full scale-75 '; // smaller circle for corridor
                        if (isCurrent) {
                            tileClasses += 'bg-cyan-300 ring-2 ring-cyan-200 animate-pulse';
                        } else if (isVisited) {
                            tileClasses += 'bg-lime-500';
                        } else {
                            tileClasses += 'bg-stone-600'; // Unvisited but visible corridor
                        }
                    }


                    return (
                        <div
                            key={id}
                            style={{ gridColumn: x + 1, gridRow: y + 1 }}
                            className="relative flex items-center justify-center"
                        >
                            <div className={tileClasses}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};