import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { UsersService } from '../users.service';
import { EntranceService } from '../entrance.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent extends AppComponent implements OnInit {
  uploadingPhoto = false;

  constructor(
    router: Router,
    auth: AuthService,
    usersService: UsersService,
    entranceService: EntranceService,
    toastr: ToastrService,
    api: ApiService
  ) {
    super(router, auth, usersService, entranceService, toastr, api);
  }

  onProfilePhotoClick(): void {
    const el = document.getElementById('profile-photo-input') as HTMLInputElement;
    if (el) el.click();
  }

  onProfilePhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.toastr.warning('Seleccione una imagen (JPG, PNG o GIF).');
      input.value = '';
      return;
    }
    this.uploadingPhoto = true;
    this.api.uploadProfilePhoto(file).subscribe({
      next: (res: any) => {
        this.uploadingPhoto = false;
        input.value = '';
        const user = res?.data;
        if (user) {
          this.auth.updateCurrentUser(user);
          this.toastr.success('Foto de perfil actualizada.');
        }
      },
      error: () => {
        this.uploadingPhoto = false;
        input.value = '';
      }
    });
  }
}