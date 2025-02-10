import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../config/primeNg/primeng-global-imports';
import { HeaderComponent } from '../../layout/header/header.component';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      ...PRIME_NG_MODULES,
      HeaderComponent,
      ProgressBarModule],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss'
})
export class MonitorComponent implements OnInit {
  value: number = 0;
  messages: Message[] = [];
  interval: any;

  constructor(private messageService: MessageService, private ngZone: NgZone) {}

  ngOnInit() {
      this.ngZone.runOutsideAngular(() => {
          this.interval = setInterval(() => {
              this.ngZone.run(() => {
                  this.value = this.value + Math.floor(Math.random() * 10) + 1;
                  if (this.value >= 100) {
                      this.value = 100;
                      this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Process Completed' });
                      clearInterval(this.interval);
                  }
              });
          }, 2000);
      });
  }

  ngOnDestroy() {
      if (this.interval) {
          clearInterval(this.interval);
      }
  }
}
