import { AfterViewInit, Component, OnInit } from '@angular/core';
import { House } from '../house';
import { EntranceService } from '../entrance.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css']
})
export class HousesComponent implements OnInit, AfterViewInit{

  houses: House[] = [];

  houseToAdd: House = new House('','','',0);

  constructor(
    private entranceService: EntranceService,

  ){}

  ngOnInit(){

    this.entranceService.getAllHouses().subscribe((res:any[])=>{
      this.houses=res;
    })

  }

  ngAfterViewInit(){
    initFlowbite();
  }

  newHouse(){
    document.getElementById('new-house-button')?.click();
  }

  saveHouse(){

    this.entranceService.addHouse(this.houseToAdd).subscribe(resAddHouse=>{
      if(resAddHouse){
        console.log('muy bien');
      }
    })

  }

}
