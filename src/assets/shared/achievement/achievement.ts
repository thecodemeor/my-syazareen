import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'achievement-component',
    templateUrl: './achievement.html',
    styleUrl: './achievement.scss'
})
export class AchievementComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('achievementSvg', { static: true })
    private achievementSvgRef!: ElementRef<SVGSVGElement>;

    @Input()
    isMusicPlaying = false;

    @Output()
    hoveringChange = new EventEmitter<'trophy' | 'radio' | null>();

    @Output()
    radioClick = new EventEmitter<void>();

    @Output()
    trophyClick = new EventEmitter<void>();

    private radioElement: SVGGElement | null = null;

    private removeTrophyMouseEnter?: () => void;
    private removeTrophyMouseLeave?: () => void;
    private removeTrophyClick?: () => void;
    private removeRadioMouseEnter?: () => void;
    private removeRadioMouseLeave?: () => void;
    private removeRadioClick?: () => void;

    constructor(
        private renderer: Renderer2
    ) {}

    ngAfterViewInit(): void {
        const svg = this.achievementSvgRef.nativeElement;
        const trophy = svg.querySelector('.trophy') as SVGGElement | null;
        const shiny = svg.querySelector('.shiny') as SVGGElement | null;
        const radio = svg.querySelector('.radio') as SVGGElement | null;

        this.radioElement = radio;
        this.updateRadioState();

        if (trophy && shiny) {
            this.removeTrophyMouseEnter = this.renderer.listen(trophy, 'mouseenter', () => {
                this.hoveringChange.emit('trophy');

                this.renderer.removeClass(shiny, 'shiny-leave');
                this.renderer.removeClass(shiny, 'shiny-show');
                void shiny.getBoundingClientRect();
                this.renderer.addClass(shiny, 'shiny-show');
            });

            this.removeTrophyMouseLeave = this.renderer.listen(trophy, 'mouseleave', () => {
                this.hoveringChange.emit(null);

                this.renderer.removeClass(shiny, 'shiny-show');
                this.renderer.addClass(shiny, 'shiny-leave');
            });

            this.removeTrophyClick = this.renderer.listen(trophy, 'click', () => {
                this.trophyClick.emit();
            });
        }

        if (radio) {
            this.removeRadioMouseEnter = this.renderer.listen(radio, 'mouseenter', () => {
                this.hoveringChange.emit('radio');
            });

            this.removeRadioMouseLeave = this.renderer.listen(radio, 'mouseleave', () => {
                this.hoveringChange.emit(null);
            });

            this.removeRadioClick = this.renderer.listen(radio, 'click', () => {
                this.radioClick.emit();
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isMusicPlaying']) {
            this.updateRadioState();
        }
    }

    ngOnDestroy(): void {
        this.hoveringChange.emit(null);

        this.removeTrophyMouseEnter?.();
        this.removeTrophyMouseLeave?.();
        this.removeTrophyClick?.();
        this.removeRadioMouseEnter?.();
        this.removeRadioMouseLeave?.();
        this.removeRadioClick?.();
    }

    private updateRadioState(): void {
        if (!this.radioElement) return;

        if (this.isMusicPlaying) {
            this.renderer.addClass(this.radioElement, 'radio-playing');
        } else {
            this.renderer.removeClass(this.radioElement, 'radio-playing');
        }
    }
}