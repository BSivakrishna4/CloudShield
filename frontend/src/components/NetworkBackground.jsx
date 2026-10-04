import React, { useEffect, useRef } from 'react';

/**
 * NetworkBackground Component
 * Renders a lightweight, ultra-subtle enterprise cloud network background:
 * - Subtle geometric grid
 * - Slow-drifting network telemetry nodes
 * - Faint infrastructure connection lines
 * - Slow data packet pulses along links
 * Fully respects prefers-reduced-motion and pointer-events: none.
 */
export default function NetworkBackground({ isDarkMode = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Subtle cloud telemetry nodes
    const nodeCount = Math.min(Math.floor((width * height) / 36000), 32);
    let nodes = [];

    const initNodes = () => {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25, // Extremely slow drift
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.5 + 1.5 // 1.5px - 3px
        });
      }
    };

    initNodes();

    // Minor slow packet pulses along connections
    const packets = [
      { from: 0, to: 1, progress: 0, speed: 0.003 },
      { from: 2, to: 3, progress: 0.4, speed: 0.0025 },
      { from: 4, to: 5, progress: 0.7, speed: 0.0035 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle connection links
      const maxDistance = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Extremely faint line (opacity 0.04 - 0.08)
            const alpha = (1 - dist / maxDistance) * (isDarkMode ? 0.12 : 0.07);
            ctx.strokeStyle = isDarkMode ? `rgba(56, 189, 248, ${alpha})` : `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw packets traveling between nodes
      if (!prefersReducedMotion && nodes.length > 5) {
        packets.forEach((p, idx) => {
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
            p.from = Math.floor(Math.random() * nodes.length);
            p.to = (p.from + Math.floor(Math.random() * 3) + 1) % nodes.length;
          }

          const n1 = nodes[p.from];
          const n2 = nodes[p.to];
          if (n1 && n2) {
            const px = n1.x + (n2.x - n1.x) * p.progress;
            const py = n1.y + (n2.y - n1.y) * p.progress;

            ctx.fillStyle = isDarkMode ? 'rgba(56, 189, 248, 0.45)' : 'rgba(37, 99, 235, 0.25)';
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 3. Draw nodes
      nodes.forEach((node) => {
        // Soft slate-blue node in light mode, soft cyan node in dark mode
        ctx.fillStyle = isDarkMode ? 'rgba(148, 163, 184, 0.25)' : 'rgba(71, 85, 105, 0.12)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDarkMode]);

  return (
    <div className="network-bg-layer" aria-hidden="true">
      <div className="network-grid-overlay" />
      <canvas ref={canvasRef} className="network-canvas" />
    </div>
  );
}
