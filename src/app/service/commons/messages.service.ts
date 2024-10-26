import { Injectable } from '@angular/core';
import { Message } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private messages: Message[] = [];

  setMessages(messages: Message[]) {
    this.messages = messages;
  }

  getMessages(): Message[] {
    const msgs = this.messages;
    this.clearMessages(); // Limpia los mensajes después de obtenerlos para evitar que se muestren repetidamente
    return msgs;
  }

  clearMessages() {
    this.messages = [];
  }
}
