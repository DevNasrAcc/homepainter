import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-price-estimate',
  templateUrl: './price-estimate.component.html',
  styleUrls: ['./price-estimate.component.less']
})
export class PriceEstimateComponent implements OnInit {
  public priceEstimateForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.priceEstimateForm = formBuilder.group({
      perGallon: ['', [Validators.required, Validators.pattern("[1-9][0-9]*(\\.[0-9]{2})?|\\$0?\\.[0-9][0-9]")]],
      hourlyWage: ['', [Validators.required, Validators.pattern("[1-9][0-9]*(\\.[0-9]{2})?|\\$0?\\.[0-9][0-9]")]],
    });
  }

  ngOnInit(): void {
  }

  public async onSubmit(): Promise<void> {
    if (!this.priceEstimateForm.valid) {
      return;
    }

  }

}
