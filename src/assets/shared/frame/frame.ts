import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    Output,
    Renderer2,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'frame-component',
    templateUrl: './frame.html',
    styleUrl: './frame.scss'
})
export class FrameComponent implements AfterViewInit, OnDestroy {
    @ViewChild('frameSvg', { static: true })
    private frameSvgRef!: ElementRef<SVGSVGElement>;

    @Output()
    hoveringChange = new EventEmitter<boolean>();

    @Output()
    frameClick = new EventEmitter<void>();

    private removeMouseEnter?: () => void;
    private removeMouseLeave?: () => void;
    private removeClick?: () => void;

    constructor(private renderer: Renderer2) {}

    ngAfterViewInit(): void {
        const svg = this.frameSvgRef.nativeElement;
        const frame = svg.querySelector('.frame') as SVGGElement | null;
        const shine = svg.querySelector('.frame-glass-shine-rect') as SVGRectElement | null;

        if (!frame || !shine) return;

        this.removeMouseEnter = this.renderer.listen(frame, 'mouseenter', () => {
            this.hoveringChange.emit(true);

            this.renderer.removeClass(frame, 'frame-swing');
            void frame.getBoundingClientRect();
            this.renderer.addClass(frame, 'frame-swing');

            this.renderer.removeClass(shine, 'frame-glass-shine-active');
            void shine.getBoundingClientRect();
            this.renderer.addClass(shine, 'frame-glass-shine-active');
        });

        this.removeMouseLeave = this.renderer.listen(frame, 'mouseleave', () => {
            this.hoveringChange.emit(false);
        });

        this.removeClick = this.renderer.listen(frame, 'click', () => {
            this.frameClick.emit();
        });
    }

    ngOnDestroy(): void {
        this.hoveringChange.emit(false);
        this.removeMouseEnter?.();
        this.removeMouseLeave?.();
        this.removeClick?.();
    }
}