import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';

@Injectable({
    providedIn: 'root'
})
export class PageTransitionService {
    private overlayPath: SVGPathElement | null = null;
    private isAnimating = false;

    private readonly paths = {
        step1: {
            unfilled: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
            inBetween: {
                curve1: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
                curve2: 'M 0 100 V 50 Q 50 100 100 50 V 100 z'
            },
            filled: 'M 0 100 V 0 Q 50 0 100 0 V 100 z'
        },
        step2: {
            filled: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
            inBetween: {
                curve1: 'M 0 0 V 50 Q 50 0 100 50 V 0 z',
                curve2: 'M 0 0 V 50 Q 50 100 100 50 V 0 z'
            },
            unfilled: 'M 0 0 V 0 Q 50 0 100 0 V 0 z'
        }
    };

    constructor(private router: Router) {}

    register(path: SVGPathElement): void {
        this.overlayPath = path;
        this.overlayPath.setAttribute('d', this.paths.step1.unfilled);
    }

    async navigate(url: string): Promise<void> {
        if (!this.overlayPath || this.isAnimating) return;

        this.isAnimating = true;

        await new Promise<void>((resolve) => {
            gsap.timeline({
                onComplete: () => resolve()
            })
                .set(this.overlayPath, {
                    attr: { d: this.paths.step1.unfilled }
                })
                .to(this.overlayPath, {
                    duration: 0.8,
                    ease: 'power4.in',
                    attr: { d: this.paths.step1.inBetween.curve1 }
                }, 0)
                .to(this.overlayPath, {
                    duration: 0.2,
                    ease: 'power1',
                    attr: { d: this.paths.step1.filled },
                    onComplete: async () => {
                        await this.router.navigate([url]);
                    }
                });
        });

        await new Promise<void>((resolve) => {
            gsap.timeline({
                onComplete: () => {
                    this.overlayPath?.setAttribute('d', this.paths.step1.unfilled);
                    this.isAnimating = false;
                    resolve();
                }
            })
                .set(this.overlayPath, {
                    attr: { d: this.paths.step2.filled }
                })
                .to(this.overlayPath, {
                    duration: 0.2,
                    ease: 'sine.in',
                    attr: { d: this.paths.step2.inBetween.curve1 }
                })
                .to(this.overlayPath, {
                    duration: 1,
                    ease: 'power4',
                    attr: { d: this.paths.step2.unfilled }
                });
        });
    }
}