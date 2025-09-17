import React, { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: Direction;
  lastShotTime: number;
}

interface Villager {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  dialogues: string[];
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface DialogueState {
  speaker: string;
  text: string;
}

const TILE_SIZE = 16;
const CANVAS_SCALE = 3;
const MAP_WIDTH = 24;
const MAP_HEIGHT = 18;
const CANVAS_WIDTH = MAP_WIDTH * TILE_SIZE;
const CANVAS_HEIGHT = MAP_HEIGHT * TILE_SIZE;
const BULLET_SPEED = 4.2;

const MAP_BLUEPRINT = [
  'BBBBBBBBBBBBBBBBBBBBBBBB',
  'BTTTTTTTTTTTTTTTTTTTTTB',
  'BTRRRRRRRRRRRRRRRRRRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRGGGGGGGGGGGGGGGGRRTB',
  'BTRRRRRRRRRRRRRRRRRRRTB',
  'BTTTTTTTTTTTTTTTTTTTTTB'
];

const TILE_PALETTE: Record<string, string> = {
  B: '#1d1a29', // building walls
  T: '#2e2c40', // rooftops
  R: '#564a3d', // cobblestone road
  G: '#1f3b2c', // damp grass
};

const WALKABLE_TILES = new Set(['R', 'G']);

const VILLAGERS: Villager[] = [
  {
    id: 'librarian',
    name: 'Ada the Librarian',
    x: 8 * TILE_SIZE,
    y: 8 * TILE_SIZE,
    color: '#ffcc66',
    dialogues: [
      'Whispers from Miskatonic speak of tides that run backward.',
      'You can smell the silt off the Miskatonic if you listen hard enough.',
      'The tomes keep rearranging themselves after midnight.'
    ]
  },
  {
    id: 'longshoreman',
    name: 'Thomas the Longshoreman',
    x: 14 * TILE_SIZE,
    y: 10 * TILE_SIZE,
    color: '#88d8b0',
    dialogues: [
      'Saw lights out on Innsmouth way. Not lanterns—something cold.',
      'Prohibition means nothing when the cult brings their own spirits.',
      'Dock rats went mad last week. Same night the moon turned green.'
    ]
  },
  {
    id: 'newcomer',
    name: 'Eveline the Newcomer',
    x: 6 * TILE_SIZE,
    y: 12 * TILE_SIZE,
    color: '#f2a7d8',
    dialogues: [
      'Arkham feels like the past and future agreed to meet in an alley.',
      'The silver key I found hums whenever someone lies nearby.',
      'Cab driver swore he dropped me off alone. I distinctly remember the gentleman in gray.'
    ]
  }
];

const DIRECTION_VECTORS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

interface GameRef {
  player: Player;
  keys: Set<string>;
  projectiles: Projectile[];
  villagers: Villager[];
  lastFrameTime: number;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dialogue, setDialogue] = useState<DialogueState | null>(null);
  const [mysteryLevel, setMysteryLevel] = useState(12);
  const [shotsFired, setShotsFired] = useState(0);
  const [nearbyVillager, setNearbyVillager] = useState<Villager | null>(null);

  const gameRef = useRef<GameRef>({
    player: {
      x: 10 * TILE_SIZE,
      y: 9 * TILE_SIZE,
      width: 12,
      height: 12,
      speed: 1.6,
      direction: 'down',
      lastShotTime: 0
    },
    keys: new Set(),
    projectiles: [],
    villagers: VILLAGERS,
    lastFrameTime: performance.now()
  });

  const tryTalkToVillager = () => {
    const villager = getVillagerInReach(gameRef.current.player, gameRef.current.villagers);
    if (!villager) {
      setDialogue({ speaker: 'Arkham Gazette', text: 'No one nearby. Only the fog answers you.' });
      return;
    }

    const lines = villager.dialogues;
    const line = lines[Math.floor(Math.random() * lines.length)];
    setDialogue({ speaker: villager.name, text: line });
    setMysteryLevel((level) => Math.min(100, level + 7));
  };

  const shoot = () => {
    const now = performance.now();
    const player = gameRef.current.player;
    if (now - player.lastShotTime < 220) {
      return;
    }

    const dirVector = DIRECTION_VECTORS[player.direction];
    const startX = player.x + player.width / 2;
    const startY = player.y + player.height / 2;
    gameRef.current.projectiles.push({
      x: startX,
      y: startY,
      vx: dirVector.x * BULLET_SPEED,
      vy: dirVector.y * BULLET_SPEED,
      life: 70
    });
    player.lastShotTime = now;
    setShotsFired((count) => count + 1);
    setMysteryLevel((level) => Math.max(0, level - 1));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        gameRef.current.keys.add(event.code);
        event.preventDefault();
      }

      if (event.code === 'Space') {
        event.preventDefault();
        shoot();
      }

      if (event.code === 'KeyE') {
        event.preventDefault();
        tryTalkToVillager();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      gameRef.current.keys.delete(event.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const update = () => {
      const now = performance.now();
      const delta = now - gameRef.current.lastFrameTime;
      gameRef.current.lastFrameTime = now;

      const player = gameRef.current.player;
      const inputVector = getInputVector(gameRef.current.keys);
      if (inputVector.x !== 0 || inputVector.y !== 0) {
        player.direction = getFacingFromVector(inputVector);
      }

      const moveDistance = player.speed * (delta / (1000 / 60));
      if (inputVector.x !== 0 || inputVector.y !== 0) {
        const normalized = normalize(inputVector);
        attemptMove(player, normalized.x * moveDistance, normalized.y * moveDistance);
      }

      updateProjectiles(gameRef.current.projectiles);

      const detected = getVillagerInReach(player, gameRef.current.villagers, TILE_SIZE + 4);
      setNearbyVillager((prev) => {
        if (prev?.id === detected?.id) {
          return prev;
        }
        return detected ?? null;
      });

      drawScene(ctx, gameRef.current.player, gameRef.current.villagers, gameRef.current.projectiles);
      requestAnimationFrame(update);
    };

    gameRef.current.lastFrameTime = performance.now();
    const frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1c1b2b 0%, #050408 85%)',
        color: '#f4f0e6',
        fontFamily: "'Press Start 2P', 'VT323', 'Share Tech Mono', monospace",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 12px'
      }}
    >
      <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', textAlign: 'center' }}>
        Darkest Arkham: Midnight Patrol, 1927
      </h1>
      <p style={{ maxWidth: '720px', textAlign: 'center', lineHeight: 1.5, color: '#c7c0ff' }}>
        Patrol the misted streets of Arkham. Talk with its restless souls, keep the cultists at bay, and steady your nerves
        beneath the gaslights.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          marginTop: '16px'
        }}
      >
        <div
          style={{
            position: 'relative',
            border: '4px solid #2d2545',
            backgroundColor: '#050408',
            boxShadow: '0 0 24px rgba(29, 23, 54, 0.8)',
            transform: 'translateZ(0)',
            overflow: 'hidden'
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              width: CANVAS_WIDTH * CANVAS_SCALE,
              height: CANVAS_HEIGHT * CANVAS_SCALE,
              imageRendering: 'pixelated',
              display: 'block'
            }}
          />
          {nearbyVillager && (
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                padding: '6px 10px',
                backgroundColor: 'rgba(10, 8, 20, 0.82)',
                color: '#d6f5ff',
                fontSize: '0.7rem',
                border: '2px solid #2d92a3'
              }}
            >
              Press <span style={{ color: '#ffde69' }}>E</span> to speak with {nearbyVillager.name}
            </div>
          )}
        </div>
        <div
          style={{
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: 'rgba(12, 11, 20, 0.88)',
            border: '2px solid #2a2440',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <section>
            <h2 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#ffde69' }}>Controls</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', lineHeight: 1.6 }}>
              <li>Move with Arrow Keys or WASD</li>
              <li>Press Space to fire your sidearm</li>
              <li>Press E to speak with nearby townsfolk</li>
            </ul>
          </section>
          <section>
            <h2 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#ffde69' }}>Investigation Log</h2>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Mystery Level: {mysteryLevel}%</p>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Shots Fired: {shotsFired}</p>
            <p style={{ fontSize: '0.75rem', margin: 0, color: '#9fbad1' }}>
              The higher the mystery climbs, the stranger Arkham feels. Talking reveals secrets; gunfire keeps dread at bay.
            </p>
          </section>
          <section>
            <h2 style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#ffde69' }}>Night Dispatch</h2>
            <p style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
              Fog rolls down from the Miskatonic River, muting jazz clubs and sirens alike. Somewhere between the speakeasies
              and silent churches, cultists prepare their midnight rites. Keep walking, detective.
            </p>
          </section>
        </div>
      </div>
      {dialogue && (
        <div
          onClick={() => setDialogue(null)}
          role="button"
          tabIndex={0}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(8, 6, 14, 0.92)',
            border: '2px solid #2d92a3',
            padding: '16px 18px',
            width: 'min(540px, 90vw)',
            cursor: 'pointer',
            boxShadow: '0 0 18px rgba(38, 107, 134, 0.45)'
          }}
        >
          <p style={{ fontSize: '0.7rem', color: '#8dd9ff', marginBottom: '6px' }}>{dialogue.speaker}</p>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>{dialogue.text}</p>
          <p style={{ fontSize: '0.6rem', marginTop: '8px', color: '#666c88' }}>Click anywhere on this panel to dismiss.</p>
        </div>
      )}
    </div>
  );
};

function getInputVector(keys: Set<string>) {
  let x = 0;
  let y = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
  return { x, y };
}

function getFacingFromVector(vector: { x: number; y: number }): Direction {
  if (Math.abs(vector.x) > Math.abs(vector.y)) {
    return vector.x > 0 ? 'right' : 'left';
  }
  if (vector.y !== 0) {
    return vector.y > 0 ? 'down' : 'up';
  }
  return 'down';
}

function normalize(vector: { x: number; y: number }) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function attemptMove(player: Player, dx: number, dy: number) {
  const nextX = clamp(player.x + dx, 0, CANVAS_WIDTH - player.width);
  const nextY = clamp(player.y + dy, 0, CANVAS_HEIGHT - player.height);

  if (isAreaWalkable(nextX, player.y, player.width, player.height)) {
    player.x = nextX;
  }

  if (isAreaWalkable(player.x, nextY, player.width, player.height)) {
    player.y = nextY;
  }
}

function isAreaWalkable(x: number, y: number, width: number, height: number) {
  const left = Math.floor(x / TILE_SIZE);
  const right = Math.floor((x + width - 1) / TILE_SIZE);
  const top = Math.floor(y / TILE_SIZE);
  const bottom = Math.floor((y + height - 1) / TILE_SIZE);

  for (let tileY = top; tileY <= bottom; tileY += 1) {
    for (let tileX = left; tileX <= right; tileX += 1) {
      if (!isTileWalkable(tileX, tileY)) {
        return false;
      }
    }
  }
  return true;
}

function isTileWalkable(tileX: number, tileY: number) {
  if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
    return false;
  }
  const tile = MAP_BLUEPRINT[tileY][tileX];
  return WALKABLE_TILES.has(tile);
}

function updateProjectiles(projectiles: Projectile[]) {
  for (const projectile of projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.life -= 1;
  }

  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    if (
      projectile.life <= 0 ||
      projectile.x < 0 ||
      projectile.y < 0 ||
      projectile.x > CANVAS_WIDTH ||
      projectile.y > CANVAS_HEIGHT
    ) {
      projectiles.splice(i, 1);
    }
  }
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  player: Player,
  villagers: Villager[],
  projectiles: Projectile[]
) {
  ctx.fillStyle = '#050408';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const tileCode = MAP_BLUEPRINT[y][x];
      ctx.fillStyle = TILE_PALETTE[tileCode] ?? '#000';
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Street lamps
  ctx.fillStyle = 'rgba(255, 214, 120, 0.18)';
  ctx.beginPath();
  ctx.arc(6 * TILE_SIZE + 8, 4 * TILE_SIZE + 8, 30, 0, Math.PI * 2);
  ctx.arc(16 * TILE_SIZE + 8, 13 * TILE_SIZE + 8, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#44344f';
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);

  ctx.fillStyle = '#c9443b';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#221722';
  ctx.fillRect(player.x + 3, player.y + 3, player.width - 6, player.height - 6);

  villagers.forEach((villager) => {
    ctx.fillStyle = '#050408';
    ctx.fillRect(villager.x - 2, villager.y - 6, 16, 20);
    ctx.fillStyle = villager.color;
    ctx.fillRect(villager.x, villager.y - 4, 12, 16);
    ctx.fillStyle = '#08070f';
    ctx.fillRect(villager.x + 4, villager.y + 4, 4, 4);
  });

  ctx.fillStyle = '#ffefb6';
  projectiles.forEach((projectile) => {
    ctx.fillRect(projectile.x - 2, projectile.y - 2, 4, 4);
  });

  ctx.strokeStyle = 'rgba(98, 183, 230, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, CANVAS_WIDTH - 1, CANVAS_HEIGHT - 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getVillagerInReach(player: Player, villagers: Villager[], reach = TILE_SIZE): Villager | null {
  for (const villager of villagers) {
    const dx = player.x + player.width / 2 - (villager.x + 6);
    const dy = player.y + player.height / 2 - (villager.y + 4);
    const distance = Math.hypot(dx, dy);
    if (distance <= reach) {
      return villager;
    }
  }
  return null;
}

export default App;
