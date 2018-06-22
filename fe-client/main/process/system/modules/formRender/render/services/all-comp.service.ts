import { Injectable } from '@angular/core';
import { TXTComponent } from '@L3Process/system/modules/formRender/render/components/TXT/txt.component';
import { BTNComponent } from '@L3Process/system/modules/formRender/render/components/BTN/btn.component';
import { TXAComponent } from '@L3Process/system/modules/formRender/render/components/TXA/txa.component';
import { SELComponent } from '@L3Process/system/modules/formRender/render/components/SEL/sel.component';
import { DATComponent } from '@L3Process/system/modules/formRender/render/components/DAT/dat.component';
import { NUMComponent } from '@L3Process/system/modules/formRender/render/components/NUM/num.component';
import { FILComponent } from '@L3Process/system/modules/formRender/render/components/FIL/fil.component';
import { TIMComponent } from '@L3Process/system/modules/formRender/render/components/TIM/tim.component';

@Injectable({
  providedIn: 'root'
})
export class FeAllCompService {

  constructor() { }

  public elements = [
    { name: 'input', component: TXTComponent },
    { name: 'textarea', component: TXAComponent },
    { name: 'button', component: BTNComponent },
    { name: 'select', component: SELComponent },
    { name: 'date', component: DATComponent },
    { name: 'number', component: NUMComponent },
    { name: 'file', component: FILComponent },
    { name: 'time', component: TIMComponent }
  ]

}
