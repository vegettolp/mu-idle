import { Application, Container } from 'pixi.js';

export class GameEngine {
  public app: Application | null = null;
  private container: Container | null = null;
  private running: boolean = false;

  async init(htmlContainer: HTMLElement): Promise<void> {
    // Criar aplicação PixiJS v8
    this.app = new Application();
    
    await this.app.init({
      width: 800,
      height: 500,
      background: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    htmlContainer.appendChild(this.app.canvas);

    this.container = new Container();
    this.app.stage.addChild(this.container);
    this.running = true;

    console.log('✅ PixiJS iniciado com sucesso!');
  }

  getStage(): Container {
    return this.container!;
  }

  destroy(): void {
    this.running = false;
    this.app?.destroy(true);
  }
}