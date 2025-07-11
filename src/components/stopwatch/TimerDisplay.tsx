import React, { useRef, useEffect } from 'react';

interface TimerDisplayProps {
  elapsedTime: number;
  isRunning: boolean;
  displayTime: number;
  tintOpacity: number;
  progressBarColor: string;
  formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  elapsedTime,
  isRunning,
  displayTime,
  tintOpacity,
  progressBarColor,
  formatTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<{x: number, y: number, size: number, rippleSize: number, splashing: boolean} | null>(null);
  const auroraTimeRef = useRef(0);

  // Aurora Borealis animation effect
  useEffect(() => {
    if (!canvasRef.current || !fluidCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const fluidCanvas = fluidCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const fluidCtx = fluidCanvas.getContext('2d');
    
    if (!ctx || !fluidCtx) return;
    
    // Set canvas sizes
    const size = 260;
    canvas.width = size;
    canvas.height = size;
    fluidCanvas.width = size;
    fluidCanvas.height = size;
    
    let animationFrameId: number;
    
    // Vibrant color palette
    const auroraColors = [
      'rgba(101, 227, 242, 0.65)', // Brighter Teal
      'rgba(66, 220, 244, 0.65)',  // Bright Cyan
      'rgba(117, 255, 209, 0.60)', // Bright Turquoise
      'rgba(178, 150, 255, 0.65)', // Bright Purple
      'rgba(255, 223, 107, 0.60)', // Bright Yellow
      'rgba(76, 255, 196, 0.65)',  // Bright Emerald
      'rgba(100, 230, 255, 0.65)', // Bright Sky Blue
      'rgba(255, 150, 230, 0.60)', // Bright Pink
    ];
    
    const drawAurora = (timestamp: number) => {
      // Initialize time tracking for aurora
      if (!auroraTimeRef.current) auroraTimeRef.current = timestamp;
      const delta = timestamp - auroraTimeRef.current;
      auroraTimeRef.current = timestamp;
      
      ctx.clearRect(0, 0, size, size);
      fluidCtx.clearRect(0, 0, size, size);
      
      // Create clipping path for circle
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw subtle blue water-like background with tint
      ctx.fillStyle = `rgba(235, 245, 255, ${tintOpacity})`;
      ctx.fillRect(0, 0, size, size);
      
      // Draw aurora layers
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        
        // Parameters for faster, more vibrant aurora
        const offset = i * 0.5;
        const waveHeight = 35 + i * 12; 
        const speed = 0.0003; // Time-based animation
        
        ctx.moveTo(0, size/2);
        
        // Wave path
        for (let x = 0; x <= size; x += 2) {
          const noise = Math.sin(x * 0.03 + timestamp * 0.0001) * 8;
          const y = size/2 + 
                    Math.sin(x * 0.015 + timestamp * speed + offset) * waveHeight + 
                    Math.cos(x * 0.025 + timestamp * (speed * 1.5) + offset) * (waveHeight * 0.7) +
                    noise;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        
        // Create gradient with vibrant colors
        const gradient = ctx.createLinearGradient(0, size/2, size, size/2);
        gradient.addColorStop(0, auroraColors[i % auroraColors.length]);
        gradient.addColorStop(0.5, auroraColors[(i + 4) % auroraColors.length]);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 + (i * 0.05);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      // Draw fluid blue ring if running
      if (isRunning) {
        const center = size / 2;
        const radius = size / 2 - 10;
        const progress = (displayTime % 60) / 60;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (2 * Math.PI * progress);
        
        // Draw fluid blue line
        fluidCtx.beginPath();
        fluidCtx.arc(center, center, radius, startAngle, endAngle, false);
        fluidCtx.lineWidth = 6;
        
        // Create gradient for fluid line
        const gradient = fluidCtx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, 'rgba(66, 133, 244, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 181, 246, 1)');
        
        fluidCtx.strokeStyle = gradient;
        fluidCtx.lineCap = 'round';
        fluidCtx.stroke();
      }
      
      // Draw water drop and splash if exists
      if (dropRef.current) {
        const { x, y, size: dropSize, rippleSize, splashing } = dropRef.current;
        
        if (!splashing) {
          // Draw falling drop
          fluidCtx.beginPath();
          fluidCtx.arc(x, y, dropSize, 0, Math.PI * 2);
          fluidCtx.fillStyle = 'rgba(66, 133, 244, 0.9)';
          fluidCtx.fill();
        } else {
          // Draw splash effect
          fluidCtx.beginPath();
          fluidCtx.arc(x, y, rippleSize, 0, Math.PI * 2);
          fluidCtx.strokeStyle = `rgba(66, 133, 244, ${0.9 - rippleSize/60})`;
          fluidCtx.lineWidth = 2 + rippleSize/20;
          fluidCtx.stroke();
          
          // Draw splash particles
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = rippleSize * 0.8;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            fluidCtx.beginPath();
            fluidCtx.arc(px, py, 3, 0, Math.PI * 2);
            fluidCtx.fillStyle = `rgba(66, 133, 244, ${0.9 - rippleSize/60})`;
            fluidCtx.fill();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(drawAurora);
    };
    
    animationFrameId = requestAnimationFrame(drawAurora);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, tintOpacity, displayTime]);

  // Waterdrop effect at minute marks
  useEffect(() => {
    if (isRunning && elapsedTime > 0 && elapsedTime % 60 === 0) {
      const center = 130;
      
      // Create water drop at top of circle
      dropRef.current = {
        x: center,
        y: 20,
        size: 8,
        rippleSize: 0,
        splashing: false
      };
      
      // Animate drop falling
      const dropAnimation = () => {
        if (!dropRef.current) return;
        
        // Move drop down
        dropRef.current.y += 4;
        
        // Increase size as it falls
        if (dropRef.current.size < 12) {
          dropRef.current.size += 0.1;
        }
        
        // When drop reaches bottom, create splash
        if (dropRef.current.y > 250) {
          dropRef.current.splashing = true;
          dropRef.current.rippleSize += 4;
          
          // Remove after splash expands
          if (dropRef.current.rippleSize > 60) {
            dropRef.current = null;
            return;
          }
        }
        
        requestAnimationFrame(dropAnimation);
      };
      
      dropAnimation();
    }
  }, [elapsedTime, isRunning]);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full shadow-lg border border-gray-100 bg-white">
      {/* Aurora Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
      />
      
      {/* Fluid Canvas for blue line and water effects */}
      <canvas 
        ref={fluidCanvasRef} 
        className="absolute inset-0 z-10"
      />
      
      {/* Timer Display - Only show when running or has time */}
      {(isRunning || elapsedTime > 0) && (
        <div className="relative flex flex-col items-center justify-center z-20 w-full h-full">
          <div className="text-center w-full z-30">
            <div 
              className="text-5xl font-medium text-gray-800 tracking-tighter font-mono px-4"
              style={{ 
                fontWeight: 400,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 10 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(${Math.random() > 0.5 ? '-' : ''}10px, -10px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};

export default TimerDisplay;