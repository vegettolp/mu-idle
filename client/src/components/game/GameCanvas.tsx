import { useEffect, useRef } from 'react';
import { GameEngine } from '../../engine/core/GameEngine';
import { Player } from '../../engine/entities/Player';
import { Monster } from '../../engine/entities/Monster';
import { Graphics } from 'pixi.js';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    const engine = new GameEngine();
    engineRef.current = engine;

    engine.init(containerRef.current).then(() => {
      const stage = engine.getStage();
      
      // Desenhar área de hunt
      const border = new Graphics();
      border.rect(50, 50, 700, 400);
      border.stroke({ width: 2, color: 0x6b21a8 });
      stage.addChild(border);

      // Grid
      const grid = new Graphics();
      for (let x = 50; x <= 750; x += 50) {
        grid.moveTo(x, 50);
        grid.lineTo(x, 450);
      }
      for (let y = 50; y <= 450; y += 50) {
        grid.moveTo(50, y);
        grid.lineTo(750, y);
      }
      grid.stroke({ width: 0.5, color: 0x2a2a4e, alpha: 0.5 });
      stage.addChild(grid);
      
      // Criar jogadores
      const players = [
        new Player(150, 250, 'DARK_KNIGHT'),
        new Player(300, 200, 'DARK_WIZARD'),
        new Player(450, 300, 'ELF')
      ];
      
      players.forEach(p => stage.addChild(p.container));

      // Criar monstros
      const monsters = [
        new Monster(600, 150, 'Aranha', 100),
        new Monster(550, 350, 'Esqueleto', 150),
        new Monster(200, 100, 'Aranha', 100)
      ];
      
      monsters.forEach(m => stage.addChild(m.container));

      // Contadores de ataque
      const attackCooldowns: number[] = [0, 0, 0];
      let frameCount = 0;

      // Game Loop usando Ticker
      engine.app!.ticker.maxFPS = 60;
      
      engine.app!.ticker.add(() => {
        frameCount++;
        
        // ATUALIZAR MONSTROS
        monsters.forEach(monster => {
          if (monster.isDead) {
            monster.updateRespawn();
            return;
          }

          // Encontrar jogador mais próximo
          let closest: Player | null = null;
          let closestDist = Infinity;
          
          players.forEach(p => {
            if (p.isDead()) return;
            const dist = Math.sqrt((p.x - monster.x) ** 2 + (p.y - monster.y) ** 2);
            if (dist < closestDist) {
              closestDist = dist;
              closest = p;
            }
          });

          // Perseguir jogador
          if (closest && closestDist < 200) {
            monster.moveTowards(closest.x, closest.y);
          } else {
            // Movimento aleatório ocasional
            if (frameCount % 120 === 0) {
              const rx = 80 + Math.random() * 640;
              const ry = 80 + Math.random() * 340;
              monster.moveTowards(rx, ry);
            }
          }
        });

        // ATUALIZAR JOGADORES
        players.forEach((player, index) => {
          if (player.isDead()) return;

          // Encontrar monstro mais próximo
          let closest: Monster | null = null;
          let closestDist = Infinity;

          monsters.forEach(m => {
            if (m.isDead) return;
            const dist = Math.sqrt((m.x - player.x) ** 2 + (m.y - player.y) ** 2);
            if (dist < closestDist) {
              closestDist = dist;
              closest = m;
            }
          });

          if (closest) {
            // IA por classe
            const attackRange = player.getAttackRange();
            
            if (player.getClassType() === 'DARK_KNIGHT') {
              // Avança para perto
              if (closestDist > attackRange) {
                player.moveTowards(closest.x, closest.y);
              }
            } else {
              // Mantém distância
              if (closestDist < attackRange - 30) {
                player.moveAway(closest.x, closest.y);
              } else if (closestDist > attackRange + 20) {
                player.moveTowards(closest.x, closest.y);
              }
            }

            // Atacar
            attackCooldowns[index]--;
            if (attackCooldowns[index] <= 0 && closestDist <= attackRange + 15) {
              const damage = 10 + Math.random() * 20;
              closest.takeDamage(damage);
              attackCooldowns[index] = 30; // meio segundo a 60fps
              
              // Efeito de ataque (flash)
              const flash = new Graphics();
              flash.circle(0, 0, 22);
              flash.fill({ color: 0xffffff, alpha: 0.6 });
              player.container.addChild(flash);
              setTimeout(() => flash.destroy(), 150);
            }
          } else {
            // Patrulhar
            if (frameCount % 180 === 0) {
              const rx = 80 + Math.random() * 640;
              const ry = 80 + Math.random() * 340;
              player.moveTowards(rx, ry);
            }
          }
        });
      });

      console.log('✅ Game loop iniciado!');
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }} />;
}