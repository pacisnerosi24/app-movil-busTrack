export const NOTIFICADOR_PORT = Symbol('NOTIFICADOR_PORT');

export interface INotificador {
  enviarAlertaCritica(idBus: string, motivo: string): Promise<void>;
}