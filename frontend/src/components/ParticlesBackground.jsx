import { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        const particleCount = 60;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speed = Math.random() * 0.5 + 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.size = Math.random() * 12 + 8;
                this.char = Math.random() > 0.5 ? '0' : '1';
            }

            update() {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.font = `${this.size}px monospace`;
                ctx.fillStyle = `rgba(0, 255, 65, ${this.opacity})`; // Matrix Green
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Add scanline effect
        let scanlineY = 0;

        const animate = () => {
            // Semi-transparent clear for trails
            ctx.fillStyle = 'rgba(1, 4, 9, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.03)'; // Teal grid
            ctx.lineWidth = 1;
            const step = 40;
            for (let x = 0; x < canvas.width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Update and draw matrix rain
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw horizontal scanline
            ctx.fillStyle = 'rgba(0, 255, 65, 0.05)';
            ctx.fillRect(0, scanlineY, canvas.width, 2);
            scanlineY = (scanlineY + 1) % canvas.height;

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 bg-[#010409]"
        />
    );
};

export default ParticlesBackground;
