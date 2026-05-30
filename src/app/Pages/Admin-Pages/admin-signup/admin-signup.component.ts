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
  selector: 'app-admin-signup',
  standalone: true,
  imports: [MatCheckboxModule,MatSelectModule, CommonModule, MatFormFieldModule,MatInputModule,MatSnackBarModule,ReactiveFormsModule,FormsModule,MatButtonModule],
  templateUrl: './admin-signup.component.html',
  styleUrl: './admin-signup.component.scss'
})
export class AdminSignupComponent {
  signupForm: FormGroup;
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
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]],
      role : "Admin",
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      
      const email = this.signupForm.value.email;
      const password = this.signupForm.value.password;
      const username = this.signupForm.value.username;
      const role = this.signupForm.value.role;

      if (password !== this.signupForm.value.confirmPassword) {
        this.openErrorSnackBar('Passwords do not match');
        return;
      }

      this.adminLogin.signup(username, email, password, role).subscribe({
        next: (response) => {
          this.openSnackBar('Signup successful');
          this.route.navigate(['/admin-login']);
        },
        error: (error: HttpErrorResponse) => {
          // ✅ Extract the actual error message from your C# backend!
          const errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.openErrorSnackBar(errorMessage);
        }
      });
    } else {
      this.openErrorSnackBar('Please fill in all fields correctly');
    }
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
