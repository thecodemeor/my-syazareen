import {
    AfterViewInit,
    Component,
    ElementRef,
    QueryList,
    ViewChildren
} from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';

type LetterKey = 'A' | 'C' | 'D' | 'E' | 'G' | 'H' | 'I' | 'N' | 'P' | 'R' | 'S';

@Component({
    selector: 'animography-graphicdesigner',
    standalone: true,
    template: `
        <div class="title-wrap">
            <div class="line">
                @for (letter of line1; track $index; let i = $index) {
                    <div
                        class="letter-box"
                        #letterContainer
                        (mouseenter)="playLetter(i)"
                    ></div>
                }
            </div>

            <div class="line">
                @for (letter of line2; track $index; let i = $index) {
                    <div
                        class="letter-box"
                        #letterContainer
                        (mouseenter)="playLetter(i + line1.length)"
                    ></div>
                }
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
            min-height: 100dvh;
        }

        .title-wrap {
            display: flex;
            min-height: 100dvh;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            overflow: hidden;
        }

        .line {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 0.5rem;
            flex-wrap: nowrap;
        }

        .letter-box {
            position: relative;
            flex: 0 0 auto;
            width: 110px; height: 132px;
            cursor: pointer;
        }

        .letter-box svg,
        .letter-box canvas {
            display: block;
            width: 100%; height: 100%;
            pointer-events: none;
        }

        @media (max-width: 900px) {
            .letter-box { width: 80px; height: 96px;}
            .line { gap: 0.3rem;}
        }
    `]
})
export class Animography1 implements AfterViewInit {
    @ViewChildren('letterContainer')
    letterContainers!: QueryList<ElementRef<HTMLDivElement>>;

    line1: LetterKey[] = ['G', 'R', 'A', 'P', 'H', 'I', 'C'];
    line2: LetterKey[] = ['D', 'E', 'S', 'I', 'G', 'N', 'E', 'R'];

    private animations: AnimationItem[] = [];
    private loaded: boolean[] = [];

    private readonly letterPathMap: Record<LetterKey, string> = {
        A: 'assets/shared/animated/json/A.json',
        C: 'assets/shared/animated/json/C.json',
        D: 'assets/shared/animated/json/D.json',
        E: 'assets/shared/animated/json/E.json',
        G: 'assets/shared/animated/json/G.json',
        H: 'assets/shared/animated/json/H.json',
        I: 'assets/shared/animated/json/I.json',
        N: 'assets/shared/animated/json/N.json',
        P: 'assets/shared/animated/json/P.json',
        R: 'assets/shared/animated/json/R.json',
        S: 'assets/shared/animated/json/S.json'
    };

    ngAfterViewInit(): void {
        const allLetters: LetterKey[] = [...this.line1, ...this.line2];
        const containers = this.letterContainers.toArray();

        allLetters.forEach((letter, index) => {
            this.loaded[index] = false;

            const animation = lottie.loadAnimation({
                container: containers[index].nativeElement,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: this.letterPathMap[letter],
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet',
                    progressiveLoad: false
                }
            });

            animation.addEventListener('DOMLoaded', () => {
                this.loaded[index] = true;
            });

            animation.setSpeed(0.5);

            this.animations[index] = animation;
        });

        const pageDelay = 200;
        const staggerDelay = 180;

        setTimeout(() => {
            this.playAllLetters(staggerDelay);
        }, pageDelay);
    }

    playAllLetters(staggerDelay: number): void {
        this.animations.forEach((animation, index) => {
            setTimeout(() => {
                this.restartAnimation(index);
            }, index * staggerDelay);
        });
    }

    playLetter(index: number): void {
        this.restartAnimation(index);
    }

    private restartAnimation(index: number): void {
        const animation = this.animations[index];
        if (!animation || !this.loaded[index]) return;

        const totalFrames = Math.max(1, Math.floor(animation.getDuration(true)));

        animation.stop();
        animation.playSegments([0, totalFrames], true);
    }
}