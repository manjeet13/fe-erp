import { OnInit, Injectable, Renderer2, ElementRef, OnDestroy, AfterViewInit, SimpleChange } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
//import { Observable } from 'rxjs';
import * as _ from 'lodash';
// import { CustomValidators } from 'ng4-validators';
// import { NgbDatepickerConfig, NgbDateStruct, NgbDateParserFormatter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
// import { FeFormComponent } from '@L1Process/system/modules/formGenerator/components/feForm/feForm.component';
// import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';
// import { log } from 'util';
// import { resource } from 'selenium-webdriver/http';
// import { BoundEventAst } from '@angular/compiler';
// import { config } from 'rxjs';
// import { groupBy } from 'rxjs/operators';
// import { longStackSupport } from 'q';
// import { sanitizeStyle } from '@angular/core/src/sanitization/sanitization';
import { FeValidatorsService } from '@L1Process/system/modules/formGenerator/services/validators.service';
import { FeDependentService } from '@L1Process/system/modules/formGenerator/services/dependent.service';
import { Field } from '@L1Process/system/modules/formGenerator/models/field.interface';
import { FieldConfig } from '@L1Process/system/modules/formGenerator/models/field-config.interface';
import * as jsonLogic from 'json-logic-js'
//import * as ts from "typescript";

@Injectable()
export class FeBaseComponent implements Field, OnInit, OnDestroy, AfterViewInit {

    public config: FieldConfig;
    public group: FormGroup;
    public form: any;
    public disabled: boolean;
    public formComponent: any;
    public length = 0;
    public conditionClass: string;
    public error: string;
    public validators = [];
    public name: string;
    public errors = [];
    public style: any;
    public _show: any = true;
    public defaultClasses: any;
    public defaultFieldWidth: any;

    public $statusChange: any;
    public $valueChange: any;
    public $simpleConditionChange: any;
    public $groupValueChange: any;

    constructor(public elemRef: ElementRef, public validator: FeValidatorsService, public dependent: FeDependentService, public render: Renderer2) {
        this.defaultFieldWidth = '50%';
    }

    ngOnInit(): void {
        this.applyDefaultValidations();
        this.initFieldStyle();
        this.applyWatch();
    }

    ngAfterViewInit() {
        this.bindEvents();
    }


    // ngAfterViewChecked() {
    //     if ( this.defaultValue ) {
    //         this.setDefaultValue();
    //     }
    // }

    ngOnDestroy() {
        this.$statusChange.unsubscribe();
        this.$valueChange.unsubscribe();
        this.$simpleConditionChange.unsubscribe();
        this.$groupValueChange.unsubscribe();
    }

    static evalFnArgs(argsStr) {
        try {
            let evaluatedArgsArr = [];
            argsStr = argsStr.trim().split(',');
            argsStr.forEach((value) => {
                value = value.trim();
                let evalStr = eval(value);
                evaluatedArgsArr.push(evalStr);
            });
            return evaluatedArgsArr;
        } catch (error) {
            console.log(error);
        }
    }

    fieldEventHandler(handlerData, event) {
        try {
            let eventName = handlerData.name;
            let handlerOwnerType = handlerData.handlerOwner;
            let handlerFnName = handlerData.handlerName;
            let args = handlerData.args;
            let ownerObject: any = {};
            if (!handlerOwnerType) {
                handlerOwnerType = 'form';
            }
            ownerObject = this[handlerOwnerType]; //this.resource or this.form
            if (!ownerObject) {
                console.log(`Event handler function owner ${handlerOwnerType} object does not exist in current field component object. So can not call bound function.`);
                return;
            }
            if (!ownerObject) {
                console.log(`Event handler type ${handlerOwnerType} does not exist in field component class for event ${eventName} for ${this.flexiLabel}`);
                return;
            }
            if (ownerObject[handlerFnName] && typeof ownerObject[handlerFnName] == 'function') {
                let argsArr = FeBaseComponent.evalFnArgs(args);
                argsArr.push(this);
                argsArr.push(event);
                ownerObject[handlerFnName].apply(ownerObject, argsArr)
            } else {
                console.log(`Event handler ${handlerFnName} does not exist in ${handlerOwnerType} class for event ${eventName} for ${this.flexiLabel}`);
            }

        } catch (error) {
            console.log(error);
        }
    }


    bindEvents() {
        try {
            let eventsObjArr: object = this.config.events;
            if (eventsObjArr) {
                let field = this.fieldRef;
                for (let eventName in eventsObjArr) {
                    this.render.listen(field, eventName, this.fieldEventHandler.bind(this, eventsObjArr[eventName]));
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    applyWatch(): void {
        this.$statusChange = this.control.statusChanges.subscribe(this.onStatusChange.bind(this));

        if (this.config.isParent) {
            this.$valueChange = this.control.valueChanges.subscribe(this.onValueChange.bind(this));
        }
        if (this.config.condition) {
            let type = this.config.condition['type'];
            let conditionHandlerName = `${type}ConditionHandler`;
            if (this[conditionHandlerName] && typeof this[conditionHandlerName] == 'function') {
                this[conditionHandlerName](this.config.condition[type]);
            }
            else {
                console.log(`Given condition handler is not a function for field ${this.flexiLabel}`);
            }
        }
    }

    detectGroupValueChange(conditionFnction: Function) {
        this.$groupValueChange = this.group.valueChanges.subscribe(conditionFnction.bind(this));
    }

    simpleConditionHandler(condition: { [key: string]: any }) {
        if (condition.show == true) {
            this.render.addClass(this.elemRef.nativeElement, 'hidden');
            this.$simpleConditionChange = this.group.get(condition.when).valueChanges.subscribe((data) => {
                data == condition.eq ? this.render.removeClass(this.elemRef.nativeElement, 'hidden') : this.render.addClass(this.elemRef.nativeElement, 'hidden');
            })
        }
        else {
            this.render.removeClass(this.elemRef.nativeElement, 'hidden');
            this.$simpleConditionChange = this.group.get(condition.when).valueChanges.subscribe((data) => {
                data == condition.eq ? this.render.addClass(this.elemRef.nativeElement, 'hidden') : this.render.removeClass(this.elemRef.nativeElement, 'hidden');
            })
        }
    }

    advancedConditionHandler(condition: string) {
        let theInstructions = new Function('controls', 'formObject', 'fieldObject', condition);
        function handler() {
            let show = theInstructions(this.group.controls, this.form, this);
            if (show == true) {
                this.render.removeClass(this.elemRef.nativeElement, 'hidden');
            }
            else {
                this.render.addClass(this.elemRef.nativeElement, 'hidden');
            }
        }
        this.detectGroupValueChange(handler);
    }

    jsonConditionHandler(condition: object) {
        function handler() {
            if (jsonLogic.apply(condition['condition'], this.group.controls)) {
                this.render.removeClass(this.elemRef.nativeElement, 'hidden');
            }
            else {
                this.render.addClass(this.elemRef.nativeElement, 'hidden');
            }
        }
        this.detectGroupValueChange(handler);
    }


    onValueChange(value: SimpleChange) {
        if (value) {
            this.formComponent.getDependentData(this.flexiLabel, value);
        }
        return;
    }

    onStatusChange(status: string): void {
        if (status == 'INVALID') {
            this.addCssClass('fieldClasses', 'is-invalid');
            this.addCssClass('labelClasses', 'text-danger');
            this.removeCssClass('labelClasses', 'valid-field-label');
        } else if (status == 'VALID') {
            this.removeCssClass('fieldClasses', 'is-invalid');
            this.removeCssClass('labelClasses', 'text-danger');
            this.addCssClass('labelClasses', 'valid-field-label');
        }
    }

    removeCssClass(targetKey: string, classStr: string): boolean {
        if (!this.defaultClasses[targetKey]) {
            return false;
        }
        this.defaultClasses[targetKey][classStr] = false;
        return true;
    }

    addCssClass(targetKey: string, classStr: string): boolean {
        if (!this.defaultClasses[targetKey]) {
            return false;
        }
        if (this.hasCssClass(targetKey, classStr)) {
            return true;
        }
        this.defaultClasses[targetKey][classStr] = true;
        return true;
    }

    toggleCssClass(targetKey: string, classStr: string): boolean {
        if (this.hasCssClass(targetKey, classStr)) {
            return this.removeCssClass(targetKey, classStr);
        } else {
            return this.addCssClass(targetKey, classStr);
        }
    }

    hasCssClass(targetKey: string, classStr: string): boolean {
        return this.defaultClasses[targetKey] && this.defaultClasses[targetKey][classStr];
    }

    applyDefaultValidations(): void {
        if (this.config.validations) {
            this.applyNgValidators();
        }
        if (this.config.customValidations) {
            this.applyCustomValidations();
        }

        if (this.config.formClassValidations) {
            this.applyFormClassValidations();
        }

        if (this.config.jsonValidations) {
            this.applyJsonValidations();
        }
        this.control.setValidators(this.validators);
    }

    applyNgValidators(): void {
        this.validators = this.validators.concat(this.validator.getValidators(this.config.validations));
        this.errors = this.validator.transformToValidErr(this.config.validations);
    }

    applyCustomValidations(): void {
        try {
            let validations = this.config.customValidations;
            for (let name in validations) {
                let validation = validations[name];
                let fn: any = validation.validatorFn;
                let message: string = validation.message;
                if (typeof fn == 'function') {
                    this.validators.push(fn);
                    let errObj = {
                        name,
                        message
                    };
                    this.errors.push(errObj)
                } else {
                    console.log(`Given validator is not a function for validation ${name} for field ${this.flexiLabel}`);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    applyFormClassValidations(): void {
        try {
            if (!this.form) {
                console.log(`Form class instance not found in field for applying form class validations for field ${this.config.code}`);
                return;
            }
            let validations = this.config.formClassValidations;
            for (let validationName in validations) {
                let validation = validations[validationName];
                let validatorFunc = validation.validatorFuncName;
                let errorMessage = validation.message;

                if (this.form[validatorFunc] && typeof this.form[validatorFunc] == 'function') {
                    this.control.setAsyncValidators(this.form[validatorFunc].bind(this.form));
                    let errorObj = {
                        name: validationName,
                        message: errorMessage
                    };
                    this.errors.push(errorObj);
                } else {
                    console.log(`Form class validator function ${validatorFunc} does not exist for ${validationName} custom validation for field ${this.config.code}.`);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    applyJsonValidations() {
        let json = this.config.jsonValidations;
        let fn = function (control: AbstractControl): { [key: string]: boolean } | null { if (jsonLogic.apply(json['json'], control) != true) { return { 'json': true }; } return null; }
        this.validators.push(fn);
        let errorObj = {
            name: 'json',
            message: json['message']
        };
        this.errors.push(errorObj);
    }

    initFieldStyle() {
        this.defaultClasses = this.getFieldClasses();
        this.style = this.getFieldStyles();
        this.style = _.assign({}, this.style, this.config.style);
    }

    getFieldClasses() {
        let config = this.config;
        let type = config.type;
        let labelPosition = 'top';
        let customCssClass = config.customCssClass || '';

        if (!config.hideLabel && config.labelPosition) {
            labelPosition = config.labelPosition;
        }

        let fieldContainerClasses = {};
        let classesStr = `form-field-container ${type}-container`;
        if (config.prefix || config.suffix) {
            classesStr += ' input-group';
        }
        fieldContainerClasses = this._makeCssClassesObj(classesStr);

        let fieldMainWrapperClasses = {};
        classesStr = `fe-field ${type}-container form-group`;
        if (config.hidden) {
            classesStr += ' hidden';
        }
        fieldMainWrapperClasses = this._makeCssClassesObj(classesStr);

        let fieldLabelContainerClasses = {};
        classesStr = `fe-field-container field-label-container ${type}-label-container`;
        if (config.hideLabel) {
            classesStr += ' hidden';
        }
        if (this.hasTextLenghtLimit) {
            classesStr += ' has-text-limit';
        }
        fieldLabelContainerClasses = this._makeCssClassesObj(classesStr);

        let fieldWrapperClasses = {};
        classesStr = `field-wrapper ${type}-field-wrapper field-label-${labelPosition}`;
        fieldWrapperClasses = this._makeCssClassesObj(classesStr);

        let fieldDescWrapperClasses = {};
        classesStr = `field-desc-container ${type}-desc-cont`;
        fieldDescWrapperClasses = this._makeCssClassesObj(classesStr);

        let fieldDescContainerClasses = {};
        classesStr = `form-text text-muted field-desc ${type}-desc`;
        fieldDescContainerClasses = this._makeCssClassesObj(classesStr);

        let labelClasses = {};
        classesStr = `field-label ${type}-label`;
        if (this.isMandatory) {
            classesStr += ` mandatory-field-label`;
        }
        labelClasses = this._makeCssClassesObj(classesStr);

        let fieldErrorWrapperClasses = {};
        classesStr = `field-error-wrapper ${type}-error-wrapper`;
        fieldErrorWrapperClasses = this._makeCssClassesObj(classesStr);

        let fieldClasses = {};
        classesStr = `form-field ${type}-field ${customCssClass}`;
        if (this.isMandatory) {
            classesStr += ` mandatory-field`;
        }
        fieldClasses = this._makeCssClassesObj(classesStr);

        let nestedFieldContainerClasses = {};
        classesStr = `fe-field-container fe-${type}-wrapper`;
        nestedFieldContainerClasses = this._makeCssClassesObj(classesStr);

        let classes: any = {
            fieldMainWrapperClasses,
            fieldWrapperClasses,
            fieldLabelContainerClasses,
            fieldContainerClasses,
            fieldDescWrapperClasses,
            fieldDescContainerClasses,
            labelClasses,
            fieldErrorWrapperClasses,
            fieldClasses,
            nestedFieldContainerClasses
        };
        return classes;
    }

    _makeCssClassesObj(cssClassesStr: string): any {
        let cssClassesObj = {};
        let cssClassArr = cssClassesStr.trim().split(' ')
        cssClassArr.forEach((cssClass) => {
            cssClassesObj[cssClass] = true;
        });
        return cssClassesObj;
    }

    getFieldStyles() {
        let fieldLabelContainerStyle: any = {};
        let fieldMainWrapperStyle = {};
        let config = this.config;
        let labelWidth = config.labelWidth;
        let labelMargin = config.labelMargin;

        if (labelWidth) {
            fieldLabelContainerStyle.width = `${labelWidth}px`;
        }

        let fieldWidth = this.defaultFieldWidth;
        if (config.width) {
            fieldWidth = config.width;
        }
        if (fieldWidth) {
            this.render.setStyle(this.elemRef.nativeElement, 'width', fieldWidth);
        }

        if (labelMargin) {
            let margin: string = `${labelMargin}px`;
            let marginSide: string = 'margin-top';

            switch (config.labelPosition) {
                case 'bottom': {
                    marginSide = 'margin-top';
                    break;
                }
                case 'left': {
                    marginSide = 'margin-right';
                    break;
                }
                case 'right': {
                    marginSide = 'margin-left';
                    break;
                }
                default: {
                    marginSide = 'margin-top';
                    break;
                }
            }
            fieldLabelContainerStyle[marginSide] = margin;
        }

        if (config.marginLeft) {
            fieldMainWrapperStyle['margin-left'] = config.marginLeft;
        }

        if (config.marginRight) {
            fieldMainWrapperStyle['margin-right'] = config.marginRight;
        }

        if (config.marginTop) {
            fieldMainWrapperStyle['margin-top'] = config.marginTop;
        }

        if (config.marginBottom) {
            fieldMainWrapperStyle['margin-bottom'] = config.marginBottom;
        }

        let inlineStyle = {
            fieldMainWrapperStyle,
            fieldWrapperStyle: {},
            fieldDescWrapperStyle: {},
            fieldDescContainerStyle: {},
            fieldLabelContainerStyle,
            fieldContainerdStyle: {},
            labelStyle: {},
            fieldStyle: {},
            nestedFieldContainerStyle: {}

        };
        return inlineStyle;
    }

    hasNgValidation(validationName: string) {
        return (this.config.validations && this.config.validations[validationName] && this.config.validations[validationName].value);
    }

    hasCustomValidation(validationName: string) {
        return (this.config.customValidations && this.config.customValidations[validationName]);
    }

    hasFormClassValidation(validationName: string) {
        return (this.config.formClassValidations && this.config.formClassValidations[validationName]);
    }

    hasValidation(validationName: string) {
        return (this.hasNgValidation(validationName) || this.hasCustomValidation(validationName) || this.hasFormClassValidation(validationName));
    }



    get isMandatory(): boolean {
        return (this.config.validations && this.config.validations['required'] && this.config.validations.required.value);
    }

    get flexiLabel(): string {
        return this.config.flexiLabel;
    }

    get isValid() {
        return this.control.valid;
    }

    get isInvalid() {
        return this.control.invalid;
    }

    get hasError() {
        return this.isInvalid && (this.dirty || this.touched);
    }

    get dirty() {
        return this.control.dirty;
    }

    get touched() {
        return this.control.touched;
    }
    get control(): AbstractControl {
        return this.group.controls[this.flexiLabel];
    }
    get type() {
        return this.config.type;
    }

    get defaultValue() {
        return this.config.defaultValue;
    }

    get fieldId() {
        return this.config.id;
    }

    get fieldRef() {
        return document.querySelector(`#${this.fieldId}`);
    }

    get hasTextLenghtLimit() {
        return (this.hasValidation('maxLength') || this.hasValidation('minLength'));
    }


    get resource() {
        return this.form.resource;
    }

    set value(val: any) {
        this.formComponent.setValue(this.flexiLabel, val);
    }

    get value() {
        return this.formComponent.getValue(this.flexiLabel);
    }

    get show() {
        return this._show;
    }

    set show(show) {
        this._show = show;
    }

}
