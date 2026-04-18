import {
    AfterViewInit,
    Component,
    ElementRef,
    ViewChild,
    signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageTransitionService } from 'src/assets/services/page-transition.service';
import { MusicService } from 'src/assets/services/music.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements AfterViewInit {
    protected readonly title = signal('syazareen');

    @ViewChild('overlayPath', { static: true })
    private overlayPathRef!: ElementRef<SVGPathElement>;

    @ViewChild('bgMusic')
    private bgMusicRef!: ElementRef<HTMLAudioElement>;

    constructor(
        private pageTransitionService: PageTransitionService,
        private musicService: MusicService
    ) {}

    ngAfterViewInit(): void {
        this.pageTransitionService.register(this.overlayPathRef.nativeElement);

        const audio = this.bgMusicRef?.nativeElement;
        if (!audio) return;

        audio.volume = 0.3;

        this.musicService.isPlaying$.subscribe((isPlaying) => {
            if (isPlaying) {
                audio.play().catch(() => {
                    this.musicService.setPlaying(false);
                });
            } else {
                audio.pause();
            }
        });
    }
}