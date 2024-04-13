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

  houseToAdd: House = new House('',null,'',0);
  houseToEdit: House = new House('',null,'',0);

  constructor(
    private entranceService: EntranceService,

  ){}

  ngOnInit(){

    this.entranceService.getAllHouses().subscribe((res:any[])=>{
      if(res){
        this.houses=res;
      }
    })

  }

  ngAfterViewInit(){
    initFlowbite();
  }

  newHouse(){
    document.getElementById('new-house-button')?.click();
  }

  editHouse(house:House){
    this.houseToEdit=house;
    document.getElementById('edit-house-button')?.click();
  }

  saveNewHouse(){
    this.entranceService.addHouse(this.houseToAdd).subscribe(resAddHouse=>{
      if(resAddHouse){
        console.log('muy bien');
        this.entranceService.getAllHouses().subscribe((res:any[])=>{
          if(res){
            this.houses=res;
          }
        })
      }
    })
  }

  saveEditHouse(){
    this.entranceService.updateHouse(this.houseToEdit).subscribe(resUpdateHouse=>{
      if(resUpdateHouse){
        console.log('actualizado');
      }
    })
  }

}
