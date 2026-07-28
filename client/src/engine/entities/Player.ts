import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class Player {
  public container: Container;
  public x: number;
  public y: number;
  public classType: string;
  public hp: number = 100;
  public maxHp: number = 100;
  
  private sprite: Graphics;
  private hpBar: Graphics;
  private label: Text;
  private moveSpeed: number;
  private attackRange: number;

  constructor(x: number, y: number, classType: string) {
    this.x = x;
    this.y = y;
    this.classType = classType;

    const colors: Record<string, number> = {
      'DARK_KNIGHT': 0xdc2626,
      'DARK_WIZARD': 0x3b82f6,
      'ELF': 0x10b981
    };

    const labels: Record<string, string> = {
      'DARK_KNIGHT': 'DK',
      'DARK_WIZARD': 'DW',
      'ELF': 'ELF'
    };

    const color = colors[classType] || 0xffffff;

    // Config por classe
    if (classType === 'DARK_KNIGHT') {
      this.moveSpeed = 2;
      this.attackRange = 45;
    } else if (classType === 'DARK_WIZARD') {
      this.moveSpeed = 1;
      this.attackRange = 130;
    } else {
      this.moveSpeed = 1.3;
      this.attackRange = 100;
    }

    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    // Sprite (círculo)
    this.sprite = new Graphics();
    this.sprite.circle(0, 0, 18);
    this.sprite.fill({ color, alpha: 1 });
    this.sprite.circle(0, 0, 18);
    this.sprite.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
    this.container.addChild(this.sprite);

    // Label
    const style = new TextStyle({
      fontSize: 11,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });
    this.label = new Text({ text: labels[classType], style });
    this.label.anchor.set(0.5);
    this.label.y = 0;
    this.container.addChild(this.label);

    // HP Bar
    this.hpBar = new Graphics();
    this.updateHpBar();
    this.container.addChild(this.hpBar);
  }

  private updateHpBar(): void {
    this.hpBar.clear();
    
    // Fundo
    this.hpBar.rect(-15, -28, 30, 4);
    this.hpBar.fill({ color: 0x333333, alpha: 1 });
    
    // HP
    const ratio = this.hp / this.maxHp;
    const color = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.rect(-15, -28, 30 * ratio, 4);
    this.hpBar.fill({ color, alpha: 1 });
  }

  moveTowards(tx: number, ty: number): void {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 2) {
      this.x += (dx / dist) * this.moveSpeed;
      this.y += (dy / dist) * this.moveSpeed;
    }
    
    this.x = Math.max(70, Math.min(730, this.x));
    this.y = Math.max(70, Math.min(430, this.y));
    
    this.container.x = this.x;
    this.container.y = this.y;
  }

  moveAway(tx: number, ty: number): void {
    const dx = this.x - tx;
    const dy = this.y - ty;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.x += (dx / dist) * this.moveSpeed;
      this.y += (dy / dist) * this.moveSpeed;
    }
    
    this.x = Math.max(70, Math.min(730, this.x));
    this.y = Math.max(70, Math.min(430, this.y));
    
    this.container.x = this.x;
    this.container.y = this.y;
  }

  getAttackRange(): number {
    return this.attackRange;
  }

  getClassType(): string {
    return this.classType;
  }

  takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp < 0) this.hp = 0;
    this.updateHpBar();
  }

  isDead(): boolean {
    return this.hp <= 0;
  }
}