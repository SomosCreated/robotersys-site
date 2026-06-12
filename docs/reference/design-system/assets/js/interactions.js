// ---------------------------------------------
      // 1. HERO & SPOTLIGHT INTERACTION
      // ---------------------------------------------
      document.addEventListener('DOMContentLoaded', () => {
        const hero = document.getElementById('hero');
        const spotlight = document.getElementById('hero-spotlight');
        const spotlightCore = document.getElementById('hero-spotlight-core');
        const cards = document.querySelectorAll('.telemetry-card');
        const bgVideo = document.getElementById('hero-bg-video');

        if (window.matchMedia("(hover: hover)").matches) {
          hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // INTENSIFIED SPOTLIGHT
            spotlight.style.opacity = '1';
            spotlight.style.background = `radial-gradient(1000px at ${mouseX}px ${mouseY}px, rgba(234, 88, 12, 0.25), transparent 60%)`;
            
            spotlightCore.style.opacity = '1';
            spotlightCore.style.background = `radial-gradient(400px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.08), transparent 60%)`;

            // Parallax
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const percentX = (mouseX - centerX) / centerX;
            const percentY = (mouseY - centerY) / centerY;

            if(bgVideo) bgVideo.style.transform = `scale(1.05) translate(${percentX * -15}px, ${percentY * -15}px)`;

            cards.forEach(card => {
              const depth = parseFloat(card.dataset.depth || 0.1);
              const moveX = percentX * 60 * depth;
              const moveY = percentY * 60 * depth;
              card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${percentY * -8}deg) rotateY(${percentX * 8}deg)`;
            });
          });

          hero.addEventListener('mouseleave', () => {
            spotlight.style.opacity = '0';
            spotlightCore.style.opacity = '0';
            cards.forEach(card => card.style.transform = 'translate3d(0,0,0)');
          });
        }
      });

      // ---------------------------------------------
      // 2. NEURAL GRID GENERATION & INTERACTION
      // ---------------------------------------------
      document.addEventListener('DOMContentLoaded', () => {
        const gridContainer = document.getElementById('neural-grid');
        const nodeCountEl = document.getElementById('node-count');
        
        // Generate grid cells (200 cells)
        for (let i = 0; i < 200; i++) {
            const cell = document.createElement('div');
            cell.className = 'neural-cell border-r border-b border-zinc-800/30';
            gridContainer.appendChild(cell);
        }

        const cells = document.querySelectorAll('.neural-cell');
        
        // Hover interaction
        gridContainer.addEventListener('mousemove', (e) => {
           // Get element under cursor
           // This simple approach relies on css :hover, but let's add neighbor effect
           const rect = gridContainer.getBoundingClientRect();
           // Just update random numbers for "tech" feel
           if(Math.random() > 0.8) nodeCountEl.innerText = Math.floor(Math.random() * 500) + 120;
        });

        // Add neighbor class logic via mouseover
        cells.forEach((cell, index) => {
            cell.addEventListener('mouseenter', () => {
                cell.classList.add('active');
                // Light up neighbors randomly for organic feel
                const neighbors = [index-1, index+1, index-20, index+20];
                neighbors.forEach(n => {
                    if(cells[n] && Math.random() > 0.5) {
                        cells[n].classList.add('active');
                        setTimeout(() => cells[n].classList.remove('active'), 200);
                    }
                });
                // Remove active class after delay to create trail
                setTimeout(() => {
                    cell.classList.remove('active');
                }, 500);
            });
        });
      });

      // ---------------------------------------------
      // 3. EXPLODED VIEW PARALLAX FUNCTION
      // ---------------------------------------------
      function updateExplodedView(event) {
          const container = document.getElementById('exploded-container');
          if (!container) return;
          
          const rect = container.getBoundingClientRect();
          // Calculate distance from center of container vertical
          const centerY = rect.top + rect.height / 2;
          const distY = event.clientY - centerY;
          
          // Normalized -1 to 1 based on viewport height mostly
          const factor = Math.max(-1, Math.min(1, distY / 300));
          
          const layers = container.querySelectorAll('.layer-item');
          const line = container.querySelector('.layer-line');
          
          // Show line if separated
          if(Math.abs(factor) > 0.2) line.style.opacity = '1';
          else line.style.opacity = '0';

          layers.forEach(layer => {
              const speed = parseFloat(layer.getAttribute('data-speed'));
              // Move layers apart vertically based on mouse position
              // Top layer moves up, bottom moves down
              const yOffset = factor * speed * 40; // 40px multiplier
              
              // Add slight rotation
              const rotateX = -factor * 20; 
              
              layer.style.transform = `translate(-50%, calc(-50% - ${yOffset}px)) rotateX(${rotateX}deg)`;
          });
      }

      // ---------------------------------------------
      // 4. SPECS GRID "FLASHLIGHT" BORDER EFFECT
      // ---------------------------------------------
      document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('specs-grid');
        if (!grid) return;
        
        grid.addEventListener('mousemove', (e) => {
          const cards = grid.querySelectorAll('.spotlight-card');
          cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
          });
        });
      });

      // ---------------------------------------------
      // 5. 3D CARDS & HOLOGRAPHIC SHEEN
      // ---------------------------------------------
      document.addEventListener('DOMContentLoaded', () => {
        const cards = document.querySelectorAll('.select-card');
        cards.forEach(card => {
          const inner = card.querySelector('.card-inner');
          
          if (window.matchMedia("(hover: hover)").matches) {
            card.addEventListener('mousemove', (e) => {
              if (inner.classList.contains('is-flipped')) return;
              
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              
              // Enhanced Rotation
              const rotateX = ((y - centerY) / centerY) * -12; 
              const rotateY = ((x - centerX) / centerX) * 12;

              inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
              
              // Update Sheen Position
              card.style.setProperty('--mouse-x', `${x}px`);
              card.style.setProperty('--mouse-y', `${y}px`);
            });

            card.addEventListener('mouseleave', () => {
              if (!inner.classList.contains('is-flipped')) {
                 inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
              }
            });
          }

          // Flip logic
          const flipBtn = card.querySelector('.flip-btn');
          const unflipBtn = card.querySelector('.unflip-btn');
          if(flipBtn) {
            flipBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              inner.classList.add('is-flipped');
              inner.style.transform = 'rotateY(180deg)';
            });
          }
          if(unflipBtn) {
            unflipBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              inner.classList.remove('is-flipped');
              inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
          }
        });
      });

      // ---------------------------------------------
      // 6. GENERAL UI LOGIC
      // ---------------------------------------------
      // Decode Text Effect
      const glitchText = document.querySelector('.glitch-text');
        if(glitchText) {
          const originalText = glitchText.dataset.text;
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_//";
          let interval = null;
          const startGlitch = () => {
            let iteration = 0;
            clearInterval(interval);
            interval = setInterval(() => {
              glitchText.innerText = originalText.split("").map((letter, index) => {
                if(index < iteration) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
              }).join("");
              if(iteration >= originalText.length) clearInterval(interval);
              iteration += 1/3;
            }, 30);
          };
          setTimeout(startGlitch, 500);
          glitchText.addEventListener('mouseover', startGlitch);
        }

      // Tab Switcher
      window.switchTab = function(index) {
        document.querySelectorAll('.scenario-tab').forEach(tab => {
          const isSelected = tab.getAttribute('data-index') == index;
          if(isSelected) {
            tab.classList.add('border-orange-600', 'bg-zinc-900/30');
            tab.classList.remove('border-transparent');
            tab.querySelector('.text-base').classList.remove('text-zinc-400');
            tab.querySelector('.text-base').classList.add('text-white');
          } else {
            tab.classList.remove('border-orange-600', 'bg-zinc-900/30');
            tab.classList.add('border-transparent');
            tab.querySelector('.text-base').classList.add('text-zinc-400');
            tab.querySelector('.text-base').classList.remove('text-white');
          }
        });
        document.querySelectorAll('.scenario-panel').forEach(panel => {
          if(panel.getAttribute('data-index') == index) {
            panel.classList.remove('opacity-0', 'pointer-events-none', 'z-0', 'translate-x-4');
            panel.classList.add('opacity-100', 'z-10', 'translate-x-0');
          } else {
            panel.classList.add('opacity-0', 'pointer-events-none', 'z-0', 'translate-x-4');
            panel.classList.remove('opacity-100', 'z-10', 'translate-x-0');
          }
        });
      };

      // Intersection Observers
      document.addEventListener("DOMContentLoaded", () => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("sys-active");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        document.querySelectorAll(".sys-reveal").forEach(el => observer.observe(el));
      });
      
      // Recommendation Logic
      document.addEventListener('DOMContentLoaded', () => {
        let currentRadius = 'small';
        let currentTerrain = 'flat';
        const updateRecommendation = () => {
          let target = 'vanguard';
          if (currentRadius === 'large') target = 'goliath';
          else if (currentRadius === 'medium' || currentTerrain === 'complex') target = 'sentinel';
          document.querySelectorAll('.recommend-badge').forEach(el => el.style.opacity = '0');
          const targetCard = document.querySelector(`.select-card[data-model="${target}"]`);
          if(targetCard) {
             const badge = targetCard.querySelector('.recommend-badge');
             if(badge) badge.style.opacity = '1';
          }
        };
        const rBtns = document.querySelectorAll('.filter-btn-radius');
        rBtns.forEach(btn => btn.addEventListener('click', (e) => {
            rBtns.forEach(b => { b.classList.remove('bg-zinc-800', 'text-white', 'shadow-sm'); b.classList.add('text-zinc-500'); });
            e.target.classList.add('bg-zinc-800', 'text-white', 'shadow-sm'); e.target.classList.remove('text-zinc-500');
            currentRadius = e.target.dataset.value; updateRecommendation();
        }));
        const tBtns = document.querySelectorAll('.filter-btn-terrain');
        tBtns.forEach(btn => btn.addEventListener('click', (e) => {
             tBtns.forEach(b => { b.classList.remove('bg-zinc-800', 'text-white', 'shadow-sm'); b.classList.add('text-zinc-500'); });
            e.target.classList.add('bg-zinc-800', 'text-white', 'shadow-sm'); e.target.classList.remove('text-zinc-500');
            currentTerrain = e.target.dataset.value; updateRecommendation();
        }));
      });
