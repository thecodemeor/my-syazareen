import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    ViewChild,
    inject
} from '@angular/core';

import { PageTransitionService } from 'src/assets/services/page-transition.service';

import { MozIcon } from 'mozek-angular';

type Spark = {
    x: number;
    y: number;
    angle: number;
    startTime: number;
};

@Component({
    selector: 'app-about',
    imports: [MozIcon],
    templateUrl: './about.html',
    styleUrl: './about.scss',
})
export class About implements AfterViewInit, OnDestroy {
    private pageTransitionService = inject(PageTransitionService);

    @ViewChild('sparkCanvas')
    private sparkCanvasRef!: ElementRef<HTMLCanvasElement>;

    @ViewChild('sparkWrapper')
    private sparkWrapperRef!: ElementRef<HTMLDivElement>;

    @ViewChild('hoverSfx')
    private hoverSfxRef!: ElementRef<HTMLAudioElement>;

    private sparks: Spark[] = [];
    private animationFrameId?: number;
    private resizeObserver?: ResizeObserver;

    private readonly sparkColor = '#ff00c3';
    private readonly sparkSize = 10;
    private readonly sparkRadius = 18;
    private readonly sparkCount = 8;
    private readonly sparkDuration = 400;
    private readonly sparkLineWidth = 2;

    private clickHandler = (e: MouseEvent): void => {
        this.handleSparkClick(e);
    };

    ngAfterViewInit(): void {
        this.setupSparkCanvas();
        window.addEventListener('click', this.clickHandler);

        const hoverSfx = this.hoverSfxRef?.nativeElement;
        if (hoverSfx) {
            hoverSfx.volume = 0.45;
            hoverSfx.load();
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('click', this.clickHandler);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    onResumeHover(): void {
        this.playHoverSound();
    }

    onResumeClick(): void {
        this.playHoverSound();

        const url = 'assets/documents/syazareen_resume_2026.pdf';
        window.open(url, '_blank');
    }

    private playHoverSound(): void {
        const hoverSfx = this.hoverSfxRef?.nativeElement;
        if (!hoverSfx) return;

        hoverSfx.pause();
        hoverSfx.currentTime = 0;
        hoverSfx.play().catch(() => {});
    }

    private setupSparkCanvas(): void {
        const canvas = this.sparkCanvasRef?.nativeElement;
        const wrapper = this.sparkWrapperRef?.nativeElement;

        if (!canvas || !wrapper) return;

        const resizeCanvas = (): void => {
            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.round(window.innerWidth * dpr);
            canvas.height = Math.round(window.innerHeight * dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        this.resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });

        this.resizeObserver.observe(wrapper);
        resizeCanvas();
        this.startSparkAnimation();
    }

    private startSparkAnimation(): void {
        const canvas = this.sparkCanvasRef?.nativeElement;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) return;

        const draw = (timestamp: number): void => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.sparks = this.sparks.filter((spark) => {
                const elapsed = timestamp - spark.startTime;

                if (elapsed >= this.sparkDuration) {
                    return false;
                }

                const progress = elapsed / this.sparkDuration;
                const eased = this.easeOut(progress);

                const distance = eased * this.sparkRadius;
                const lineLength = this.sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = this.sparkColor;
                ctx.lineWidth = this.sparkLineWidth;
                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            this.animationFrameId = requestAnimationFrame(draw);
        };

        this.animationFrameId = requestAnimationFrame(draw);
    }

    private handleSparkClick(e: MouseEvent): void {
        const now = performance.now();

        const newSparks: Spark[] = Array.from({ length: this.sparkCount }, (_, i) => ({
            x: e.clientX,
            y: e.clientY,
            angle: (2 * Math.PI * i) / this.sparkCount,
            startTime: now
        }));

        this.sparks.push(...newSparks);
    }

    private easeOut(t: number): number {
        return t * (2 - t);
    }

    onBackHover(): void {
        this.playHoverSound();
    }

    backToHome(): void {
        this.playHoverSound();
        this.pageTransitionService.navigate('/home');
    }
}