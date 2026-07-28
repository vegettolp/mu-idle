import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export class Monster {
  public container: Container;
  public x: number;
  public y: number;
  public name: string;
  public hp: number;
  public maxHp: number;
  public isDead: boolean = false;
  
  private hpBar: Graphics;
  private hpText: Text;
  private nameText: Text;
  private moveSpeed: number;
  private respawnTimer: number = 0;

  constructor(x: number, y: number, name: string, hp: number) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.moveSpeed = 0.3 + Math.random() * 0.4;

    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    // Corpo
    const body = new Graphics();
    body.roundRect(-15, -15, 30, 30, 5);
    body.fill({ color: 0x555555, alpha: 1 });
    body.roundRect(-15, -15, 30, 30, 5);
    body.stroke({ width: 1, color: 0x888888, alpha: 1 });
    this.container.addChild(body);

    // Olhos
    const eye1 = new Graphics();
    eye1.circle(-5, -5, 3);
    eye1.fill({ color: 0xff0000, alpha: 1 });
    this.container.addChild(eye1);
    
    const eye2 = new Graphics();
    eye2.circle(5, -5, 3);
    eye2.fill({ color: 0xff0000, alpha: 1 });
    this.container.addChild(eye2);

    // Nome
    const nameStyle = new TextStyle({
      fontSize: 10,
      fill: '#ff6666',
      fontFamily: 'Arial'
    });
    this.nameText = new Text({ text: name, style: nameStyle });
    this.nameText.anchor.set(0.5);
    this.nameText.y = -22;
    this.container.addChild(this.nameText);

    // HP Text
    const hpStyle = new TextStyle({
      fontSize: 9,
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    this.hpText = new Text({ text: `${hp}/${hp}`, style: hpStyle });
    this.hpText.anchor.set(0.5);
    this.hpText.y = -33;
    this.container.addChild(this.hpText);

    // HP Bar
    this.hpBar = new Graphics();
    this.updateHpBar();
    this.container.addChild(this.hpBar);
  }

  private updateHpBar(): void {
    this.hpBar.clear();
    
    this.hpBar.rect(-15, -38, 30, 3);
    this.hpBar.fill({ color: 0x333333, alpha: 1 });
    
    const ratio = this.hp / this.maxHp;
    const color = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.rect(-15, -38, 30 * ratio, 3);
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

  takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp < 0) this.hp = 0;
    
    this.hpText.text = `${Math.floor(this.hp)}/${this.maxHp}`;
    this.updateHpBar();

    if (this.hp <= 0) {
      this.isDead = true;
      this.container.visible = false;
      this.respawnTimer = 300; // 5 segundos
    }
  }

  updateRespawn(): void {
    if (this.isDead) {
      this.respawnTimer--;
      if (this.respawnTimer <= 0) {
        this.isDead = false;
        this.hp = this.maxHp;
        this.container.visible = true;
        this.x = 100 + Math.random() * 600;
        this.y = 100 + Math.random() * 300;
        this.container.x = this.x;
        this.container.y = this.y;
        this.hpText.text = `${Math.floor(this.hp)}/${this.maxHp}`;
        this.updateHpBar();
      }
    }
  }
}