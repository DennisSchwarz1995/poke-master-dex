import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DexOverview } from './dex-overview';

describe('DexOverview', () => {
  let component: DexOverview;
  let fixture: ComponentFixture<DexOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DexOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DexOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
