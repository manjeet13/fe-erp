import { Component, OnInit } from '@angular/core';
import { FeBaseComponent } from '../feBase.component';

@Component({
  selector: 'feSelect',
  styleUrls: ['feSelect.component.css'],
  templateUrl: 'feSelect.component.html'
})
export class FeSelectComponent extends FeBaseComponent implements OnInit {

  protected _options: any;

  ngOnInit() {
    super.ngOnInit();
    this.options = this.config.options;
  }

  get options() {
    return this._options;
  }

  set options(option) {
    this._options = option;
  }

}
