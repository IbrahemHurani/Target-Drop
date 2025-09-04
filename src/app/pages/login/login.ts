import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(FirebaseService);
  private router = inject(Router);

  mode: 'signin' | 'signup' = 'signin';
  loading = false;
  error = '';
  show = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { email, password } = this.form.value as { email: string; password: string };
    try {
      if (this.mode === 'signup') await this.auth.signUp(email, password);
      else                        await this.auth.signIn(email, password);
      this.router.navigateByUrl('/game');
    } catch (e: any) {
      this.error = e?.message ?? 'Authentication error';
    } finally {
      this.loading = false;
    }
  }
}
