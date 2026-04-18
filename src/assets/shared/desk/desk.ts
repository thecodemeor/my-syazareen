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
    selector: 'desk-component',
    templateUrl: './desk.html',
    styleUrl: './desk.scss'
})
export class DeskComponent implements AfterViewInit, OnDestroy {
    @ViewChild('deskSvg', { static: true })
    private deskSvgRef!: ElementRef<SVGSVGElement>;

    @Output()
    hoveringChange = new EventEmitter<boolean>();

    @Output()
    imacClick = new EventEmitter<void>();

    public isImacHovered = false;

    private removeMouseEnter?: () => void;
    private removeMouseLeave?: () => void;

    constructor(
        private renderer: Renderer2
    ) {}

    ngAfterViewInit(): void {
        const svg = this.deskSvgRef.nativeElement;
        const imac = svg.querySelector('.imac') as SVGGElement | null;
        const monitor = svg.querySelector('.monitor') as SVGGElement | null;

        if (!imac || !monitor) return;

        this.removeMouseEnter = this.renderer.listen(imac, 'mouseenter', () => {
            this.isImacHovered = true;
            this.hoveringChange.emit(true);

            this.renderer.removeClass(monitor, 'monitor-leave');
            this.renderer.addClass(monitor, 'monitor-hover');
        });

        this.removeMouseLeave = this.renderer.listen(imac, 'mouseleave', () => {
            this.isImacHovered = false;
            this.hoveringChange.emit(false);

            this.renderer.removeClass(monitor, 'monitor-hover');
            this.renderer.removeClass(monitor, 'monitor-leave');
            void monitor.getBoundingClientRect();
            this.renderer.addClass(monitor, 'monitor-leave');
        });
    }

    onImacClick(): void {
        this.imacClick.emit();
    }

    ngOnDestroy(): void {
        this.isImacHovered = false;
        this.hoveringChange.emit(false);

        this.removeMouseEnter?.();
        this.removeMouseLeave?.();
    }
}