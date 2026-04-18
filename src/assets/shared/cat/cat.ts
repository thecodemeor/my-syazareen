import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'cat-animation',
    standalone: true,
    templateUrl: './cat.html',
    styleUrl: './cat.scss'
})
export class CatAnimation implements AfterViewInit, OnDestroy {
    @ViewChild('catSvg', { static: true }) catSvgRef!: ElementRef<SVGSVGElement>;

    @Input() freeze = false;
    @Output() catTouchChange = new EventEmitter<boolean>();

    private rightPupilWrap: SVGGElement | null = null;
    private leftPupilWrap: SVGGElement | null = null;

    private animationFrameId: number | null = null;

    private currentRight = { x: 0, y: 0 };
    private currentLeft = { x: 0, y: 0 };

    private targetRight = { x: 0, y: 0 };
    private targetLeft = { x: 0, y: 0 };

    private readonly easing = 0.14;
    private isHoveringCatShape = false;

    ngAfterViewInit(): void {
        const svg = this.catSvgRef.nativeElement;

        this.rightPupilWrap = svg.querySelector('.eye-right .pupil-wrap');
        this.leftPupilWrap = svg.querySelector('.eye-left .pupil-wrap');

        this.startAnimationLoop();
    }

    ngOnDestroy(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const svg = this.catSvgRef?.nativeElement;
        if (!svg) return;

        const isNowHoveringCat = this.isMouseOverCatShape(event);
        if (isNowHoveringCat !== this.isHoveringCatShape) {
            this.isHoveringCatShape = isNowHoveringCat;
            this.catTouchChange.emit(this.isHoveringCatShape);
        }

        if (this.freeze || this.isHoveringCatShape) {
            this.resetTargets();
            return;
        }

        const point = this.clientToSvgPoint(event.clientX, event.clientY);
        if (!point) return;

        this.targetRight = this.getBoundedOffset(
            point.x,
            point.y,
            56.1,
            56.8,
            4.8
        );

        this.targetLeft = this.getBoundedOffset(
            point.x,
            point.y,
            83.6,
            47.5,
            3.2
        );
    }

    @HostListener('document:mouseleave')
    onDocumentLeave(): void {
        if (this.isHoveringCatShape) {
            this.isHoveringCatShape = false;
            this.catTouchChange.emit(false);
        }
        this.resetTargets();
    }

    private isMouseOverCatShape(event: MouseEvent): boolean {
        const element = document.elementFromPoint(event.clientX, event.clientY);
        if (!element || !(element instanceof Element)) return false;
        return !!element.closest('.cat');
    }

    private resetTargets(): void {
        this.targetRight = { x: 0, y: 0 };
        this.targetLeft = { x: 0, y: 0 };
    }

    private startAnimationLoop(): void {
        const frame = () => {
            this.currentRight.x += (this.targetRight.x - this.currentRight.x) * this.easing;
            this.currentRight.y += (this.targetRight.y - this.currentRight.y) * this.easing;

            this.currentLeft.x += (this.targetLeft.x - this.currentLeft.x) * this.easing;
            this.currentLeft.y += (this.targetLeft.y - this.currentLeft.y) * this.easing;

            this.applyTransform(this.rightPupilWrap, this.currentRight.x, this.currentRight.y);
            this.applyTransform(this.leftPupilWrap, this.currentLeft.x, this.currentLeft.y);

            this.animationFrameId = requestAnimationFrame(frame);
        };
        frame();
    }

    private applyTransform(element: SVGGElement | null, x: number, y: number): void {
        if (!element) return;
        element.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }

    private clientToSvgPoint(clientX: number, clientY: number): DOMPoint | null {
        const svg = this.catSvgRef.nativeElement;
        const ctm = svg.getScreenCTM();

        if (!ctm) return null;
        const point = new DOMPoint(clientX, clientY);
        return point.matrixTransform(ctm.inverse());
    }

    private getBoundedOffset(
        targetX: number,
        targetY: number,
        eyeCenterX: number,
        eyeCenterY: number,
        maxDistance: number
    ): { x: number; y: number } {
        const dx = targetX - eyeCenterX;
        const dy = targetY - eyeCenterY;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) {
            return { x: 0, y: 0 };
        }

        const limitedDistance = Math.min(distance, maxDistance);
        const ratio = limitedDistance / distance;

        return {
            x: dx * ratio,
            y: dy * ratio
        };
    }
}