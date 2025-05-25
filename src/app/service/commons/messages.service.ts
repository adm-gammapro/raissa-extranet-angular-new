import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private _message: string | null = null;

  setMessages(message: string): void {
    this._message = message;
  }

  getMessages(): string | null {
    const message = this._message;
    this._message = null; // Limpia el mensaje después de obtenerlo
    return message;
  }

  /*private messages: Message[] = [];

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
  }*/
}
