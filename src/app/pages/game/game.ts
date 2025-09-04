import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, GameEntry } from '../../core/game.service';
import { FirebaseService } from '../../core/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('board')  boardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ball')   ballRef!: ElementRef<HTMLDivElement>;
  @ViewChild('target') targetRef!: ElementRef<HTMLDivElement>;


  width = 0; height = 0;
  ballR = 12; ballX = 0; ballY = 0;
  targetR = 28;
  vx = 2; vy = 0; gravity = 0.35; speedUp = 0.0008;
  dropping = false;
  rafId: number | null = null;
  scoreLast = 0;
  recent: GameEntry[] = [];
  totalScore = 0;
  private landed = false;


  private subs = new Subscription();



  constructor(
  private gameService: GameService,
  private fbService: FirebaseService
  ){} 

ngOnInit(): void {
  const s = this.fbService.user$.subscribe(u => {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    if (u && this.fbService.db) {
      const s1 = this.gameService.userTotalScore$().subscribe({
        next: v => this.totalScore = v,
        error: e => console.error('userTotalScore failed', e),
      });
      const s2 = this.gameService.myRecentGames$(10).subscribe({
        next: (list: GameEntry[]) => {
          this.recent = list ?? [];
          if (this.recent.length) this.scoreLast = this.recent[0].score;
        },
        error: e => console.error('recent games failed', e),
      });
      this.subs.add(s1); this.subs.add(s2);
    } else {
      this.totalScore = 0;
      this.recent = [];
      this.scoreLast = 0;
    }
  });
  this.subs.add(s);
}
  ngAfterViewInit(): void {
  if (this.fbService.uid) {
    this.gameService.myRecentGames$(10).subscribe(list => this.recent = list);
  }
    const board = this.boardRef.nativeElement;
    this.width  = board.clientWidth;
    this.height = board.clientHeight;
    this.reset();
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.subs.unsubscribe();

  }

  private loop = () => {
    if (!this.dropping) {
      this.ballX += this.vx;
      if (this.ballX <= this.ballR || this.ballX >= (this.width - this.ballR)) this.vx *= -1;
      this.vx += (this.vx > 0 ? this.speedUp : -this.speedUp);
    } else {
      this.vy += this.gravity;
      this.ballY += this.vy;
      const floorY = this.height - this.ballR;
      if (this.ballY >= floorY) {
        this.ballY = floorY;
        this.onLand();
        return;
      }
    }
    this.ballRef.nativeElement.style.transform =
      `translate(${this.ballX - this.ballR}px, ${this.ballY - this.ballR}px)`;
    this.rafId = requestAnimationFrame(this.loop);
  }

  drop() { if (!this.dropping) this.dropping = true; }

private onLand() {
  if (this.landed) return;
  this.landed = true;

  // compute score
  const centerX = this.width / 2;
  const dx = Math.abs(this.ballX - centerX);
  const maxDx = (this.width / 2) - this.targetR;
  const ratio = Math.min(dx / maxDx, 1);
  this.scoreLast = Math.max(0, Math.round(100 * (1 - ratio)));
  this.totalScore+=this.scoreLast;

  // 👇 fire-and-forget: do NOT await
  this.gameService.saveScoreAndAccumulate(this.scoreLast)
    .catch(err => console.error('save failed', err));

  // always resume the game
  setTimeout(() => { this.landed = false; this.reset(); }, 600);
}
  reset() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.dropping = false; this.vx = 2; this.vy = 0;
    this.ballX = this.ballR + 2; this.ballY = this.ballR + 2;
    this.ballRef.nativeElement.style.transform =
    `translate(${this.ballX - this.ballR}px, ${this.ballY - this.ballR}px)`;
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    this.rafId = window.requestAnimationFrame(() => this.loop());
}


  }
}
