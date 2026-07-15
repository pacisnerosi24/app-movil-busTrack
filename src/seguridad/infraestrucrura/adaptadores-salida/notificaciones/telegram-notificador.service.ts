import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { INotificador } from '../../../aplicacion/puertos/notificador.interface';

@Injectable()
export class TelegramNotificadorService implements INotificador {
  private readonly logger = new Logger(TelegramNotificadorService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async enviarAlertaCritica(idBus: string, motivo: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      this.logger.error('Faltan credenciales de Telegram en las variables de entorno.');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const mensaje = `🚨 *ALERTA CRÍTICA EN BUS ${idBus}* 🚨\n\n*Motivo:* ${motivo}\n*Fecha:* ${new Date().toLocaleString()}`;

      await axios.post(url, {
        chat_id: this.chatId,
        text: mensaje,
        parse_mode: 'Markdown' // Permite enviar texto en negrita, cursiva, etc.
      });

      this.logger.log(`Notificación enviada exitosamente a Telegram por el bus ${idBus}`);
    } catch (error) {
      this.logger.error('Error al enviar el mensaje a Telegram', error);
      // Nota: No lanzamos la excepción para que no interrumpa el flujo principal si Telegram falla.
    }
  }
}