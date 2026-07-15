import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { INotificador } from '../../../aplicacion/puertos/notificador.interface';

@Injectable()
export class TelegramNotificadorService implements INotificador {
  private readonly logger = new Logger(TelegramNotificadorService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async enviarAlertaCritica(idBus: string, motivo: string, latitud?: number, longitud?: number): Promise<void> {
    if (!this.botToken || !this.chatId) {
      this.logger.error('Faltan credenciales de Telegram en las variables de entorno.');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      let mensaje = `🚨 *ALERTA CRÍTICA EN BUS ${idBus}* 🚨\n\n*Motivo:* ${motivo}\n*Fecha:* ${new Date().toLocaleString()}`;

      // Si llegaron las coordenadas, armamos el link de Google Maps
      if (latitud && longitud) {
        const urlMapa = `https://www.google.com/maps?q=${latitud},${longitud}`;
        mensaje += `\n*Ubicación GPS:* [📍 Ver en Google Maps](${urlMapa})`;
      }

      await axios.post(url, {
        chat_id: this.chatId,
        text: mensaje,
        parse_mode: 'Markdown',
        disable_web_page_preview: false // Asegura que Telegram cargue la vista previa del mapa
      });

      this.logger.log(`Notificación enviada exitosamente a Telegram por el bus ${idBus}`);
    } catch (error) {
      this.logger.error('Error al enviar el mensaje a Telegram', error);
    }
  }
  
}