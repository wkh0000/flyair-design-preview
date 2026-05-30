import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AdminLoginService } from '../../../Services/Admin-Services/Login/admin-login.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../Services/Auth/auth.service';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [MatCheckboxModule,MatSelectModule, CommonModule, MatFormFieldModule,MatInputModule,MatSnackBarModule,ReactiveFormsModule,FormsModule,MatButtonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  private _snackBar = inject(MatSnackBar);

  constructor(
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private route: Router,
    private snackBar: MatSnackBar,
    private adminLogin: AdminLoginService,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;

      this.adminLogin.login(email, password).subscribe({
        next: (response) => {
          this.authService.login();
          this.openSnackBar('Login successful');
          this.route.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          this.openErrorSnackBar('Invalid email or password');
        }
      });
    } else {
      this.openErrorSnackBar('Please fill in all fields correctly');
    }
  }


  logout() {
    this.authService.logout();
    this.route.navigate(['/admin-login']);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  openErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }
}
