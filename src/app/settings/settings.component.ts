import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  isAdmin = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      this.user = u || null;
      this.isAdmin = !!(this.user?.role_system === 'ADMINISTRADOR' || this.user?.role_system === 'ADMIN');
    });
    const stored = this.auth.getUser();
    if (stored) {
      this.user = stored;
      this.isAdmin = !!(this.user?.role_system === 'ADMINISTRADOR' || this.user?.role_system === 'ADMIN');
    }
  }
}
