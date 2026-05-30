import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostFlightsearchComponent } from './post-flightsearch.component';

describe('PostFlightsearchComponent', () => {
  let component: PostFlightsearchComponent;
  let fixture: ComponentFixture<PostFlightsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFlightsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostFlightsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
