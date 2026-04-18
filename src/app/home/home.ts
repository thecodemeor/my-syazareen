import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
    computed
} from '@angular/core';

import { MozIcon } from 'mozek-angular';

import { PageTransitionService } from 'src/assets/services/page-transition.service';
import { ResponsiveService } from 'src/assets/services/responsive.service';
import { MusicService } from 'src/assets/services/music.service';

import { CatAnimation } from 'src/assets/shared/cat/cat';
import { DeskComponent } from 'src/assets/shared/desk/desk';
import { AchievementComponent } from 'src/assets/shared/achievement/achievement';
import { FrameComponent } from 'src/assets/shared/frame/frame';

type Spark = {
    x: number;
    y: number;
    angle: number;
    startTime: number;
};

@Component({
    selector: 'app-home',
    imports: [MozIcon, CatAnimation, DeskComponent, AchievementComponent, FrameComponent],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
    private pageTransitionService = inject(PageTransitionService);
    public musicService = inject(MusicService);
    public responsive = inject(ResponsiveService);

    screen = computed(() => this.responsive.breakpoint());

    @ViewChild('hoverSfx')
    private hoverSfxRef!: ElementRef<HTMLAudioElement>;

    @ViewChild('meowSfx')
    private meowSfxRef!: ElementRef<HTMLAudioElement>;

    @ViewChild('sparkCanvas')
    private sparkCanvasRef!: ElementRef<HTMLCanvasElement>;

    @ViewChild('sparkWrapper')
    private sparkWrapperRef!: ElementRef<HTMLDivElement>;

    public isDeskHovered = false;
    public isAchievementHovered = false;
    public isFrameHovered = false;
    public isCatTouched = false;
    public isMusicPlaying = false;
    public catDialogTopic = '';

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

    get lookAtMe(): boolean {
        return (
            this.isDeskHovered ||
            this.isAchievementHovered ||
            this.isFrameHovered ||
            this.isCatTouched
        );
    }

    navbar = [
        { icon: 'user', router: '/about' },
        { icon: 'case_2', router: '/work' },
        { icon: 'mention_circle', router: '/email' },
    ];

    ngOnInit(): void {
        this.musicService.isPlaying$.subscribe((value) => {
            this.isMusicPlaying = value;
        });

        window.addEventListener('click', this.clickHandler);
    }

    ngAfterViewInit(): void {
        this.setupSparkCanvas();

        const hoverSfx = this.hoverSfxRef?.nativeElement;
        const meowSfx = this.meowSfxRef?.nativeElement;

        if (hoverSfx) {
            hoverSfx.volume = 0.45;
            hoverSfx.load();
        }

        if (meowSfx) {
            meowSfx.volume = 1;
            meowSfx.load();
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

    onDeskHover(hovered: boolean): void {
        if (hovered && !this.isDeskHovered) {
            this.playHoverSound();
        }

        this.isDeskHovered = hovered;
        this.updateCatDialogTopic();
    }

    onAchievementHover(target: 'trophy' | 'radio' | null): void {
        const wasHovered = this.isAchievementHovered;
        this.isAchievementHovered = target !== null;

        if (this.isAchievementHovered && !wasHovered) {
            this.playHoverSound();
        }

        if (target === 'radio') {
            this.catDialogTopic = 'radio';
            return;
        }

        if (target === 'trophy') {
            this.catDialogTopic = 'achievement';
            return;
        }

        this.updateCatDialogTopic();
    }

    onFrameHover(hovered: boolean): void {
        if (hovered && !this.isFrameHovered) {
            this.playHoverSound();
        }

        this.isFrameHovered = hovered;
        this.updateCatDialogTopic();
    }

    routerPage(route: string): void {
        this.playHoverSound();

        if (route === '/email') {
            window.location.href = 'mailto:syazareennafisah.areen@gmail.com';
        } else {
            this.pageTransitionService.navigate(route);
        }
    }

    onFrameClick(): void {
        this.pageTransitionService.navigate('/about');
    }

    onImacClick(): void {
        window.location.href = 'mailto:syazareennafisah.areen@gmail.com';
    }

    onTrophyClick(): void {
        this.pageTransitionService.navigate('/work');
    }

    onCatTouch(touched: boolean): void {
        if (touched && !this.isCatTouched) {
            this.playMeowSound();
        }

        this.isCatTouched = touched;
        this.updateCatDialogTopic();
    }

    onRadioToggle(): void {
        this.musicService.toggle();
    }

    private playHoverSound(): void {
        const hoverSfx = this.hoverSfxRef?.nativeElement;
        if (!hoverSfx) return;

        hoverSfx.pause();
        hoverSfx.currentTime = 0;
        hoverSfx.play().catch(() => {});
    }

    private playMeowSound(): void {
        const meowSfx = this.meowSfxRef?.nativeElement;
        if (!meowSfx) return;

        meowSfx.pause();
        meowSfx.currentTime = 0;
        meowSfx.playbackRate = 1;
        meowSfx.play().catch(() => {});
    }

    private updateCatDialogTopic(): void {
        if (this.isCatTouched) {
            this.catDialogTopic = 'me';
            return;
        }

        if (this.isDeskHovered) {
            this.catDialogTopic = 'desk';
            return;
        }

        if (this.isAchievementHovered) {
            this.catDialogTopic = 'achievement';
            return;
        }

        if (this.isFrameHovered) {
            this.catDialogTopic = 'frame';
            return;
        }

        this.catDialogTopic = '';
    }

    private setupSparkCanvas(): void {
        const canvas = this.sparkCanvasRef?.nativeElement;
        const wrapper = this.sparkWrapperRef?.nativeElement;

        if (!canvas || !wrapper) return;

        const resizeCanvas = (): void => {
            const rect = wrapper.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

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
            const rect = this.sparkWrapperRef.nativeElement.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

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
        const wrapper = this.sparkWrapperRef?.nativeElement;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const now = performance.now();

        const newSparks: Spark[] = Array.from({ length: this.sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / this.sparkCount,
            startTime: now
        }));

        this.sparks.push(...newSparks);
    }

    private easeOut(t: number): number {
        return t * (2 - t);
    }

    catDialogText(topic: string): string {
        switch (topic) {
            case 'me':
                return 'What?';

            case 'desk':
                return 'Sending email? She’s looking for a job.';

            case 'achievement':
                return 'She’s pretty good.';

            case 'radio':
                return this.isMusicPlaying ? 'Turn it off?' : 'Want some music?';

            case 'frame':
                return 'Hmm… Tell her she hasn’t fed me yet.';

            default:
                return '';
        }
    }
}