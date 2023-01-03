
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'crud-angular-php-mysql';

  constructor(private router: Router){}

  ngOnInit() {
    //this.router.navigate(['']);
/*   document.getElementById('barra').style.color='white';
  document.getElementById('barra').style.backgroundColor=String(rgb()); */
  }
}
