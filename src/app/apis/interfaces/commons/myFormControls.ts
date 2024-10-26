import { AbstractControl } from "@angular/forms";

export interface MyFormControls {
    [key: string]: AbstractControl<any, any>;
  }