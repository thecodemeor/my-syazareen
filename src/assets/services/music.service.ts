import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MusicService {
    private isPlayingSubject = new BehaviorSubject<boolean>(true);

    isPlaying$ = this.isPlayingSubject.asObservable();

    toggle(): void {
        this.isPlayingSubject.next(!this.isPlayingSubject.value);
    }

    setPlaying(value: boolean): void {
        this.isPlayingSubject.next(value);
    }

    get isPlaying(): boolean {
        return this.isPlayingSubject.value;
    }
}