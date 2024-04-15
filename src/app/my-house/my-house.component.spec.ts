import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHouseComponent } from './my-house.component';

describe('MyHouseComponent', () => {
  let component: MyHouseComponent;
  let fixture: ComponentFixture<MyHouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyHouseComponent]
    });
    fixture = TestBed.createComponent(MyHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
