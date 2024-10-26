import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export class Util {
    public static filterAlphanumeric(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[^a-zA-Z0-9ñÑ ]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static filterNumeric(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[^0-9]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static filterAlphabets(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[^a-zA-ZñÑ ]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static filterAlphabetsGuiones(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[^a-zA-ZñÑ\-]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static filterSpecialCharacters(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[#!&¡¿?\/*+()%= ]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static filterAlphanumericoSinEspacio(event: Event, myForm: FormGroup): void {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/[^a-zA-Z0-9ñÑ]/g, '');
        myForm.get(input.id)?.setValue(input.value, { emitEvent: false });
    }

    public static convertDateFormatyyyymmddToddmmyyyy(dateString: String): string {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        
        return formattedDate;
    }

    public static formatToFullDateString(dateString: string) {
        const dateObject = new Date(dateString);
    
        return dateObject.toString();
    }

    public static convertFormatDateyyyymmddhhmmsstoddmmyyyy(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getMonth() devuelve el mes de 0 (enero) a 11 (diciembre)
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    public static convertToISO(dateString: string): string {
        const date = new Date(dateString);
    
        const timezoneOffsetInMinutes = date.getTimezoneOffset();
        
        date.setMinutes(date.getMinutes() - timezoneOffsetInMinutes);
        
        return date.toISOString().split('Z')[0] + "+00:00";
    }

    public static convertStringISOToDate(dateString: string): Date {
        const date = new Date(dateString);
        
        return date;
    }

    public static stringToDate(_date: string, _format: string, _delimiter: string) {
      const formatItems = _format.split(_delimiter);
      const dateItems = _date.split(_delimiter);
  
      const dayIndex = formatItems.indexOf('dd');
      const monthIndex = formatItems.indexOf('mm');
      const yearIndex = formatItems.indexOf('yyyy');
  
      const day = parseInt(dateItems[dayIndex], 10);
      const month = parseInt(dateItems[monthIndex], 10) - 1; // Los meses en JavaScript van de 0 a 11
      const year = parseInt(dateItems[yearIndex], 10);
  
      return new Date(year, month, day);
    }

    public static formatDate(date: Date): string {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2); // Los meses van de 0 a 11
      const year = date.getFullYear();
    
      return `${day}/${month}/${year}`;
    }

    public static isFieldRequired(controlName: string, myForm: FormGroup): boolean {
        const control = myForm.get(controlName);
        return control?.hasValidator(Validators.required) || false;
    }

    public static phoneValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          if (value) {
            const isValidLength = value.length >= 7;
            return isValidLength ? null : { phoneLength: true };
          }
          return null;
        };
    }

    public static nifNieCifValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          if (!value) {
            return null; // No validar si el campo está vacío
          }
      
          const isNifValid = this.validateNIF(value);
          const isNieValid = this.validateNIE(value);
          const isCifValid = this.validateCIF(value);
      
          return isNifValid || isNieValid || isCifValid ? null : { invalidIdentifier: true };
        };
    }
      
    static validateNIF(nif: string): boolean {
        const nifRegex = /^[0-9]{8}[A-Z]$/;
        if (!nifRegex.test(nif)) {
          return false;
        }
      
        const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const letter = nif.charAt(8);
        const number = parseInt(nif.substring(0, 8), 10);
      
        return letter === letters[number % 23];
    }

    static validateNIE(nie: string): boolean {
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
        if (!nieRegex.test(nie)) {
          return false;
        }
      
        const niePrefix: { [key: string]: number } = { X: 0, Y: 1, Z: 2 };
        const nieNumber = nie.replace(/[XYZ]/, match => niePrefix[match as keyof typeof niePrefix].toString());
      
        return this.validateNIF(nieNumber);
      }
      
    static validateCIF(cif: string): boolean {
        const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
        if (!cifRegex.test(cif)) {
          return false;
        }
      
        const control = cif[8];
        const letters = 'JABCDEFGHI';
        const number = cif.substring(1, 8);
      
        let evenSum = 0;
        let oddSum = 0;
      
        for (let i = 0; i < number.length; i++) {
          const digit = parseInt(number[i], 10);
          if (i % 2 === 0) {
            oddSum += digit * 2 > 9 ? digit * 2 - 9 : digit * 2;
          } else {
            evenSum += digit;
          }
        }
      
        const totalSum = evenSum + oddSum;
        const calculatedControl = (10 - (totalSum % 10)) % 10;
      
        return control === letters[calculatedControl] || control === calculatedControl.toString();
    }

    public static transformToUppercase(event: Event, myForm: FormGroup) {
        const input = event.target as HTMLInputElement;
        const control = myForm.get(input.id);
        if (control) {
          control.setValue(control.value.toUpperCase(), { emitEvent: false });
        }
      }
}