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

const MINION_LIMITS = { Aquila: 1, CerberusHead: 3, HydraHead: 4, Serpent: 3, FireSpirit: 2, ShadowMinion: 2 };

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
    this.chargeLevel = 0; // 0 = no charge, 1 = 2.5x, 2 = 6.25x
    this.maxCharges = 2;
  }

  getChargeMult() {
    return Math.pow(2.5, this.chargeLevel);
  }

  addCharge() {
    if (this.chargeLevel < this.maxCharges) {
      this.chargeLevel++;
      return true;
    }
    return false;
  }

  resetCharge() {
    this.chargeLevel = 0;
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
    this.pushStrength = 4; // How hard the wind pushes
    this.continuous = true; // Continuous effect while in area
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

  // Continuous push effect - called every frame when active
  applyContinuousEffect(player, game) {
    if (this.state !== 'active') return;
    
    // Check if player is in the wind area
    if (this.checkCollision(player)) {
      // Push player away from the wind source
      const pushDir = this.side === 'left' ? 1 : -1;
      player.x += this.pushStrength * pushDir;
      // Keep player in bounds
      player.x = Math.max(player.radius, Math.min(game.canvas.width - player.radius, player.x));
    }
  }

  draw(ctx) {
    const alpha = this.state === 'charging' ? 0.3 : 0.6;
    ctx.fillStyle = `rgba(150, 100, 200, ${alpha})`;
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    
    // Draw wind direction arrows
    if (this.state === 'active') {
      ctx.strokeStyle = 'rgba(200, 150, 255, 0.8)';
      ctx.lineWidth = 3;
      const arrowDir = this.side === 'left' ? 1 : -1;
      for (let i = 0; i < 5; i++) {
        const y = this.rect.y + (this.rect.height / 5) * i + Date.now() / 50 % (this.rect.height / 5);
        const startX = this.side === 'left' ? this.rect.x : this.rect.x + this.rect.width;
        const endX = this.side === 'left' ? this.rect.x + this.rect.width : this.rect.x;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        // Arrow head
        ctx.lineTo(endX - arrowDir * 10, y - 10);
        ctx.moveTo(endX, y);
        ctx.lineTo(endX - arrowDir * 10, y + 10);
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
    this.chargeTime = 1800; // 30 seconds at 60fps
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

// ============= HYDRA-SPECIFIC ATTACKS =============
class PoisonCloud extends Attack {
  constructor() {
    super('PoisonCloud', 'poison', CONFIG.poison.base_damage);
    this.chargeTime = 45;
    this.activeTime = 180;
    this.speed = 2;
    this.size = { width: 80, height: 80 };
    this.tracking = true;
    this.homing = true;
    this.maxNumber = 2;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.pos = { x: 50 + Math.random() * (w - 100), y: h * 0.2 };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'charging' && this.tracking) {
      this.pos.x += (game.player.x - this.pos.x) * 0.04;
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
    const alpha = this.state === 'charging' ? 0.4 : 0.7;
    ctx.fillStyle = `rgba(80, 180, 50, ${alpha})`;
    ctx.shadowColor = '#44cc22';
    ctx.shadowBlur = this.state === 'active' ? 25 : 10;
    
    // Draw toxic cloud as multiple overlapping circles
    const cx = this.pos.x;
    const cy = this.pos.y;
    ctx.beginPath();
    ctx.arc(cx - 20, cy + 5, 25, 0, Math.PI * 2);
    ctx.arc(cx + 20, cy + 5, 25, 0, Math.PI * 2);
    ctx.arc(cx, cy - 15, 28, 0, Math.PI * 2);
    ctx.arc(cx - 10, cy + 15, 20, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy + 15, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Add toxic bubbles effect
    if (this.state === 'active') {
      ctx.fillStyle = 'rgba(150, 255, 100, 0.6)';
      for (let i = 0; i < 5; i++) {
        const bx = cx + Math.sin(Date.now() / 200 + i) * 20;
        const by = cy + Math.cos(Date.now() / 300 + i * 2) * 15;
        ctx.beginPath();
        ctx.arc(bx, by, 4 + Math.sin(Date.now() / 100 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

class PoisonBreath extends Attack {
  constructor() {
    super('PoisonBreath', 'poison', CONFIG.poison.base_damage);
    this.chargeTime = 30;
    this.activeTime = 60;
    this.widthFrac = 0.35;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    const width = Math.floor(w * this.widthFrac);
    this.x = game.player.x;
    this.rect = { x: Math.max(0, this.x - width / 2), y: 0, width, height: h };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      // Charge indicator - green glow at top
      const gradient = ctx.createLinearGradient(this.x, 0, this.x, 80);
      gradient.addColorStop(0, 'rgba(100, 255, 50, 0.8)');
      gradient.addColorStop(1, 'rgba(50, 200, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - 30, 0, 60, 80);
    } else if (this.state === 'active') {
      // Full poison breath column
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, 'rgba(80, 200, 50, 0.85)');
      gradient.addColorStop(0.5, 'rgba(60, 180, 40, 0.6)');
      gradient.addColorStop(1, 'rgba(40, 150, 30, 0.3)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#66ff33';
      ctx.shadowBlur = 30;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class AcidSpit extends Attack {
  constructor() {
    super('AcidSpit', 'poison', CONFIG.poison.base_damage + 5);
    this.chargeTime = 25;
    this.activeTime = 50;
    this.speed = 8;
    this.size = { width: 30, height: 30 };
    this.maxNumber = 3;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    // Start from top center, aim toward player
    this.pos = { x: w / 2, y: 100 };
    const dx = game.player.x - this.pos.x;
    const dy = game.player.y - this.pos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    this.velocity = len > 0 ? { x: (dx / len) * this.speed, y: (dy / len) * this.speed } : { x: 0, y: this.speed };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'active') {
      this.pos.x += this.velocity.x;
      this.pos.y += this.velocity.y;
      this.rect.x = this.pos.x - this.size.width / 2;
      this.rect.y = this.pos.y - this.size.height / 2;
      
      // Finish if off screen
      if (this.pos.y > game.canvas.height + 50 || this.pos.x < -50 || this.pos.x > game.canvas.width + 50) {
        this.state = 'finished';
      }
    }
    super.update(game);
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.fillStyle = 'rgba(150, 255, 50, 0.7)';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'active') {
      // Acid projectile
      ctx.fillStyle = 'rgba(100, 220, 50, 0.9)';
      ctx.shadowColor = '#88ff44';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.size.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Dripping effect
      ctx.fillStyle = 'rgba(80, 200, 40, 0.6)';
      ctx.beginPath();
      ctx.arc(this.pos.x - 8, this.pos.y + 12, 6, 0, Math.PI * 2);
      ctx.arc(this.pos.x + 10, this.pos.y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============= WATER/NEPTUNE ATTACKS =============
class TidalWave extends Attack {
  constructor(side = 'left') {
    super('TidalWave', 'physical', 20);
    this.side = side;
    this.chargeTime = 50;
    this.activeTime = 80;
    this.wavePos = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.wavePos = this.side === 'left' ? -100 : w + 100;
    this.rect = { x: 0, y: 0, width: Math.floor(w * 0.2), height: h };
  }

  update(game) {
    if (this.state === 'active') {
      const w = game.canvas.width;
      const speed = 8;
      if (this.side === 'left') {
        this.wavePos += speed;
        if (this.wavePos > w + 100) this.state = 'finished';
      } else {
        this.wavePos -= speed;
        if (this.wavePos < -100) this.state = 'finished';
      }
      this.rect.x = this.wavePos - this.rect.width / 2;
    }
    super.update(game);
  }

  draw(ctx) {
    const h = ctx.canvas.height;
    if (this.state === 'charging') {
      const x = this.side === 'left' ? 20 : ctx.canvas.width - 40;
      ctx.fillStyle = 'rgba(50, 150, 255, 0.5)';
      ctx.fillRect(x, 0, 20, h);
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(this.rect.x, 0, this.rect.x + this.rect.width, 0);
      gradient.addColorStop(0, 'rgba(30, 100, 200, 0.3)');
      gradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0.4)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 20;
      ctx.fillRect(this.rect.x, 0, this.rect.width, h);
      ctx.shadowBlur = 0;
    }
  }
}

class Whirlpool extends Attack {
  constructor() {
    super('Whirlpool', 'physical', 15);
    this.chargeTime = 40;
    this.activeTime = 150;
    this.size = { width: 120, height: 120 };
    this.maxNumber = 2;
    this.rotation = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.pos = { x: game.player.x, y: h * 0.7 };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'active') {
      this.rotation += 0.1;
      // Pull player toward center
      if (this.checkCollision(game.player)) {
        const dx = this.pos.x - game.player.x;
        game.player.move(dx * 0.05, game.canvas.width);
      }
    }
    super.update(game);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    
    if (this.state === 'charging') {
      ctx.strokeStyle = 'rgba(50, 150, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.state === 'active') {
      ctx.rotate(this.rotation);
      // Draw spiral
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.strokeStyle = `rgba(50, 150, 255, ${0.8 - i * 0.2})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let t = 0; t < 3; t += 0.1) {
          const r = t * 15;
          const x = r * Math.cos(t * 2);
          const y = r * Math.sin(t * 2);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

class Trident extends Attack {
  constructor() {
    super('Trident', 'physical', 25);
    this.chargeTime = 35;
    this.activeTime = 20;
    this.tracking = true;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.x = this.tracking && Math.random() < 0.8 ? game.player.x : 64 + Math.random() * (w - 128);
    const width = Math.max(15, Math.floor(w * 0.04));
    this.rect = { x: Math.max(0, this.x - width / 2), y: 0, width, height: h };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.fillStyle = 'rgba(50, 150, 200, 0.8)';
      ctx.fillRect(this.x - 20, 20, 40, 60);
      // Trident prongs
      ctx.fillRect(this.x - 15, 10, 8, 25);
      ctx.fillRect(this.x - 4, 5, 8, 30);
      ctx.fillRect(this.x + 7, 10, 8, 25);
    } else if (this.state === 'active') {
      ctx.fillStyle = 'rgba(80, 180, 220, 0.85)';
      ctx.shadowColor = '#44aadd';
      ctx.shadowBlur = 15;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

// ============= SOLAR/LIGHT ATTACKS =============
class SolarBeam extends Attack {
  constructor() {
    super('SolarBeam', 'fire', CONFIG.fire.base_damage + 10);
    this.chargeTime = 60;
    this.activeTime = 40;
    this.widthFrac = 0.15;
    this.x = 0;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    const width = Math.floor(w * this.widthFrac);
    this.x = game.player.x;
    this.rect = { x: Math.max(0, this.x - width / 2), y: 0, width, height: h };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      const gradient = ctx.createRadialGradient(this.x, 50, 0, this.x, 50, 60);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, 50, 60, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(this.rect.x, 0, this.rect.x + this.rect.width, 0);
      gradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.95)');
      gradient.addColorStop(1, 'rgba(255, 200, 50, 0.3)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#ffff88';
      ctx.shadowBlur = 40;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class SunFlare extends Attack {
  constructor() {
    super('SunFlare', 'fire', CONFIG.fire.base_damage);
    this.chargeTime = 30;
    this.activeTime = 100;
    this.size = { width: 100, height: 100 };
    this.maxNumber = 3;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    this.pos = { x: Math.random() * w, y: 80 };
    this.velocity = { x: (Math.random() - 0.5) * 4, y: 3 };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'active') {
      this.pos.x += this.velocity.x;
      this.pos.y += this.velocity.y;
      this.rect.x = this.pos.x - this.size.width / 2;
      this.rect.y = this.pos.y - this.size.height / 2;
      if (this.pos.y > game.canvas.height + 50) this.state = 'finished';
    }
    super.update(game);
  }

  draw(ctx) {
    const alpha = this.state === 'charging' ? 0.5 : 0.9;
    ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size.width / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============= PHYSICAL/MELEE ATTACKS =============
class GroundSlam extends Attack {
  constructor() {
    super('GroundSlam', 'physical', 20);
    this.chargeTime = 40;
    this.activeTime = 30;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.rect = { x: 0, y: h - 100, width: w, height: 100 };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.strokeStyle = 'rgba(150, 100, 50, 0.7)';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(0, this.rect.y, 0, this.rect.y + this.rect.height);
      gradient.addColorStop(0, 'rgba(180, 140, 80, 0.9)');
      gradient.addColorStop(1, 'rgba(100, 80, 40, 0.6)');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#aa8844';
      ctx.shadowBlur = 15;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
      ctx.shadowBlur = 0;
    }
  }
}

class DashAttack extends Attack {
  constructor() {
    super('DashAttack', 'physical', 18);
    this.chargeTime = 25;
    this.activeTime = 15;
    this.startSide = 'left';
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    const h = game.canvas.height;
    this.startSide = Math.random() < 0.5 ? 'left' : 'right';
    const attackY = game.player.y;
    this.rect = { x: 0, y: attackY - 30, width: w, height: 60 };
  }

  draw(ctx) {
    if (this.state === 'charging') {
      const x = this.startSide === 'left' ? 30 : ctx.canvas.width - 50;
      ctx.fillStyle = 'rgba(200, 150, 100, 0.7)';
      ctx.beginPath();
      ctx.arc(x, this.rect.y + 30, 25, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.state === 'active') {
      const gradient = ctx.createLinearGradient(0, this.rect.y, 0, this.rect.y + this.rect.height);
      gradient.addColorStop(0, 'rgba(200, 150, 100, 0.3)');
      gradient.addColorStop(0.5, 'rgba(220, 180, 120, 0.8)');
      gradient.addColorStop(1, 'rgba(200, 150, 100, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
  }
}

class ArrowVolley extends Attack {
  constructor() {
    super('ArrowVolley', 'physical', 12);
    this.chargeTime = 30;
    this.activeTime = 60;
    this.arrows = [];
    this.maxNumber = 1;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    // Create multiple arrows
    this.arrows = [];
    for (let i = 0; i < 5; i++) {
      this.arrows.push({
        x: Math.random() * w,
        y: -20 - i * 30,
        speed: 6 + Math.random() * 3
      });
    }
    this.rect = { x: 0, y: 0, width: w, height: game.canvas.height };
  }

  update(game) {
    if (this.state === 'active') {
      for (const arrow of this.arrows) {
        arrow.y += arrow.speed;
      }
      // Check individual arrow collisions
      for (const arrow of this.arrows) {
        if (Math.abs(arrow.x - game.player.x) < 15 && 
            Math.abs(arrow.y - game.player.y) < 20 &&
            arrow.y > 0) {
          this.applyToPlayer(game.player, game);
          arrow.y = game.canvas.height + 100; // Move off screen
        }
      }
    }
    super.update(game);
  }

  checkCollision(player) {
    return false; // Handle collision in update
  }

  draw(ctx) {
    if (this.state === 'charging') {
      ctx.fillStyle = 'rgba(180, 150, 100, 0.6)';
      for (const arrow of this.arrows) {
        ctx.fillRect(arrow.x - 3, 20, 6, 30);
      }
    } else if (this.state === 'active') {
      ctx.fillStyle = 'rgba(150, 120, 80, 0.9)';
      for (const arrow of this.arrows) {
        if (arrow.y < ctx.canvas.height) {
          ctx.beginPath();
          ctx.moveTo(arrow.x, arrow.y);
          ctx.lineTo(arrow.x - 5, arrow.y - 20);
          ctx.lineTo(arrow.x + 5, arrow.y - 20);
          ctx.closePath();
          ctx.fill();
          ctx.fillRect(arrow.x - 2, arrow.y - 20, 4, 25);
        }
      }
    }
  }
}

// ============= SHADOW/DARK ATTACKS =============
class ShadowBolt extends Attack {
  constructor() {
    super('ShadowBolt', 'physical', 16);
    this.chargeTime = 30;
    this.activeTime = 50;
    this.speed = 7;
    this.size = { width: 25, height: 25 };
    this.maxNumber = 4;
  }

  spawn(game) {
    super.spawn(game);
    const w = game.canvas.width;
    this.pos = { x: Math.random() * w, y: 80 };
    const dx = game.player.x - this.pos.x;
    const dy = game.player.y - this.pos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    this.velocity = len > 0 ? { x: (dx / len) * this.speed, y: (dy / len) * this.speed } : { x: 0, y: this.speed };
    this.rect = {
      x: this.pos.x - this.size.width / 2,
      y: this.pos.y - this.size.height / 2,
      width: this.size.width,
      height: this.size.height
    };
  }

  update(game) {
    if (this.state === 'active') {
      this.pos.x += this.velocity.x;
      this.pos.y += this.velocity.y;
      this.rect.x = this.pos.x - this.size.width / 2;
      this.rect.y = this.pos.y - this.size.height / 2;
      if (this.pos.y > game.canvas.height + 50 || this.pos.x < -50 || this.pos.x > game.canvas.width + 50) {
        this.state = 'finished';
      }
    }
    super.update(game);
  }

  draw(ctx) {
    ctx.fillStyle = this.state === 'charging' ? 'rgba(80, 50, 100, 0.7)' : 'rgba(60, 30, 80, 0.9)';
    ctx.shadowColor = '#6633aa';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class DarkVeil extends Attack {
  constructor(side = 'left') {
    super('DarkVeil', 'physical', 10);
    this.side = side;
    this.chargeTime = 45;
    this.activeTime = 100;
    this.widthFrac = 0.3;
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
    ctx.fillStyle = `rgba(40, 20, 60, ${alpha})`;
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }
}

// ============= MINION CLASS =============
class Minion {
  constructor(name, hp = 10, game = null) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.attacks = [];
    this.activeAttacks = [];
    this.image = null;
    this.imageFile = this.guessImage(name);
    
    // Monster heads (Cerberus, Hydra) appear on sides and fire beams
    this.isMonsterHead = ['CerberusHead', 'HydraHead'].includes(name);
    if (this.isMonsterHead) {
      // Assign to left or right side randomly
      this.side = Math.random() < 0.5 ? 'left' : 'right';
      // Vertical position (spread out on the side)
      this.yPos = 0.2 + Math.random() * 0.4; // Between 20% and 60% of screen height
      // Beam attack properties
      this.beamCooldown = 0;
      this.beamMaxCooldown = 180; // 3 seconds between beams
      this.beamActive = false;
      this.beamTimer = 0;
      this.beamDuration = 40; // How long the beam is active
      this.beamCharging = false;
      this.beamChargeTimer = 0;
      this.beamChargeTime = 60; // 1 second charge time
      // Element type based on monster
      this.beamElement = name === 'CerberusHead' ? 'fire' : 'poison';
    }
  }

  guessImage(name) {
    const mappings = {
      'Aquila': 'Aquila.png',
      'CerberusHead': 'Cerberus Head.png',
      'HydraHead': 'hydra_3.PNG',
      'Serpent': 'python_1.png',
      'FireSpirit': 'Fireblast.png',
      'ShadowMinion': 'hecate_1.png'
    };
    return mappings[name] || 'Aquila.png';
  }

  update(game) {
    if (!this.isMonsterHead) return;
    
    const w = game.canvas.width;
    const h = game.canvas.height;
    
    // Handle beam attack cycle
    if (this.beamActive) {
      this.beamTimer++;
      if (this.beamTimer >= this.beamDuration) {
        this.beamActive = false;
        this.beamTimer = 0;
        this.beamCooldown = this.beamMaxCooldown;
      }
      
      // Check beam collision with player
      const beamY = h * this.yPos;
      const beamHeight = 30;
      if (game.player.y >= beamY - beamHeight / 2 && 
          game.player.y <= beamY + beamHeight / 2) {
        // Player is in beam path
        const damage = this.beamElement === 'fire' ? CONFIG.fire.base_damage : CONFIG.poison.base_damage;
        game.player.hp -= damage * 0.05; // Damage per frame
        
        // Apply status effect
        if (this.beamElement === 'fire') {
          game.player.addStatus('burn', CONFIG.fire.burn_seconds * FPS, CONFIG.fire.burn_dps);
        } else {
          game.player.addStatus('poison', CONFIG.poison.poison_seconds * FPS, CONFIG.poison.poison_dps);
        }
      }
    } else if (this.beamCharging) {
      this.beamChargeTimer++;
      if (this.beamChargeTimer >= this.beamChargeTime) {
        this.beamCharging = false;
        this.beamActive = true;
        this.beamChargeTimer = 0;
      }
    } else {
      // Cooldown
      if (this.beamCooldown > 0) {
        this.beamCooldown--;
      } else {
        // Start charging beam
        this.beamCharging = true;
      }
    }
  }

  draw(ctx, game, index) {
    if (this.isMonsterHead) {
      this.drawMonsterHead(ctx, game, index);
    }
  }

  drawMonsterHead(ctx, game, index) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const headSize = 70;
    
    // Position on side of screen
    const x = this.side === 'left' ? 10 : w - headSize - 10;
    const y = h * this.yPos - headSize / 2;
    
    // Draw head background
    const color = this.beamElement === 'fire' ? 'rgba(180, 60, 40, 0.9)' : 'rgba(60, 140, 80, 0.9)';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + headSize / 2, y + headSize / 2, headSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = this.beamCharging ? '#ffff00' : (this.beamActive ? '#ff0000' : '#fff');
    const eyeOffset = this.side === 'left' ? 10 : -10;
    ctx.beginPath();
    ctx.arc(x + headSize / 2 + eyeOffset - 10, y + headSize / 3, 8, 0, Math.PI * 2);
    ctx.arc(x + headSize / 2 + eyeOffset + 10, y + headSize / 3, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw HP bar above head
    const hpFrac = this.hp / this.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y - 12, headSize, 8);
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(x, y - 12, headSize * hpFrac, 8);
    
    // Draw name
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, x + headSize / 2, y - 16);
    ctx.textAlign = 'left';
    
    // Draw beam charge indicator
    if (this.beamCharging) {
      const chargeFrac = this.beamChargeTimer / this.beamChargeTime;
      const beamColor = this.beamElement === 'fire' 
        ? `rgba(255, ${Math.floor(100 + 100 * (1 - chargeFrac))}, 0, ${0.3 + chargeFrac * 0.4})`
        : `rgba(0, 255, 100, ${0.3 + chargeFrac * 0.4})`;
      ctx.fillStyle = beamColor;
      
      const beamY = h * this.yPos;
      const startX = this.side === 'left' ? x + headSize : 0;
      const endX = this.side === 'left' ? w : x;
      ctx.fillRect(startX, beamY - 5, (endX - startX) * chargeFrac, 10);
    }
    
    // Draw active beam
    if (this.beamActive) {
      const beamY = h * this.yPos;
      const startX = this.side === 'left' ? x + headSize : 0;
      const endX = this.side === 'left' ? w : x;
      
      // Main beam
      const beamGradient = ctx.createLinearGradient(0, beamY - 15, 0, beamY + 15);
      if (this.beamElement === 'fire') {
        beamGradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
        beamGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.9)');
        beamGradient.addColorStop(1, 'rgba(255, 200, 0, 0.3)');
      } else {
        beamGradient.addColorStop(0, 'rgba(100, 255, 100, 0.3)');
        beamGradient.addColorStop(0.5, 'rgba(50, 200, 100, 0.9)');
        beamGradient.addColorStop(1, 'rgba(100, 255, 100, 0.3)');
      }
      ctx.fillStyle = beamGradient;
      ctx.fillRect(startX, beamY - 15, endX - startX, 30);
      
      // Glow effect
      ctx.shadowColor = this.beamElement === 'fire' ? '#ff6600' : '#00ff66';
      ctx.shadowBlur = 20;
      ctx.fillRect(startX, beamY - 10, endX - startX, 20);
      ctx.shadowBlur = 0;
    }
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
    this.backgroundFile = config.backgroundFile || null; // Separate background
    this.useImageAsBossSprite = config.useImageAsBossSprite || false; // If true, imageFile is character sprite on storm bg
    this.transform = config.transform;
    this.maxHp = config.maxHp;
    this.hp = this.maxHp;
    this.attackClasses = config.attacks;
    this.activeAttacks = [];
    this.image = null;
    this.bossImage = null;
    this.backgroundImage = null;
    this.difficulty = config.difficulty || 'medium';
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
    // Draw background image (or storm background as default)
    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else if (this.image && !this.useImageAsBossSprite) {
      // Image is the full background (Zeus, Hades style)
      ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      // Fallback solid color
      ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Draw boss character image in center with proper aspect ratio
    const spriteImg = this.bossImage || (this.image && this.useImageAsBossSprite ? this.image : null);
    if (spriteImg) {
      // Calculate dimensions that fit within the available space while maintaining aspect ratio
      const maxW = ctx.canvas.width * 0.5;
      const maxH = ctx.canvas.height * 0.6;
      const imgRatio = spriteImg.naturalWidth / spriteImg.naturalHeight;
      const maxRatio = maxW / maxH;
      
      let bw, bh;
      if (imgRatio > maxRatio) {
        // Image is wider than space - fit by width
        bw = maxW;
        bh = maxW / imgRatio;
      } else {
        // Image is taller than space - fit by height
        bh = maxH;
        bw = maxH * imgRatio;
      }
      
      const bx = (ctx.canvas.width - bw) / 2;
      const by = ctx.canvas.height * 0.1 + (maxH - bh) / 2; // Center vertically in the available space
      ctx.drawImage(spriteImg, bx, by, bw, bh);
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
      difficulty: 'hard',
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
      difficulty: 'easy',
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
      difficulty: 'easy',
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
      difficulty: 'medium',
      attacks: [
        FireBlast,
        () => new FireWall('bottom'),
        BidentAttack,
        () => new MinionSpawn('CerberusHead')
      ]
    },
    Hydra: {
      name: 'Hydra',
      title: 'The Lernaean Serpent - Human Form',
      strength: 10, speed: 50, durability: 10, regeneration: 5, supernatural: 12,
      color: [50, 120, 80],
      imageFile: 'hydra_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: 'Hydra Monster',
      maxHp: 200,
      difficulty: 'medium',
      attacks: [
        FireBlast,
        PoisonCloud,
        AcidSpit,
        PoisonBreath,
        () => new MinionSpawn('HydraHead')
      ]
    },
    'Hydra Monster': {
      name: 'Hydra',
      title: 'The Lernaean Serpent - True Form',
      strength: 18, speed: 35, durability: 15, regeneration: 15, supernatural: 16,
      color: [40, 100, 60],
      imageFile: 'hydra_2.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 350,
      difficulty: 'medium',
      attacks: [
        FireBlast,
        PoisonCloud,
        () => new FireWall('bottom'),
        PoisonBreath,
        AcidSpit,
        () => new MinionSpawn('HydraHead')
      ]
    },
    // ===== OLYMPIAN GODS =====
    Apollo: {
      name: 'Apollo',
      title: 'God of the Sun and Music',
      strength: 12, speed: 55, durability: 10, regeneration: 10, supernatural: 15,
      color: [255, 200, 50],
      imageFile: 'apollo.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 400,
      difficulty: 'medium',
      attacks: [
        SolarBeam,
        FireBlast,
        SunFlare,
        ArrowVolley,
        () => new FireWall('bottom'),
        () => new MinionSpawn('FireSpirit')
      ]
    },
    Neptune: {
      name: 'Neptune',
      title: 'God of the Seas',
      strength: 14, speed: 45, durability: 14, regeneration: 12, supernatural: 16,
      color: [50, 100, 180],
      imageFile: 'neptune_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 500,
      difficulty: 'hard',
      attacks: [
        () => new TidalWave(Math.random() < 0.5 ? 'left' : 'right'),
        Whirlpool,
        Trident,
        GroundSlam,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right')
      ]
    },
    Mercury: {
      name: 'Mercury',
      title: 'Messenger of the Gods',
      strength: 8, speed: 80, durability: 6, regeneration: 5, supernatural: 10,
      color: [180, 180, 200],
      imageFile: 'mercury.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 250,
      difficulty: 'easy',
      attacks: [
        DashAttack,
        RisingTornado,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        ArrowVolley,
        HomingCloud
      ]
    },
    Venus: {
      name: 'Venus',
      title: 'Goddess of Love and Beauty',
      strength: 6, speed: 40, durability: 8, regeneration: 15, supernatural: 14,
      color: [255, 150, 180],
      imageFile: 'venus.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 300,
      difficulty: 'easy',
      attacks: [
        ShadowBolt,
        () => new DarkVeil(Math.random() < 0.5 ? 'left' : 'right'),
        HomingCloud,
        DashAttack,
        GroundSlam
      ]
    },
    // ===== UNDERWORLD CHARACTERS (FIRE) =====
    Cerberus: {
      name: 'Cerberus',
      title: 'Guardian of the Underworld',
      strength: 16, speed: 50, durability: 18, regeneration: 8, supernatural: 12,
      color: [80, 40, 40],
      imageFile: 'cerberus_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 600,
      difficulty: 'hard',
      attacks: [
        FireBlast,
        () => new FireWall('bottom'),
        () => new FireWall(Math.random() < 0.5 ? 'left' : 'right'),
        BidentAttack,
        GroundSlam,
        () => new MinionSpawn('CerberusHead')
      ]
    },
    Megaera: {
      name: 'Megaera',
      title: 'The Fury of Jealousy',
      strength: 12, speed: 65, durability: 10, regeneration: 6, supernatural: 14,
      color: [150, 50, 80],
      imageFile: 'megaera.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 350,
      difficulty: 'medium',
      attacks: [
        FireBlast,
        DashAttack,
        () => new FireWall('bottom'),
        ShadowBolt,
        () => new DarkVeil(Math.random() < 0.5 ? 'left' : 'right'),
        ArrowVolley
      ]
    },
    Hecate: {
      name: 'Hecate',
      title: 'Goddess of Magic and Witchcraft',
      strength: 10, speed: 45, durability: 10, regeneration: 10, supernatural: 20,
      color: [80, 50, 120],
      imageFile: 'hecate_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 400,
      difficulty: 'medium',
      attacks: [
        PoisonCloud,
        PoisonBreath,
        FireBlast,
        ShadowBolt,
        () => new DarkVeil(Math.random() < 0.5 ? 'left' : 'right'),
        () => new MinionSpawn('ShadowMinion')
      ]
    },
    Python: {
      name: 'Python',
      title: 'Serpent of Delphi',
      strength: 14, speed: 40, durability: 16, regeneration: 12, supernatural: 14,
      color: [60, 80, 50],
      imageFile: 'python_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 450,
      difficulty: 'medium',
      attacks: [
        PoisonCloud,
        PoisonBreath,
        AcidSpit,
        FireBlast,
        GroundSlam,
        () => new MinionSpawn('Serpent')
      ]
    },
    // ===== HEROES WITH LIGHTNING =====
    Hercules: {
      name: 'Hercules',
      title: 'The Greatest Hero',
      strength: 20, speed: 35, durability: 20, regeneration: 5, supernatural: 8,
      color: [180, 140, 80],
      imageFile: 'hercules.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 600,
      difficulty: 'hard',
      attacks: [
        GroundSlam,
        LightningStrikeAttack,
        DashAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        ArrowVolley,
        RisingTornado
      ]
    },
    Melissa: {
      name: 'Melissa',
      title: 'The Lightning Warrior',
      strength: 14, speed: 55, durability: 12, regeneration: 8, supernatural: 14,
      color: [100, 150, 200],
      imageFile: 'melissa_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 400,
      difficulty: 'medium',
      attacks: [
        LightningStrikeAttack,
        HomingCloud,
        RisingTornado,
        DashAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        GroundSlam
      ]
    },
    Hebe: {
      name: 'Hebe',
      title: 'Goddess of Youth',
      strength: 8, speed: 50, durability: 8, regeneration: 20, supernatural: 12,
      color: [150, 200, 150],
      imageFile: 'hebe.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 300,
      difficulty: 'easy',
      attacks: [
        LightningStrikeAttack,
        HomingCloud,
        ShadowBolt,
        DashAttack,
        ArrowVolley
      ]
    },
    // ===== MONSTERS WITH POISON =====
    Echidna: {
      name: 'Echidna',
      title: 'Mother of Monsters',
      strength: 16, speed: 35, durability: 16, regeneration: 14, supernatural: 16,
      color: [80, 100, 60],
      imageFile: 'echidna_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 500,
      difficulty: 'hard',
      attacks: [
        PoisonCloud,
        PoisonBreath,
        AcidSpit,
        GroundSlam,
        () => new MinionSpawn('Serpent'),
        () => new MinionSpawn('HydraHead')
      ]
    },
    // ===== OTHER CHARACTERS =====
    Kat: {
      name: 'Kat',
      title: 'The Mysterious Chronicler',
      strength: 6, speed: 60, durability: 6, regeneration: 8, supernatural: 18,
      color: [100, 80, 120],
      imageFile: 'kat_1.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 200,
      difficulty: 'easy',
      attacks: [
        ShadowBolt,
        () => new DarkVeil(Math.random() < 0.5 ? 'left' : 'right'),
        DashAttack,
        HomingCloud,
        ArrowVolley
      ]
    },
    Draco: {
      name: 'Draco',
      title: 'The Dragon Guardian',
      strength: 15, speed: 40, durability: 18, regeneration: 10, supernatural: 14,
      color: [80, 60, 100],
      imageFile: 'draco.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 500,
      difficulty: 'hard',
      attacks: [
        FireBlast,
        () => new FireWall('bottom'),
        RisingTornado,
        GroundSlam,
        DashAttack,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right')
      ]
    },
    Metis: {
      name: 'Metis',
      title: 'Titaness of Wisdom',
      strength: 8, speed: 45, durability: 10, regeneration: 12, supernatural: 20,
      color: [120, 140, 180],
      imageFile: 'metis.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 350,
      difficulty: 'medium',
      attacks: [
        ShadowBolt,
        HomingCloud,
        () => new DarkVeil(Math.random() < 0.5 ? 'left' : 'right'),
        LightningStrikeAttack,
        DashAttack
      ]
    },
    Scythia: {
      name: 'Scythia',
      title: 'The Amazon Warrior',
      strength: 14, speed: 55, durability: 12, regeneration: 6, supernatural: 8,
      color: [150, 120, 80],
      imageFile: 'scythia.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 350,
      difficulty: 'medium',
      attacks: [
        ArrowVolley,
        DashAttack,
        GroundSlam,
        () => new SideWallAttack(Math.random() < 0.5 ? 'left' : 'right'),
        RisingTornado
      ]
    },
    TerraSolaris: {
      name: 'Terra Solaris',
      title: 'The Solar Titan',
      strength: 18, speed: 30, durability: 20, regeneration: 15, supernatural: 18,
      color: [255, 180, 80],
      imageFile: 'terra_solaris.png',
      bossImageFile: null,
      useImageAsBossSprite: true,
      transform: null,
      maxHp: 600,
      difficulty: 'hard',
      attacks: [
        SolarBeam,
        SunFlare,
        FireBlast,
        () => new FireWall('bottom'),
        GroundSlam,
        () => new MinionSpawn('FireSpirit')
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
    
    // Touch/Click controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    // Define button layout
    const w = this.canvas.width;
    const h = this.canvas.height;
    const btnSize = 50;
    const margin = 10;
    
    this.touchButtons = {
      // Movement buttons (left side)
      left: { x: margin, y: h - btnSize * 2 - margin, w: btnSize, h: btnSize, label: '◀', key: 'ArrowLeft' },
      right: { x: margin + btnSize * 2, y: h - btnSize * 2 - margin, w: btnSize, h: btnSize, label: '▶', key: 'ArrowRight' },
      up: { x: margin + btnSize, y: h - btnSize * 3 - margin, w: btnSize, h: btnSize, label: '▲', key: 'ArrowUp' },
      down: { x: margin + btnSize, y: h - btnSize - margin, w: btnSize, h: btnSize, label: '▼', key: 'ArrowDown' },
      
      // Action buttons (right side)
      enter: { x: w - btnSize * 2 - margin, y: h - btnSize * 4 - margin, w: btnSize * 2, h: btnSize, label: 'ENTER', action: 'enter' },
      targetLeft: { x: w - btnSize * 2 - margin * 2, y: h - btnSize * 3 - margin, w: btnSize, h: btnSize, label: '◁', action: 'targetLeft', turnOnly: true },
      targetRight: { x: w - btnSize - margin, y: h - btnSize * 3 - margin, w: btnSize, h: btnSize, label: '▷', action: 'targetRight', turnOnly: true },
      attack: { x: w - btnSize - margin, y: h - btnSize * 2 - margin, w: btnSize, h: btnSize, label: 'X', action: 'attack' },
      charge: { x: w - btnSize * 2 - margin * 2, y: h - btnSize * 2 - margin, w: btnSize, h: btnSize, label: 'C', action: 'charge' },
      heal: { x: w - btnSize - margin, y: h - btnSize - margin, w: btnSize, h: btnSize, label: 'H', action: 'heal' },
    };
    
    // Touch/click handlers
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    
    this.activeTouch = null;
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = this.getPointerPos(touch);
    this.handlePointerAction(pos, true);
  }

  handleTouchEnd(e) {
    // Release all movement keys
    for (const btn of Object.values(this.touchButtons)) {
      if (btn.key) {
        this.keys[btn.key] = false;
      }
    }
  }

  handlePointerDown(e) {
    const pos = this.getPointerPos(e);
    this.handlePointerAction(pos, true);
  }

  handlePointerUp(e) {
    // Release all movement keys
    for (const btn of Object.values(this.touchButtons)) {
      if (btn.key) {
        this.keys[btn.key] = false;
      }
    }
  }

  handlePointerAction(pos, isDown) {
    for (const [name, btn] of Object.entries(this.touchButtons)) {
      if (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
          pos.y >= btn.y && pos.y <= btn.y + btn.h) {
        
        if (btn.key) {
          // Movement button - hold
          this.keys[btn.key] = isDown;
        } else if (btn.action && isDown) {
          // Action button - trigger once
          this.triggerAction(btn.action);
        }
        break;
      }
    }
  }

  triggerAction(action) {
    switch (action) {
      case 'enter':
        if (this.player.attackGauge >= 100 && !this.playerTurn) {
          this.playerTurn = true;
          this.player.playerTurn = true;
          this.targetIndex = 0;
        }
        break;
      case 'targetLeft':
        if (this.playerTurn) {
          this.targetIndex = Math.max(0, this.targetIndex - 1);
        }
        break;
      case 'targetRight':
        if (this.playerTurn) {
          this.targetIndex = Math.min(this.minions.length, this.targetIndex + 1);
        }
        break;
      case 'attack':
        if (this.playerTurn) {
          this.playerAttack();
          this.player.resetCharge();
          this.playerTurn = false;
          this.player.playerTurn = false;
          
          if (this.boss.hp <= 0) {
            if (this.boss.transform) {
              this.transformBoss();
            } else {
              this.victory = true;
              this.gameOver = true;
              this.recordVictory();
            }
          }
        }
        break;
      case 'charge':
        if (this.playerTurn && this.player.attackGauge >= 100 && 
            this.player.chargeLevel < this.player.maxCharges) {
          this.player.addCharge();
          this.player.attackGauge = 0;
          this.playerTurn = false;
          this.player.playerTurn = false;
        }
        break;
      case 'heal':
        if (this.playerTurn) {
          this.player.hp = this.player.maxHp;
          this.player.attackGauge = 0;
          this.player.resetCharge();
          this.playerTurn = false;
          this.player.playerTurn = false;
        }
        break;
    }
  }

  drawTouchControls() {
    const ctx = this.ctx;
    
    for (const [name, btn] of Object.entries(this.touchButtons)) {
      // Skip turn-only buttons when not in player turn
      if (btn.turnOnly && !this.playerTurn) continue;
      
      // Determine button visibility/state
      let isEnabled = true;
      let bgColor = 'rgba(60, 60, 80, 0.7)';
      
      if (name === 'enter' && (this.player.attackGauge < 100 || this.playerTurn)) {
        isEnabled = false;
        bgColor = 'rgba(40, 40, 50, 0.4)';
      }
      if ((name === 'attack' || name === 'heal' || name === 'charge') && !this.playerTurn) {
        isEnabled = false;
        bgColor = 'rgba(40, 40, 50, 0.4)';
      }
      if (name === 'charge' && this.player.chargeLevel >= this.player.maxCharges) {
        isEnabled = false;
        bgColor = 'rgba(40, 40, 50, 0.4)';
      }
      
      // Button background
      ctx.fillStyle = bgColor;
      ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
      
      // Border
      ctx.strokeStyle = isEnabled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      
      // Highlight if active
      if (btn.key && this.keys[btn.key]) {
        ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
      }
      
      // Label
      ctx.fillStyle = isEnabled ? '#fff' : 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  async loadAssets() {
    try {
      // Load background first
      if (this.boss.backgroundFile) {
        this.boss.backgroundImage = await loadImage(this.boss.backgroundFile);
      } else if (this.boss.useImageAsBossSprite) {
        // Use storm background as default for bosses with sprite images
        try {
          this.boss.backgroundImage = await loadImage('Storm Background.png');
        } catch (e) {
          console.log('Storm background not found, using color fallback');
        }
      }
      
      // Load boss image
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

    // Prevent page scrolling on space
    if (e.code === 'Space') {
      e.preventDefault();
    }

    if (e.code === 'Enter' && this.player.attackGauge >= 100 && !this.playerTurn) {
      this.playerTurn = true;
      this.player.playerTurn = true;
      this.targetIndex = 0;
    } else if (this.playerTurn) {
      if (e.code === 'ArrowLeft') {
        this.targetIndex = Math.max(0, this.targetIndex - 1);
      } else if (e.code === 'ArrowRight') {
        this.targetIndex = Math.min(this.minions.length, this.targetIndex + 1);
      } else if (e.code === 'KeyC') {
        // Charge attack (only if gauge is full and not at max charges)
        if (this.player.attackGauge >= 100 && this.player.chargeLevel < this.player.maxCharges) {
          this.player.addCharge();
          this.player.attackGauge = 0; // Reset gauge after charging
          this.playerTurn = false;
          this.player.playerTurn = false;
        }
      } else if (e.code === 'KeyH') {
        // Heal (resets charge)
        this.player.hp = this.player.maxHp;
        this.player.attackGauge = 0;
        this.player.resetCharge();
        this.playerTurn = false;
        this.player.playerTurn = false;
      } else if (e.code === 'KeyX') {
        // Attack (resets charge after dealing damage)
        this.playerAttack();
        this.player.resetCharge();
        this.playerTurn = false;
        this.player.playerTurn = false;
        
        if (this.boss.hp <= 0) {
          if (this.boss.transform) {
            this.transformBoss();
          } else {
            this.victory = true;
            this.gameOver = true;
            this.recordVictory();
          }
        }
      }
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  playerAttack() {
    const baseDmg = 25 + Math.floor(this.player.attackGauge * 0.1);
    const chargeMult = this.player.getChargeMult();
    const dmg = Math.floor(baseDmg * chargeMult);
    
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

      // Update minions (for monster head beam attacks)
      for (const minion of this.minions) {
        if (minion.update) {
          minion.update(this);
        }
      }

      // Apply continuous effects (like wind pushing)
      for (const atk of this.boss.activeAttacks) {
        if (atk.continuous && atk.applyContinuousEffect) {
          atk.applyContinuousEffect(this.player, this);
        }
      }

      // Check collisions (one-time damage effects)
      for (const atk of this.boss.activeAttacks) {
        if (atk.state === 'active' && !atk.continuous && atk.checkCollision(this.player)) {
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
      
      // Monster heads draw themselves on screen sides
      if (m.isMonsterHead) {
        m.draw(this.ctx, this, i);
        // Still draw a small indicator in the minion bar
        this.ctx.fillStyle = m.beamElement === 'fire' ? 'rgba(180, 60, 40, 0.8)' : 'rgba(60, 140, 80, 0.8)';
        this.ctx.fillRect(mx, 60, 60, 60);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(`${m.name}`, mx + 2, 75);
        this.ctx.fillText(`HP: ${Math.floor(m.hp)}`, mx + 2, 90);
        this.ctx.fillText(`[${m.side}]`, mx + 2, 105);
      } else {
        // Regular minions - draw in the top bar
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        this.ctx.fillRect(mx, 60, 60, 60);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText(`${m.name}`, mx + 5, 75);
        this.ctx.fillText(`HP: ${Math.floor(m.hp)}`, mx + 5, 110);
      }
      
      // Draw selection arrow
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

    // Draw touch controls
    this.drawTouchControls();

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

    // Charge indicator
    if (this.player.chargeLevel > 0) {
      const chargeY = py + 34;
      const chargeColors = ['#ff8800', '#ff0088'];
      for (let i = 0; i < this.player.chargeLevel; i++) {
        this.ctx.fillStyle = chargeColors[i] || '#ff0088';
        this.ctx.beginPath();
        this.ctx.arc(px + 20 + i * 25, chargeY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.fillText(`${i === 0 ? '2.5' : '6.25'}x`, px + 20 + i * 25, chargeY + 3);
      }
    }

    // Turn prompt
    if (this.playerTurn) {
      this.ctx.fillStyle = '#ffff88';
      this.ctx.font = '12px sans-serif';
      const chargeText = this.player.chargeLevel < 2 ? ' | C charge' : '';
      this.ctx.fillText(`← → select | X attack | H heal${chargeText}`, px + playerBarW / 2, py + 50);
    } else if (this.player.attackGauge >= 100) {
      this.ctx.fillStyle = '#88ff88';
      this.ctx.font = '13px sans-serif';
      this.ctx.fillText('Press ENTER to attack!', px + playerBarW / 2, py + 50);
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

  // ============= PROGRESS TRACKING =============
  recordVictory() {
    const bossName = this.bossName;
    const difficulty = this.boss.difficulty || 'medium';
    
    // Save to localStorage immediately
    this.saveToLocalStorage(bossName, difficulty);
    
    // Try to sync with server (if logged in)
    this.syncWithServer(bossName, difficulty);
  }

  saveToLocalStorage(bossName, difficulty) {
    try {
      const key = 'bossFightProgress';
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      
      if (!existing.defeats) existing.defeats = {};
      if (!existing.defeats[bossName]) {
        existing.defeats[bossName] = {
          count: 0,
          difficulty: difficulty,
          firstDefeated: new Date().toISOString(),
          synced: false,
        };
      }
      
      existing.defeats[bossName].count++;
      existing.defeats[bossName].lastDefeated = new Date().toISOString();
      existing.defeats[bossName].synced = false;
      
      // Update total stats
      if (!existing.stats) existing.stats = { totalVictories: 0 };
      existing.stats.totalVictories++;
      
      localStorage.setItem(key, JSON.stringify(existing));
      
      // Dispatch event for any listeners
      window.dispatchEvent(new CustomEvent('bossDefeated', {
        detail: { bossName, difficulty, progress: existing }
      }));
      
      console.log(`✓ Saved victory against ${bossName} to localStorage`);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  async syncWithServer(bossName, difficulty) {
    try {
      const response = await fetch('/api/record_boss_defeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken(),
        },
        body: JSON.stringify({ boss_name: bossName, difficulty: difficulty }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✓ Synced victory to server (+${data.points_awarded} pts)`);
          
          // Mark as synced in localStorage
          this.markSynced(bossName);
          
          // Update header display if exists
          this.updateHeaderPoints(data);
          
          // Dispatch sync event
          window.dispatchEvent(new CustomEvent('pointsEarned', {
            detail: data
          }));
        }
      }
    } catch (e) {
      // Server sync failed, will retry on next login
      console.log('Server sync pending (not logged in or offline)');
    }
  }

  markSynced(bossName) {
    try {
      const key = 'bossFightProgress';
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      if (existing.defeats && existing.defeats[bossName]) {
        existing.defeats[bossName].synced = true;
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (e) {
      // Ignore
    }
  }

  updateHeaderPoints(data) {
    const pointsDisplay = document.getElementById('points-display');
    if (pointsDisplay) {
      pointsDisplay.textContent = data.total_points.toLocaleString();
      pointsDisplay.classList.add('points-earned');
      setTimeout(() => pointsDisplay.classList.remove('points-earned'), 500);
    }
  }

  getCSRFToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }
}

// ============= STATIC PROGRESS HELPERS =============
window.BossFightProgress = {
  getProgress() {
    try {
      return JSON.parse(localStorage.getItem('bossFightProgress') || '{}');
    } catch {
      return {};
    }
  },

  getUnsynced() {
    const progress = this.getProgress();
    const unsynced = [];
    if (progress.defeats) {
      for (const [bossName, data] of Object.entries(progress.defeats)) {
        if (!data.synced) {
          unsynced.push({ boss_name: bossName, difficulty: data.difficulty });
        }
      }
    }
    return unsynced;
  },

  async syncAll() {
    const unsynced = this.getUnsynced();
    if (unsynced.length === 0) return { success: true, synced: 0 };

    try {
      const meta = document.querySelector('meta[name="csrf-token"]');
      const token = meta ? meta.getAttribute('content') : '';
      
      const response = await fetch('/api/sync_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify({ boss_defeats: unsynced }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mark all as synced
          const progress = this.getProgress();
          for (const defeat of unsynced) {
            if (progress.defeats && progress.defeats[defeat.boss_name]) {
              progress.defeats[defeat.boss_name].synced = true;
            }
          }
          localStorage.setItem('bossFightProgress', JSON.stringify(progress));
          return { success: true, synced: unsynced.length, data };
        }
      }
      return { success: false };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  clearProgress() {
    localStorage.removeItem('bossFightProgress');
  },
};

// Export for use
window.BossFightGame = Game;

