/**
 * Boss Fights - Web Version
 * Translated from pygame to JavaScript/Canvas
 */

// ============= CONFIGURATION =============
const CONFIG = {
  electric: { stun_seconds: 0.7, base_damage: 45 },
  wind: { push_strength: 20, base_damage: 12 },
  fire: { burn_seconds: 3, burn_dps: 2.0, base_damage: 18 },
  poison: { poison_seconds: 6, poison_dps: 1.0, base_damage: 10 },
};

const MINION_LIMITS = { Aquila: 1, CerberusHead: 3 };

const BOSS_HP_BARS = {
  Zeus: { frame: 'Zeus HP Bar Frame.png', fill: 'Zeus HP Bar.png' },
};

// ============= UTILITY FUNCTIONS =============
const FPS = 60;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `assets/${src}`;
  });
}

function rectCircleCollide(rect, cx, cy, radius) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

// ============= PLAYER CLASS =============
class Player {
  constructor(screenWidth, screenHeight) {
    this.x = screenWidth / 2;
    this.y = screenHeight * 0.8;
    this.radius = Math.max(8, Math.floor(screenWidth * 0.012));
    this.speed = Math.max(5, Math.floor(screenWidth * 0.015));
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.attackGauge = 0;
    this.statuses = {};
    this.playerTurn = false;
  }

  move(dx, screenWidth) {
    if (this.isStunned() || this.playerTurn) return;
    this.x += dx;
    this.x = Math.max(this.radius, Math.min(screenWidth - this.radius, this.x));
  }

  moveVertical(dy, screenHeight) {
    if (this.isStunned() || this.playerTurn) return;
    this.y += dy;
    this.y = Math.max(this.radius, Math.min(screenHeight - this.radius, this.y));
  }

  addStatus(name, durationFrames, dps = 0, meta = {}) {
    this.statuses[name] = { remaining: durationFrames, dps, acc: 0, meta };
  }

  isStunned() {
    return this.statuses.stun && this.statuses.stun.remaining > 0;
  }

  updateStatuses() {
    const toRemove = [];
    for (const [name, s] of Object.entries(this.statuses)) {
      if (s.dps > 0) {
        this.hp -= s.dps / FPS;
      }
      s.remaining--;
      if (s.remaining <= 0) toRemove.push(name);
    }
    toRemove.forEach(n => delete this.statuses[n]);
  }

  draw(ctx) {
    // Draw player line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(ctx.canvas.width, this.y);
    ctx.stroke();

    // Draw player circle with glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

// ============= ATTACK BASE CLASS =============
class Attack {
  constructor(name, elementType = 'physical', damage = 10) {
    this.name = name;
    this.elementType = elementType;
    this.damage = damage;
    this.chargeTime = 30;
    this.activeTime = 60;
    this.timer = 0;
    this.state = 'charging';
    this.rect = { x: 0, y: 0, width: 0, height: 0 };
    this.maxNumber = 1;
    this.tracking = false;
    this.homing = false;
    this.pos = { x: 0, y: 0 };
    this.speed = 0;
    this.chargeImage = null;
    this.attackImage = null;
  }

  spawn(game) {
    this.timer = this.chargeTime;
    this.state = 'charging';
  }

  update(game) {
    if (this.state === 'charging') {
      this.timer--;
      if (this.timer <= 0) {
        this.state = 'active';
        this.timer = this.activeTime;
      }
    } else if (this.state === 'active') {
      this.timer--;
      if (this.timer <= 0) {
        this.state = 'finished';
      }
    }
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    } else if (this.state === 'active') {
      if (this.attackImage) {
        ctx.drawImage(this.attackImage, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      } else {
        ctx.fillStyle = 'rgba(200, 50, 20, 0.8)';
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      }
    }
  }

  checkCollision(player) {
    return rectCircleCollide(this.rect, player.x, player.y, player.radius);
  }

  isFinished() {
    return this.state === 'finished';
  }

  applyToPlayer(player, game) {
    player.hp -= this.damage;

    if (this.elementType === 'electric') {
      const stunFrames = Math.floor(CONFIG.electric.stun_seconds * FPS);
      player.addStatus('stun', stunFrames);
    } else if (this.elementType === 'wind') {
      const push = player.x < (this.rect.x + this.rect.width / 2) 
        ? -CONFIG.wind.push_strength 
        : CONFIG.wind.push_strength;
      player.move(push, game.canvas.width);
    } else if (this.elementType === 'fire') {
      const burnFrames = Math.floor(CONFIG.fire.burn_seconds * FPS);
      player.addStatus('burn', burnFrames, CONFIG.fire.burn_dps);
    } else if (this.elementType === 'poison') {
      const poisonFrames = Math.floor(CONFIG.poison.poison_seconds * FPS);
      player.addStatus('poison', poisonFrames, CONFIG.poison.poison_dps);
    }
  }
}

// ============= SPECIFIC ATTACKS =============
class LightningStrikeAttack extends Attack {
  constructor() {
    super('LightningStrike', 'electric', CONFIG.electric.base_damage);
    this.chargeTime = 50;
    this.activeTime = 20;
    this.tracking = true;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.x = this.tracking && Math.random() < 0.75 
      ? game.player.x 
      : 50 + Math.random() * (w - 100);
    const width = Math.max(12, Math.floor(w * 0.03));
    this.rect = { x: Math.max(0, this.x - width / 2), y: 0, width, height: h };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      // Draw charge indicator - heavenly light effect
      const gradient = ctx.createLinearGradient(this.x, 0, this.x, 100);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - 20, 0, 40, 100);
    } else if (this.state === 'active') {
      // Draw lightning bolt
      ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 20;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class SideWallAttack extends Attack {
  constructor(side = 'left') {
    super('SideWall', 'wind', 0);
    this.side = side;
    this.widthFrac = 0.25;
    this.chargeTime = 60;
    this.activeTime = 120;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    const width = Math.floor(w * this.widthFrac);
    this.rect = this.side === 'left'
      ? { x: 0, y: 0, width, height: h }
      : { x: w - width, y: 0, width, height: h };
  }

  draw(ctx) {
    const alpha = this.state === 'charging' ? 0.3 : 0.6;
    ctx.fillStyle = `rgba(150, 100, 200, ${alpha})`;
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    
    // Draw tornado swirl effect
    if (this.state === 'active') {
      ctx.strokeStyle = 'rgba(200, 150, 255, 0.8)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const y = this.rect.y + (this.rect.height / 5) * i + Date.now() / 50 % (this.rect.height / 5);
        ctx.beginPath();
        ctx.moveTo(this.rect.x, y);
        ctx.quadraticCurveTo(
          this.rect.x + this.rect.width / 2,
          y + 30,
          this.rect.x + this.rect.width,
          y
        );
        ctx.stroke();
      }
    }
  }
}

class HomingCloud extends Attack {
  constructor() {
    super('HomingCloud', 'electric', 18);
    this.chargeTime = 40;
    this.activeTime = 140;
    this.speed = 5;
    this.size = { width: 50, height: 50 };
    this.tracking = true;
    this.homing = true;
    this.maxNumber = 2;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.pos = { x: 50 + Math.random() * (w - 100), y: h * 0.15 };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'charging' && this.tracking) {
      this.pos.x += (game.player.x - this.pos.x) * 0.06;
      this.rect.x = this.pos.x - this.size.width / 2;
    } else if (this.state === 'active') {
      const dx = game.player.x - this.pos.x;
      const dy = game.player.y - this.pos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.pos.x += (dx / len) * this.speed;
        this.pos.y += (dy / len) * this.speed;
      }
      this.rect.x = this.pos.x - this.size.width / 2;
      this.rect.y = this.pos.y - this.size.height / 2;
    }
    super.update(game);
  }

  draw(ctx) {
    // Draw storm cloud
    ctx.fillStyle = this.state === 'charging' 
      ? 'rgba(100, 100, 120, 0.7)' 
      : 'rgba(60, 60, 80, 0.9)';
    ctx.shadowColor = '#8888ff';
    ctx.shadowBlur = this.state === 'active' ? 15 : 5;
    
    // Cloud shape using circles
    const cx = this.pos.x;
    const cy = this.pos.y;
    ctx.beginPath();
    ctx.arc(cx - 15, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx + 15, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx, cy - 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class RisingTornado extends Attack {
  constructor() {
    super('RisingTornado', 'wind', 22);
    this.chargeTime = 28;
    this.activeTime = 90;
    this.growth = 0;
    this.widthFrac = 0.08;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    const width = Math.max(16, Math.floor(w * this.widthFrac));
    this.x = game.player.x;
    this.growth = 0;
    this.rect = { x: Math.max(0, this.x - width / 2), y: h, width, height: 0 };
  }

  update(game) {
    if (this.state === 'active') {
      const h = game.canvas.height;
      const growthRate = Math.max(4, Math.floor(h * 0.02));
      this.growth += growthRate;
      const newHeight = Math.min(h, this.growth);
      this.rect.y = h - newHeight;
      this.rect.height = newHeight;
    }
    super.update(game);
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.fillStyle = 'rgba(200, 180, 0, 0.8)';
      ctx.fillRect(this.x - 6, ctx.canvas.height - 60, 12, 24);
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(0, this.rect.y + this.rect.height, 0, this.rect.y);
      gradient.addColorStop(0, 'rgba(180, 30, 200, 0.9)');
      gradient.addColorStop(1, 'rgba(100, 50, 150, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
  }
}

class FireBlast extends Attack {
  constructor() {
    super('FireBlast', 'fire', CONFIG.fire.base_damage);
    this.chargeTime = 36;
    this.activeTime = 40;
    this.growth = 0;
    this.widthFrac = 0.12;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    const width = Math.max(16, Math.floor(w * this.widthFrac));
    this.x = game.player.x;
    this.growth = 0;
    this.rect = { x: Math.max(0, this.x - width / 2), y: h, width, height: 0 };
  }

  update(game) {
    if (this.state === 'active') {
      const h = game.canvas.height;
      const growthRate = Math.max(8, Math.floor(h * 0.04));
      this.growth += growthRate;
      const newHeight = Math.min(h / 2, this.growth);
      this.rect.y = h - newHeight;
      this.rect.height = newHeight;
    }
    super.update(game);
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.fillStyle = 'rgba(255, 120, 20, 0.8)';
      ctx.fillRect(this.x - 6, ctx.canvas.height - 40, 12, 24);
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(0, this.rect.y + this.rect.height, 0, this.rect.y);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.95)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class FireWall extends Attack {
  constructor(side = 'bottom') {
    super('FireWall', 'fire', CONFIG.fire.base_damage);
    this.side = side;
    this.chargeTime = 40;
    this.activeTime = 140;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    if (this.side === 'bottom') {
      const height = Math.floor(h * 0.2);
      this.rect = { x: 0, y: h - height, width: w, height };
    } else if (this.side === 'left') {
      this.rect = { x: 0, y: 0, width: Math.floor(w * 0.25), height: h };
    } else {
      this.rect = { x: Math.floor(w * 0.75), y: 0, width: Math.floor(w * 0.25), height: h };
    }
  }

  draw(ctx) {
    const alpha = this.state === 'charging' ? 0.4 : 0.75;
    const gradient = ctx.createLinearGradient(
      this.rect.x, this.rect.y + this.rect.height,
      this.rect.x, this.rect.y
    );
    gradient.addColorStop(0, `rgba(255, 80, 0, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(255, 50, 0, ${alpha * 0.3})`);
    ctx.fillStyle = gradient;
    if (this.state === 'active') {
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 30;
    }
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    ctx.shadowBlur = 0;
  }
}

class BidentAttack extends Attack {
  constructor() {
    super('Bident', 'physical', CONFIG.fire.base_damage);
    this.chargeTime = 38;
    this.activeTime = 15;
    this.tracking = true;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.x = this.tracking && Math.random() < 0.8
      ? game.player.x
      : 64 + Math.random() * (w - 128);
    const width = Math.max(10, Math.floor(w * 0.03));
    this.rect = { x: Math.max(0, this.x - width / 2), y: 0, width, height: h };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      // Draw bident charge indicator
      ctx.fillStyle = 'rgba(160, 80, 60, 0.8)';
      ctx.fillRect(this.x - 15, 30, 30, 80);
      // Bident prongs
      ctx.fillStyle = 'rgba(200, 100, 80, 0.9)';
      ctx.fillRect(this.x - 10, 20, 6, 30);
      ctx.fillRect(this.x + 4, 20, 6, 30);
    } else if (this.state === 'active') {
      ctx.fillStyle = 'rgba(180, 100, 80, 0.85)';
      ctx.shadowColor = '#cc6644';
      ctx.shadowBlur = 15;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class MinionSpawn extends Attack {
  constructor(minionName = 'Aquila') {
    super(`MinionSpawn_${minionName}`, 'summon', 0);
    this.chargeTime = 30;
    this.activeTime = 1;
    this.minionName = minionName;
    this.maxAllowed = MINION_LIMITS[minionName] || 1;
  }

  update(game) {
    const prevState = this.state;
    super.update(game);
    if (prevState === 'charging' && this.state === 'active') {
      const current = game.minions.filter(m => m.name === this.minionName).length;
      if (current < this.maxAllowed) {
        const minion = new Minion(this.minionName, Math.max(5, Math.floor(game.boss.hp * 0.1)));
        game.addMinion(minion);
      }
      this.state = 'finished';
    }
  }

  draw(ctx) {
    // Summon doesn't have visual
  }
}

// ============= MINION CLASS =============
class Minion {
  constructor(name, hp = 10) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.attacks = [];
    this.activeAttacks = [];
    this.image = null;
    this.imageFile = this.guessImage(name);
  }

  guessImage(name) {
    const mappings = {
      'Aquila': 'Aquila.png',
      'CerberusHead': 'Cerberus Head.png'
    };
    return mappings[name] || 'Aquila.png';
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }
}

// ============= BOSS CLASS =============
class Boss {
  constructor(config) {
    this.name = config.name;
    this.title = config.title;
    this.strength = config.strength;
    this.speed = config.speed;
    this.durability = config.durability;
    this.regeneration = config.regeneration;
    this.supernatural = config.supernatural;
    this.color = config.color;
    this.imageFile = config.imageFile;
    this.bossImageFile = config.bossImageFile;
    this.transform = config.transform;
    this.maxHp = config.maxHp;
    this.hp = this.maxHp;
    this.attackClasses = config.attacks;
    this.activeAttacks = [];
    this.image = null;
    this.bossImage = null;
  }

  scheduleAttack(AttackClass, game) {
    const attack = typeof AttackClass === 'function' && AttackClass.prototype instanceof Attack
      ? new AttackClass()
      : AttackClass();
    
    const sameCount = this.activeAttacks.filter(a => a.name === attack.name).length;
    if (sameCount >= (attack.maxNumber || 1)) return null;
    
    attack.spawn(game);
    this.activeAttacks.push(attack);
    return attack;
  }

  update(game) {
    // Probabilistically schedule attacks
    if (Math.random() < (this.speed / 400)) {
      const attackClass = this.attackClasses[Math.floor(Math.random() * this.attackClasses.length)];
      this.scheduleAttack(attackClass, game);
    }

    // Update attacks
    this.activeAttacks = this.activeAttacks.filter(atk => {
      atk.update(game);
      return !atk.isFinished();
    });

    // Regeneration
    this.hp = Math.min(this.maxHp, this.hp + this.regeneration * 0.01);
  }

  draw(ctx, game) {
    // Draw background image
    if (this.image) {
      ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Draw boss image overlay
    if (this.bossImage) {
      const bw = ctx.canvas.width * 2 / 3;
      const bh = ctx.canvas.height * 2 / 3;
      ctx.drawImage(this.bossImage, ctx.canvas.width / 6, ctx.canvas.height / 6, bw, bh);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }
}

// ============= BOSS FACTORY =============
function createBoss(name) {
  const bosses = {
    Zeus: {
      name: 'Zeus',
      title: 'Storm God-King of Olympus',
      strength: 12, speed: 45, durability: 12, regeneration: 20, supernatural: 12,
      color: [255, 255, 0],
      imageFile: 'Zeus Boss Image.png',
      bossImageFile: null,
      transform: null,
      maxHp: 500,
      attacks: [
        LightningStrikeAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        HomingCloud,
        RisingTornado,
        () => new MinionSpawn('Aquila')
      ]
    },
    Aquila: {
      name: 'Caucasian Eagle',
      title: 'Storm Eagle of Zeus',
      strength: 12, speed: 45, durability: 12, regeneration: 0, supernatural: 12,
      color: [255, 255, 0],
      imageFile: 'Storm Background.png',
      bossImageFile: 'Aquila.png',
      transform: 'Storm Aquila',
      maxHp: 100,
      attacks: [
        LightningStrikeAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        HomingCloud,
        RisingTornado,
        () => new MinionSpawn('Aquila')
      ]
    },
    'Storm Aquila': {
      name: 'Caucasian Eagle',
      title: 'Storm Eagle of Zeus',
      strength: 12, speed: 45, durability: 12, regeneration: 6, supernatural: 12,
      color: [255, 255, 0],
      imageFile: 'Storm Background.png',
      bossImageFile: 'Aquila Storm.png',
      transform: null,
      maxHp: 150,
      attacks: [
        LightningStrikeAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        HomingCloud,
        RisingTornado,
        () => new MinionSpawn('Aquila')
      ]
    },
    Hades: {
      name: 'Hades',
      title: 'Lord of the Underworld',
      strength: 15, speed: 60, durability: 8, regeneration: 8, supernatural: 14,
      color: [200, 80, 40],
      imageFile: 'Hades Boss Image.png',
      bossImageFile: null,
      transform: null,
      maxHp: 500,
      attacks: [
        FireBlast,
        () => new FireWall('bottom'),
        BidentAttack,
        () => new MinionSpawn('CerberusHead')
      ]
    }
  };

  return new Boss(bosses[name] || bosses.Zeus);
}

// ============= MAIN GAME CLASS =============
class Game {
  constructor(canvas, bossName = 'Zeus') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.gameOver = false;
    this.victory = false;
    this.bossName = bossName;
    
    this.player = new Player(canvas.width, canvas.height);
    this.boss = createBoss(bossName);
    this.minions = [];
    
    this.playerTurn = false;
    this.targetIndex = 0;
    
    this.keys = {};
    this.lastTime = 0;
    this.fps = 0;
    
    this.imagesLoaded = false;
    this.loadAssets();
  }

  async loadAssets() {
    try {
      if (this.boss.imageFile) {
        this.boss.image = await loadImage(this.boss.imageFile);
      }
      if (this.boss.bossImageFile) {
        this.boss.bossImage = await loadImage(this.boss.bossImageFile);
      }
    } catch (e) {
      console.log('Some assets failed to load:', e);
    }
    this.imagesLoaded = true;
  }

  addMinion(minion) {
    this.minions.push(minion);
  }

  transformBoss() {
    if (this.boss.transform) {
      this.boss = createBoss(this.boss.transform);
      this.loadAssets();
    }
  }

  handleKeyDown(e) {
    this.keys[e.code] = true;

    if (e.code === 'Enter' && this.player.attackGauge >= 100 && !this.playerTurn) {
      this.playerTurn = true;
      this.player.playerTurn = true;
      this.targetIndex = 0;
    } else if (this.playerTurn) {
      if (e.code === 'ArrowLeft') {
        this.targetIndex = Math.max(0, this.targetIndex - 1);
      } else if (e.code === 'ArrowRight') {
        this.targetIndex = Math.min(this.minions.length, this.targetIndex + 1);
      } else if (e.code === 'KeyH') {
        // Heal
        this.player.hp = this.player.maxHp;
        this.player.attackGauge = 0;
        this.playerTurn = false;
        this.player.playerTurn = false;
      } else if (e.code === 'Space') {
        this.playerAttack();
        this.playerTurn = false;
        this.player.playerTurn = false;
        
        if (this.boss.hp <= 0) {
          if (this.boss.transform) {
            this.transformBoss();
          } else {
            this.victory = true;
            this.gameOver = true;
          }
        }
      }
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  playerAttack() {
    const dmg = 25 + Math.floor(this.player.attackGauge * 0.1);
    
    if (this.targetIndex === 0) {
      this.boss.takeDamage(dmg);
      this.boss.activeAttacks = [];
    } else {
      const idx = this.targetIndex - 1;
      if (idx >= 0 && idx < this.minions.length) {
        this.minions[idx].takeDamage(dmg);
        if (this.minions[idx].hp <= 0) {
          this.boss.hp = Math.min(this.boss.maxHp, this.boss.hp + 5);
          this.minions.splice(idx, 1);
        }
      }
    }
    
    this.player.attackGauge = 0;
  }

  update() {
    if (this.gameOver) return;

    this.player.updateStatuses();

    // Handle movement
    if (!this.playerTurn) {
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
        this.player.move(-this.player.speed, this.canvas.width);
      }
      if (this.keys['KeyD'] || this.keys['ArrowRight']) {
        this.player.move(this.player.speed, this.canvas.width);
      }
      if (this.keys['KeyW'] || this.keys['ArrowUp']) {
        this.player.moveVertical(-this.player.speed, this.canvas.height);
      }
      if (this.keys['KeyS'] || this.keys['ArrowDown']) {
        this.player.moveVertical(this.player.speed, this.canvas.height);
      }

      // Boss update
      this.boss.update(this);

      // Check collisions
      for (const atk of this.boss.activeAttacks) {
        if (atk.state === 'active' && atk.checkCollision(this.player)) {
          atk.applyToPlayer(this.player, this);
          atk.state = 'finished';
        }
      }

      // Build attack gauge
      if (this.player.hp > 0) {
        this.player.attackGauge = Math.min(100, this.player.attackGauge + 0.35);
      }
    }

    // Check win/lose
    if (this.player.hp <= 0) {
      this.gameOver = true;
      this.victory = false;
    }
  }

  draw() {
    // Clear
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.imagesLoaded) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    // Draw boss background
    this.boss.draw(this.ctx, this);

    // Draw attacks
    for (const atk of this.boss.activeAttacks) {
      if (atk.state === 'charging' || atk.state === 'active') {
        atk.draw(this.ctx);
      }
    }

    // Draw minions
    let mx = 20;
    for (let i = 0; i < this.minions.length; i++) {
      const m = this.minions[i];
      this.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
      this.ctx.fillRect(mx, 60, 60, 60);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText(`${m.name}`, mx + 5, 75);
      this.ctx.fillText(`HP: ${Math.floor(m.hp)}`, mx + 5, 110);
      
      if (this.playerTurn && this.targetIndex === i + 1) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.moveTo(mx + 30, 40);
        this.ctx.lineTo(mx + 15, 55);
        this.ctx.lineTo(mx + 45, 55);
        this.ctx.closePath();
        this.ctx.fill();
      }
      mx += 70;
    }

    // Draw player
    this.player.draw(this.ctx);

    // Draw status icons
    this.drawStatusIcons();

    // Draw target arrow on boss
    if (this.playerTurn && this.targetIndex === 0) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.beginPath();
      const ax = this.canvas.width / 2;
      this.ctx.moveTo(ax, 80);
      this.ctx.lineTo(ax - 20, 100);
      this.ctx.lineTo(ax + 20, 100);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Draw UI
    this.drawUI();

    // Draw game over screen
    if (this.gameOver) {
      this.drawGameOver();
    }
  }

  drawStatusIcons() {
    const iconSize = 25;
    let ix = this.player.x - iconSize / 2;
    const iy = this.player.y - 50;

    const statusColors = {
      stun: '#ffff00',
      burn: '#ff6600',
      poison: '#00ff00',
      wind: '#9999ff'
    };

    for (const name of Object.keys(this.player.statuses)) {
      this.ctx.fillStyle = statusColors[name] || '#fff';
      this.ctx.fillRect(ix - 12, iy, iconSize, iconSize);
      this.ctx.fillStyle = '#000';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(name.substring(0, 3).toUpperCase(), ix, iy + 16);
      ix -= iconSize + 5;
    }
    this.ctx.textAlign = 'left';
  }

  drawUI() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Boss HP bar
    const barW = Math.floor(w * 0.66);
    const barH = 20;
    const bx = (w - barW) / 2;
    const by = 10;
    const hpFrac = Math.max(0, Math.min(1, this.boss.hp / this.boss.maxHp));

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(bx - 5, by - 5, barW + 10, barH + 40);

    // HP bar
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(bx, by, barW, barH);
    this.ctx.fillStyle = '#cc3333';
    this.ctx.fillRect(bx, by, barW * hpFrac, barH);

    // Boss name
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.boss.name, w / 2, by - 2);

    // HP text
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(`HP ${Math.floor(this.boss.hp)}/${this.boss.maxHp}`, w / 2, by + 14);

    // Active attack
    const activeAtk = this.boss.activeAttacks.find(a => a.state === 'charging' || a.state === 'active');
    const atkText = activeAtk ? `${activeAtk.name} (${activeAtk.state})` : 'Idle';
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText(atkText, w / 2, by + 32);

    this.ctx.textAlign = 'left';

    // Player HP and gauge
    const playerBarW = 150;
    const px = this.player.x - playerBarW / 2;
    let py = this.player.y + 15;
    if (py + 60 > h) py = this.player.y - 70;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(px - 5, py - 5, playerBarW + 10, 55);

    // HP bar
    const hpPlayerFrac = Math.max(0, Math.min(1, this.player.hp / this.player.maxHp));
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(px, py, playerBarW, 14);
    this.ctx.fillStyle = '#aa2222';
    this.ctx.fillRect(px, py, playerBarW * hpPlayerFrac, 14);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`HP ${Math.floor(this.player.hp)}/${this.player.maxHp}`, px + playerBarW / 2, py + 11);

    // Attack gauge
    const gaugeFrac = this.player.attackGauge / 100;
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(px, py + 18, playerBarW, 12);
    this.ctx.fillStyle = gaugeFrac >= 1 ? '#44cc44' : '#77aa44';
    this.ctx.fillRect(px, py + 18, playerBarW * gaugeFrac, 12);
    this.ctx.fillStyle = '#000';
    this.ctx.fillText(`${Math.floor(gaugeFrac * 100)}%`, px + playerBarW / 2, py + 28);

    // Turn prompt
    if (this.playerTurn) {
      this.ctx.fillStyle = '#ffff88';
      this.ctx.font = '13px sans-serif';
      this.ctx.fillText('← → select | SPACE attack | H heal', px + playerBarW / 2, py + 45);
    } else if (this.player.attackGauge >= 100) {
      this.ctx.fillStyle = '#88ff88';
      this.ctx.font = '13px sans-serif';
      this.ctx.fillText('Press ENTER to attack!', px + playerBarW / 2, py + 45);
    }

    this.ctx.textAlign = 'left';
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.fillStyle = this.victory ? '#44ff44' : '#ff4444';
    this.ctx.fillText(
      this.victory ? 'VICTORY!' : 'DEFEATED',
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );

    this.ctx.font = '24px sans-serif';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(
      'Press R to restart or ESC to return to menu',
      this.canvas.width / 2,
      this.canvas.height / 2 + 30
    );

    this.ctx.textAlign = 'left';
  }

  gameLoop(timestamp) {
    if (!this.running) return;

    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.fps = 1000 / delta;

    this.update();
    this.draw();

    requestAnimationFrame(t => this.gameLoop(t));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(t => this.gameLoop(t));
  }

  stop() {
    this.running = false;
  }

  restart() {
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.boss = createBoss(this.bossName);
    this.minions = [];
    this.playerTurn = false;
    this.targetIndex = 0;
    this.gameOver = false;
    this.victory = false;
    this.loadAssets();
  }
}

// Export for use
window.BossFightGame = Game;

