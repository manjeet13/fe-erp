import { Component, OnInit, DoCheck } from '@angular/core';
import { FeBaseField } from '../baseField/baseField.component';
import * as _ from 'lodash';
@Component({
  selector: 'acs-input',
  templateUrl: './acs.component.html',
  styleUrls: ['../baseField/baseField.component.css', './acs.component.css']
})
export class FeAcsComponent extends FeBaseField  implements OnInit, DoCheck {

  showEdit = true;
  properties = {
  label: 'test',
  prefix: '',
  suffix: '',
  description: '',
  placeholder: 'test',
  tooltip: ''};

  applicableProperties={
    inputMask:true,
    placeholder:true,
    prefix:true,
    suffix:true,
    ...this.applicableProperties

}

  ngOnInit() {

    // this.properties = {
    //   label: 'test',
    //   prefix: '',
    //   suffix: '',
    //   description: '',
    //   placeholder: 'test',
    //   tooltip: ''
    // };
    console.log("initialized a new instance", this.properties);
    this.setRef(this.fieldControlService.getFieldRef().ref);
    this.uniqueKey = this.masterFormService.getCurrentKey();
    console.log(this.uniqueKey);
   // this.masterFormService.setCurrentKey(this.uniqueKey);
    this.masterFormService.setProperties(this.properties);
  }

  ngDoCheck() {
  //   const propsFromMasterForm = this.masterFormService.getProperties(this.uniqueKey);
  //  // console.log("master form props", propsFromMasterForm);
  //   if (propsFromMasterForm) {
  //     this.update(propsFromMasterForm);
  // }
}

  openModal() {
    this.masterFormService.setCurrentKey(this.uniqueKey);
    this.masterFormService.setProperties(this.properties);
    this.fieldControlService.getFieldRef().parent.openModal();
  }

  update(propsFromMasterForm) {
    this.properties = _.assignIn({}, propsFromMasterForm);
  }
}
