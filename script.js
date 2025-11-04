
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // 季節設定
    const seasons = [
      {
        name: '春 Spring',
        bgGradient: ['#FFE5EC', '#FFC2D4', '#FFB3C6'],
        particles: 80,
        particleColor: ['#FFB3D9', '#FFC1E3', '#FFD4E9'],
        particleSpeed: 0.5,
        particleSize: [3, 8],
        wind: 0.3,
        type: 'petal'
      },
      {
        name: '夏 Summer',
        bgGradient: ['#4FC3F7', '#29B6F6', '#03A9F4'],
        particles: 0,
        particleColor: [],
        particleSpeed: 0,
        particleSize: [0, 0],
        wind: 0,
        type: 'none'
      },
      {
        name: '秋 Autumn',
        bgGradient: ['#FFB74D', '#FF9800', '#F57C00'],
        particles: 60,
        particleColor: ['#FFA726', '#FF9800', '#FB8C00', '#F57C00'],
        particleSpeed: 0.8,
        particleSize: [4, 10],
        wind: 0.5,
        type: 'leaf'
      },
      {
        name: '冬 Winter',
        bgGradient: ['#1A237E', '#283593', '#3949AB'],
        particles: 150,
        particleColor: ['rgba(255,255,255,0.9)'],
        particleSpeed: 1.2,
        particleSize: [2, 6],
        wind: 0.4,
        type: 'snow'
      }
    ];

    let currentSeason = 0;
    let targetSeason = 0;
    let transition = 1;
    let particles = [];
    let autoMode = false;
    let time = 0;
    let snowGround = 0;
    let clouds = [];

    class Particle {
      constructor(season) {
        this.reset(season);
        this.y = Math.random() * h;
      }

      reset(season) {
        const s = seasons[season];
        this.x = Math.random() * w;
        this.y = -50;
        this.size = s.particleSize[0] + Math.random() * (s.particleSize[1] - s.particleSize[0]);
        this.speed = s.particleSpeed * (0.5 + Math.random());
        this.color = s.particleColor[Math.floor(Math.random() * s.particleColor.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.05;
        this.opacity = 0.6 + Math.random() * 0.4;
        this.layer = Math.random();
      }

      update(season) {
        const s = seasons[season];
        this.angle += this.spin;
        
        this.y += this.speed * this.layer;
        this.x += Math.sin(time * 0.001 + this.angle) * s.wind;

        if (this.y > h + 50) {
          if (season === 3) {
            snowGround = Math.min(snowGround + 0.1, h * 0.15);
          }
          this.reset(season);
        }
        if (this.x > w + 50) this.x = -50;
        if (this.x < -50) this.x = w + 50;
      }

      draw(season) {
        const s = seasons[season];
        ctx.save();
        ctx.globalAlpha = this.opacity * transition;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (s.type === 'petal') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.type === 'leaf') {
          // 銀杏の葉の形状
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(0, this.size * 0.3);
          ctx.quadraticCurveTo(-this.size * 0.8, 0, -this.size * 0.5, -this.size);
          ctx.quadraticCurveTo(-this.size * 0.2, -this.size * 0.7, 0, -this.size * 0.8);
          ctx.quadraticCurveTo(this.size * 0.2, -this.size * 0.7, this.size * 0.5, -this.size);
          ctx.quadraticCurveTo(this.size * 0.8, 0, 0, this.size * 0.3);
          ctx.fill();
        } else if (s.type === 'snow') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    function initParticles() {
      particles = [];
      const count = seasons[targetSeason].particles;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(targetSeason));
      }
      if (targetSeason !== 3) {
        snowGround = 0;
      }
      if (targetSeason === 1) {
        initClouds();
      }
    }

    function initClouds() {
      clouds = [];
      for (let i = 0; i < 5; i++) {
        clouds.push({
          x: (w / 5) * i + Math.random() * 50,
          y: 50 + Math.random() * (h * 0.4),
          width: 100 + Math.random() * 100,
          height: 40 + Math.random() * 40,
          speed: 0.2 + Math.random() * 0.3,
          opacity: 0.6 + Math.random() * 0.3
        });
      }
    }

    function drawBackground() {
      const s = seasons[currentSeason];
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      
      if (transition < 1) {
        const s2 = seasons[targetSeason];
        for (let i = 0; i < 3; i++) {
          const ratio = i / 2;
          const c1 = s.bgGradient[i];
          const c2 = s2.bgGradient[i];
          grd.addColorStop(ratio, lerpColor(c1, c2, transition));
        }
      } else {
        for (let i = 0; i < s.bgGradient.length; i++) {
          grd.addColorStop(i / (s.bgGradient.length - 1), s.bgGradient[i]);
        }
      }
      
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // 春の桜の木
      if ((currentSeason === 0 && transition >= 1) || (targetSeason === 0 && transition < 1)) {
        const treeOpacity = currentSeason === 0 ? 1 : 1 - transition;
        ctx.save();
        ctx.globalAlpha = treeOpacity;
        ctx.restore();
      }

      // 夏の太陽と雲
      if ((currentSeason === 1 && transition >= 1) || (targetSeason === 1 && transition < 1)) {
        const sunOpacity = currentSeason === 1 ? 1 : 1 - transition;
        ctx.save();
        ctx.globalAlpha = sunOpacity;
        const sunGrd = ctx.createRadialGradient(w*0.85, h*0.15, 0, w*0.85, h*0.15, 100);
        sunGrd.addColorStop(0, 'rgba(255,255,200,1)');
        sunGrd.addColorStop(0.5, 'rgba(255,255,200,0.3)');
        sunGrd.addColorStop(1, 'rgba(255,255,200,0)');
        ctx.fillStyle = sunGrd;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        
        // 雲を描画
        ctx.save();
        clouds.forEach(cloud => {
          ctx.globalAlpha = sunOpacity * cloud.opacity;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          
          // 雲を複数の楕円で描画
          ctx.beginPath();
          ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.5, cloud.height * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(cloud.x - cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // 雲を移動
          cloud.x += cloud.speed;
          if (cloud.x - cloud.width > w) {
            cloud.x = -cloud.width;
          }
        });
        ctx.restore();
      }

      // 秋の枯れ木
      if ((currentSeason === 2 && transition >= 1) || (targetSeason === 2 && transition < 1)) {
        const treeOpacity = currentSeason === 2 ? 1 : 1 - transition;
        ctx.save();
        ctx.globalAlpha = treeOpacity;
        drawAutumnTree();
        ctx.restore();
      }

      // 冬の月と星
      if ((currentSeason === 3 && transition >= 1) || (targetSeason === 3 && transition < 1)) {
        const moonOpacity = currentSeason === 3 ? 1 : 1 - transition;
        ctx.save();
        ctx.globalAlpha = moonOpacity;
        
        // 月
        const moonGrd = ctx.createRadialGradient(w*0.8, h*0.2, 0, w*0.8, h*0.2, 60);
        moonGrd.addColorStop(0, 'rgba(255,255,255,0.9)');
        moonGrd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = moonGrd;
        ctx.beginPath();
        ctx.arc(w*0.8, h*0.2, 60, 0, Math.PI*2);
        ctx.fill();
        
        // 星
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          const sx = (i * 137.5) % w;
          const sy = (i * 211.3) % (h * 0.6);
          const twinkle = Math.sin(time * 0.003 + i) * 0.5 + 0.5;
          ctx.globalAlpha = moonOpacity * twinkle;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 冬の積雪
      if ((currentSeason === 3 && transition >= 1) || (targetSeason === 3 && transition < 1)) {
        const snowOpacity = currentSeason === 3 ? 1 : 1 - transition;
        ctx.save();
        ctx.globalAlpha = snowOpacity;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 30) {
          const waveY = Math.sin(x * 0.01 + time * 0.01) * 5;
          ctx.lineTo(x, h - snowGround + waveY);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function lerpColor(c1, c2, t) {
      const hex2rgb = (hex) => {
        if (hex.startsWith('rgba')) {
          const match = hex.match(/[\d.]+/g);
          return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
        }
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return [r,g,b];
      };
      
      const rgb1 = hex2rgb(c1);
      const rgb2 = hex2rgb(c2);
      const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
      const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
      const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
      return `rgb(${r},${g},${b})`;
    }

    function drawSakuraTree() {
      // 削除
    }

    function drawAutumnTree() {
      const treeX = w * 0.8;
      const treeY = h * 0.8;
      
      // 幹
      ctx.fillStyle = '#3D2817';
      ctx.fillRect(treeX - 10, treeY, 20, h - treeY);
      
      // 枝（再帰的に描画）
      ctx.strokeStyle = '#3D2817';
      ctx.lineCap = 'round';
      
      function drawBranch(x, y, length, angle, depth) {
        if (depth === 0) return;
        
        const x2 = x + Math.cos(angle) * length;
        const y2 = y - Math.sin(angle) * length;
        
        ctx.lineWidth = depth * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        if (depth > 1) {
          drawBranch(x2, y2, length * 0.7, angle - 0.4, depth - 1);
          drawBranch(x2, y2, length * 0.7, angle + 0.3, depth - 1);
        }
      }
      
      drawBranch(treeX, treeY, 60, Math.PI / 2, 5);
    }

    function animate() {
      time++;
      
      if (transition < 1) {
        transition += 0.01;
        if (transition >= 1) {
          currentSeason = targetSeason;
          transition = 1;
        }
      }

      drawBackground();
      
      particles.forEach(p => {
        p.update(currentSeason);
        p.draw(currentSeason);
      });

      requestAnimationFrame(animate);
    }

    function changeSeason(index) {
      targetSeason = (index + seasons.length) % seasons.length;
      transition = 0;
      document.getElementById('seasonLabel').textContent = seasons[targetSeason].name;
      document.getElementById('seasonLabel').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('seasonLabel').style.opacity = '1';
      }, 50);
      initParticles();
    }

    document.getElementById('prev').onclick = () => {
      changeSeason(currentSeason - 1);
    };

    document.getElementById('next').onclick = () => {
      changeSeason(currentSeason + 1);
    };

    document.getElementById('auto').onclick = () => {
      autoMode = !autoMode;
      document.getElementById('auto').classList.toggle('active', autoMode);
      if (autoMode) autoChange();
    };

    function autoChange() {
      if (!autoMode) return;
      changeSeason(currentSeason + 1);
      setTimeout(autoChange, 8000);
    }

    initParticles();
    initClouds();
    animate();