import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { CookiesService } from '../cookies.service';
import { User } from '../user';


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent extends AppComponent implements OnInit {

}